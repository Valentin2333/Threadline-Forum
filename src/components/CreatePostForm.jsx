import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../api/supabaseClient";
import { createPost } from "../api/posts";

const CreatePostForm = ({ onPostCreated }) => {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setServerError("You must be logged in to post.");
      return;
    }

    try {
      await createPost({
        userId: user.id,
        title: data.title,
        content: data.content,
      });

      reset();
      onPostCreated(); // refresh posts
    } catch (err) {
      if (err.message.includes("row-level security")) {
        setServerError("You are blocked and cannot create posts.");
      } else {
        setServerError(err.message);
      }
    }
  };

  return (
    <div style={{ marginBottom: 30 }}>
      <h2>Create Post</h2>

      {serverError && <p style={{ color: "red" }}>{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input
            placeholder="Post title"
            {...register("title", {
              required: "Title required",
              minLength: { value: 16, message: "Min 16 chars" },
              maxLength: { value: 64, message: "Max 64 chars" },
            })}
          />
          {errors.title && <p>{errors.title.message}</p>}
        </div>

        <div>
          <textarea
            placeholder="Post content"
            {...register("content", {
              required: "Content required",
              minLength: { value: 32, message: "Min 32 chars" },
              maxLength: { value: 8192, message: "Max 8192 chars" },
            })}
          />
          {errors.content && <p>{errors.content.message}</p>}
        </div>

        <button type="submit">Create Post</button>
      </form>
    </div>
  );
};

export default CreatePostForm;
