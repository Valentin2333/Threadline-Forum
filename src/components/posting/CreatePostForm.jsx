import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../api/supabaseClient";
import { createPost } from "../../api/posts";

import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Collapse from "react-bootstrap/Collapse";
import { Container } from "react-bootstrap";

const CreatePostForm = ({ onPostCreated }) => {
  const [serverError, setServerError] = useState("");
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [open, setOpen] = useState(false);

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
    mode: "onSubmit",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoadingUser(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (data) => {
    setServerError("");

    if (!user) {
      setServerError("You must be logged in to post.");
      return;
    }

    // Defensive: data is already trimmed by setValueAs, but keep it safe.
    const title = (data.title ?? "").trim();
    const content = (data.content ?? "").trim();

    try {
      await createPost({
        userId: user.id,
        title,
        content,
      });

      reset();
      setOpen(false); // optionally collapse after creating
      onPostCreated?.();
    } catch (err) {
      const msg = err?.message || "Unknown error";
      if (msg.toLowerCase().includes("row-level security")) {
        setServerError("You are blocked and cannot create posts.");
      } else {
        setServerError(msg);
      }
    }
  };

  if (loadingUser) return null;
  if (!user) return null;

  return (
    <Container>
      <div className="d-flex justify-content-end mb-3">
        <Button
          variant={open ? "secondary" : "primary"}
          onClick={() => setOpen((v) => !v)}
          aria-controls="create-post-collapse"
          aria-expanded={open}
        >
          {open ? "Hide form" : "New post"}
        </Button>
      </div>

      <Collapse in={open}>
        <div id="create-post-collapse">
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
                      // TRIM BEFORE VALIDATION:
                      setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                      required: "Title required",
                      minLength: { value: 16, message: "Min 16 chars" },
                      maxLength: { value: 64, message: "Max 64 chars" },
                    })}
                    isInvalid={!!errors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    16–64 characters.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Post content"
                    {...register("content", {
                      // TRIM BEFORE VALIDATION:
                      setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                      required: "Content required",
                      minLength: { value: 32, message: "Min 32 chars" },
                      maxLength: { value: 8192, message: "Max 8192 chars" },
                    })}
                    isInvalid={!!errors.content}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.content?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    32–8192 characters.
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => {
                      reset();
                      setServerError("");
                      setOpen(false);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating…" : "Create Post"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Collapse>
    </Container>
  );
};

export default CreatePostForm;
