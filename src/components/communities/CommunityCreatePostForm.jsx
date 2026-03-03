import { useState } from "react";
import { useForm } from "react-hook-form";
import { createPost } from "../../api/posts";
import { uploadPostMedia } from "../../api/postMedia";

import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";
import Form from "react-bootstrap/Form";

const CommunityCreatePostForm = ({
  communityId,
  communityName,
  userId,
  onPostCreated,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [showMedia, setShowMedia] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors, isSubmitting },
  } = useForm({ defaultValues: { title: "", content: "" }, mode: "onSubmit" });

  const onSubmit = async (data) => {
    setServerError("");

    try {
      const newPost = await createPost({
        userId,
        title: data.title.trim(),
        content: data.content.trim(),
        communityId,
      });

      if (mediaFile) {
        const isVideo = mediaFile.type?.startsWith("video/");
        const maxBytes = isVideo ? 25 * 1024 * 1024 : 5 * 1024 * 1024;

        if (mediaFile.size > maxBytes) {
          throw new Error(
            isVideo ? "Video too large (max 25MB)." : "Image too large (max 5MB)."
          );
        }

        await uploadPostMedia({
          postId: newPost.id,
          userId,
          file: mediaFile,
        });
      }

      reset();
      setMediaFile(null);
      setShowMedia(false);
      setShowForm(false);
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

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <Button
          variant={showForm ? "outline-secondary" : "primary"}
          onClick={() => setShowForm((v) => !v)}
          className="px-4"
        >
          {showForm ? (
            <>
              <i className="fa-solid fa-xmark me-2" style={{ fontSize: 13 }} />
              Hide form
            </>
          ) : (
            <>
              <i className="fa-solid fa-plus me-2" style={{ fontSize: 13 }} />
              New post
            </>
          )}
        </Button>
      </div>

      <Collapse in={showForm}>
        <div>
          <Card className="mb-4">
            <Card.Body className="p-4">
              <Card.Title
                as="h2"
                className="h5 mb-3 d-flex align-items-center gap-2"
                style={{ minWidth: 0 }}
              >
                <i
                  className="fa-solid fa-pen-to-square"
                  style={{ color: "var(--fs-primary)", fontSize: 18, flexShrink: 0 }}
                />
                <span className="text-truncate" title={`Post in ${communityName}`}>
                  Post in {communityName}
                </span>
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
                    placeholder="Give your post a title..."
                    {...register("title", {
                      setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                      required: "Title required",
                      minLength: { value: 16, message: "Min 16 chars" },
                      maxLength: { value: 64, message: "Max 64 chars" },
                    })}
                    isInvalid={!!formErrors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.title?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">16–64 characters.</Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="What's on your mind?"
                    {...register("content", {
                      setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                      required: "Content required",
                      minLength: { value: 32, message: "Min 32 chars" },
                      maxLength: { value: 8192, message: "Max 8192 chars" },
                    })}
                    isInvalid={!!formErrors.content}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.content?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    32–8192 characters.
                  </Form.Text>
                </Form.Group>

                {!showMedia ? (
                  <div className="mb-3">
                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setShowMedia(true)}
                    >
                      <i className="fa-solid fa-paperclip me-2" style={{ fontSize: 13 }} />
                      Attach image/video
                    </Button>
                  </div>
                ) : (
                  <Form.Group className="mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <Form.Label className="mb-0">Attach image/video</Form.Label>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="text-muted p-0"
                        onClick={() => {
                          setShowMedia(false);
                          setMediaFile(null);
                        }}
                      >
                        <i className="fa-solid fa-xmark me-1" />
                        Remove
                      </Button>
                    </div>
                    <Form.Control
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setMediaFile(file);
                      }}
                    />
                    <Form.Text className="text-muted">
                      Images up to 5MB, videos up to 25MB.
                    </Form.Text>
                  </Form.Group>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => {
                      reset();
                      setServerError("");
                      setMediaFile(null);
                      setShowMedia(false);
                      setShowForm(false);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4"
                  >
                    {isSubmitting ? "Creating…" : "Create Post"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Collapse>
    </>
  );
};

export default CommunityCreatePostForm;