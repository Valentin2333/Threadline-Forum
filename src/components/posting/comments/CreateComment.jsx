import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../../api/supabaseClient";
import { createComment } from "../../../api/comments";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import InputGroup from "react-bootstrap/InputGroup";
import Spinner from "react-bootstrap/Spinner";

const CreateComment = ({ postId, onCommentCreated }) => {
  const [serverError, setServerError] = useState("");
  const [draft, setDraft] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { content: "" },
  });

  const isEmpty = !draft.trim();

  const onSubmit = async ({ content }) => {
    setServerError("");

    const trimmed = (content ?? "").trim();
    if (!trimmed) return;

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
        content: trimmed,
      });

      reset();
      setDraft("");
      onCommentCreated?.();
    } catch (err) {
      const msg = err?.message || "Unknown error";
      if (msg.toLowerCase().includes("row-level security")) {
        setServerError("You are blocked and cannot create comments.");
      } else {
        setServerError(msg);
      }
    }
  };

  const reg = register("content", {
    setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
    maxLength: { value: 8192, message: "Max 8192 chars" },
  });

  return (
    <div className="mt-2 fs-comment-input">
      {serverError && (
        <Alert variant="danger" className="py-2 mb-2">
          {serverError}
        </Alert>
      )}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <InputGroup>
          <Form.Control
            as="textarea"
            rows={1}
            placeholder="Write a comment…"
            aria-label="Write a comment"
            value={draft}
            {...reg}
            onChange={(e) => {
              const v = e.target.value;
              setDraft(v);
              setValue("content", v, {
                shouldValidate: false,
                shouldDirty: true,
              });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                const val = e.currentTarget.value ?? "";
                if (!val.trim()) {
                  e.preventDefault();
                  return;
                }
                e.preventDefault();
                handleSubmit(onSubmit)();
              }
            }}
          />

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || isEmpty}
            aria-label="Send comment"
          >
            {isSubmitting ? (
              <Spinner size="sm" />
            ) : (
              <i className="fa-solid fa-paper-plane" style={{ fontSize: 13 }} />
            )}
          </Button>
        </InputGroup>
      </Form>
    </div>
  );
};

export default CreateComment;
