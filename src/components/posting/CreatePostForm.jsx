import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../api/supabaseClient";
import { createPost } from "../../api/posts";

import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

const CreatePostForm = ({ onPostCreated }) => {
  const [serverError, setServerError] = useState("");
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    // initial user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoadingUser(false);
    });

    // keep in sync on login/logout
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (data) => {
    setServerError("");

    if (!user) {
      // should not happen because form is hidden, but keeps it safe
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
      onPostCreated?.(); // refresh posts
    } catch (err) {
      const msg = err?.message || "Unknown error";
      if (msg.toLowerCase().includes("row-level security")) {
        setServerError("You are blocked and cannot create posts.");
      } else {
        setServerError(msg);
      }
    }
  };

  // Hide the whole form while auth is loading
  if (loadingUser) return null;

  // Hide the form completely if not authenticated
  if (!user) return null;

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Card.Title as="h2" className="h4 mb-3">
          Create Post
        </Card.Title>

        {serverError && (
          <Alert variant="danger" className="py-2">
            {serverError}
          </Alert>
        )}

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              placeholder="Post title"
              {...register("title", {
                required: "Title required",
                minLength: { value: 16, message: "Min 16 chars" },
                maxLength: { value: 64, message: "Max 64 chars" },
              })}
              isInvalid={!!errors.title}
            />
            <Form.Control.Feedback type="invalid">
              {errors.title?.message}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">16–64 characters.</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Post content"
              {...register("content", {
                required: "Content required",
                minLength: { value: 32, message: "Min 32 chars" },
                maxLength: { value: 8192, message: "Max 8192 chars" },
              })}
              isInvalid={!!errors.content}
            />
            <Form.Control.Feedback type="invalid">
              {errors.content?.message}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">32–8192 characters.</Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create Post"}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CreatePostForm;
