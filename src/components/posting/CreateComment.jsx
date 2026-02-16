import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../api/supabaseClient";
import { createComment } from "../../api/comments";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import InputGroup from "react-bootstrap/InputGroup";
import Spinner from "react-bootstrap/Spinner";

/**
 * Comment composer:
 * - textbox + send button
 * - submit on Enter (Shift+Enter inserts newline)
 * - no React Hook Form `watch()` (avoids React Compiler incompatible-library warning)
 */
const CreateComment = ({ postId, onCommentCreated, onCancel }) => {
  const [serverError, setServerError] = useState("");
  const [draft, setDraft] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { content: "" },
  });

  const isEmpty = !draft.trim();

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
      setDraft("");
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

  const reg = register("content", {
    required: "Comment is required",
    minLength: { value: 1, message: "Comment cannot be empty" },
    maxLength: { value: 8192, message: "Max 8192 chars" },
  });

  return (
    <div className="mt-2">
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
              // keep both local UI state + RHF state in sync
              setDraft(e.target.value);
              setValue("content", e.target.value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            onKeyDown={(e) => {
              // Enter submits; Shift+Enter adds newline
              if (e.key === "Enter" && !e.shiftKey) {
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
              <>
                <Spinner size="sm" className="me-2" /> Sending…
              </>
            ) : (
              "Send"
            )}
          </Button>

          {onCancel && (
            <Button type="button" variant="outline-secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </InputGroup>

        {errors.content && (
          <div className="text-danger small mt-1">{errors.content.message}</div>
        )}
      </Form>

      <div className="text-muted small mt-1">
        Press Enter to send, Shift+Enter for a new line.
      </div>
    </div>
  );
};

export default CreateComment;
