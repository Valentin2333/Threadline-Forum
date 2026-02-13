import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../api/supabaseClient";
import { createComment } from "../api/comments";

const CreateComment = ({ postId, onCommentCreated, onCancel }) => {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { content: "" },
  });

  const onSubmit = async ({ content }) => {
    setServerError("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setServerError("You must be logged in to comment.");
      return;
    }

    try {
      await createComment({
        userId: user.id,
        postId,
        content,
      });

      reset();
      onCommentCreated?.();
      onCancel?.();
    } catch (err) {
      const msg = err?.message || "Unknown error";
      if (msg.toLowerCase().includes("row-level security")) {
        setServerError("You are blocked and cannot create comments.");
      } else {
        setServerError(msg);
      }
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      {serverError && <p style={{ color: "crimson" }}>{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <textarea
          rows={3}
          style={{ width: "100%" }}
          placeholder="Write a comment..."
          {...register("content", {
            required: "Comment is required",
            minLength: { value: 1, message: "Comment cannot be empty" },
            maxLength: { value: 8192, message: "Max 8192 chars" },
          })}
        />
        {errors.content && <p style={{ color: "crimson" }}>{errors.content.message}</p>}

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "Post comment"}
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateComment;
