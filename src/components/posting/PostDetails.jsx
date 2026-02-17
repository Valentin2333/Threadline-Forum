import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPostById, updatePost, deletePost } from "../../api/posts";
import { updateComment, deleteComment } from "../../api/comments";
import CreateComment from "./CreateComment";
import AvatarFromStorage from "./AvatarFromStorage";
import useAuthUser from "../navigation/hooks/useAuthUser";

import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import PostVotes from "./PostVotes";

const validatePost = ({ title, content }) => {
  const errs = {};
  const t = (title ?? "").trim();
  const c = (content ?? "").trim();

  if (!t) errs.title = "Title required";
  else if (t.length < 16) errs.title = "Min 16 chars";
  else if (t.length > 64) errs.title = "Max 64 chars";

  if (!c) errs.content = "Content required";
  else if (c.length < 32) errs.content = "Min 32 chars";
  else if (c.length > 8192) errs.content = "Max 8192 chars";

  return errs;
};

const mapDbErrorToFields = (msg = "") => {
  const m = msg.toLowerCase();
  const errs = {};

  if (m.includes("post_title_length"))
    errs.title = "Title must be 16–64 characters.";
  if (m.includes("post_content_length"))
    errs.content = "Content must be 32–8192 characters.";

  if (!errs.title && m.includes("title")) errs.title = "Invalid title.";
  if (!errs.content && m.includes("content")) errs.content = "Invalid content.";

  return errs;
};

const PostDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const user = useAuthUser();

  const [post, setPost] = useState(null);

  const [initialLoading, setInitialLoading] = useState(true);

  const [openPostMenu, setOpenPostMenu] = useState(false);
  const [openMenuForCommentId, setOpenMenuForCommentId] = useState(null);

  const [editingPost, setEditingPost] = useState(false);
  const [postDraft, setPostDraft] = useState({ title: "", content: "" });
  const [postFieldErrors, setPostFieldErrors] = useState({
    title: "",
    content: "",
  });

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentFieldError, setCommentFieldError] = useState("");

  const [serverError, setServerError] = useState("");

  const userId = useMemo(() => user?.id ?? null, [user]);
  const isOwn = (authorId) =>
    Boolean(userId && authorId && userId === authorId);

  const load = async ({ silent = false } = {}) => {
    try {
      setServerError("");
      if (!silent) setInitialLoading(true);

      const data = await getPostById(postId);
      setPost(data);
    } catch (e) {
      setServerError(e?.message || "Failed to load post.");
      setPost(null);
    } finally {
      if (!silent) setInitialLoading(false);
    }
  };

  useEffect(() => {
    load({ silent: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const startEditPost = () => {
    setOpenPostMenu(false);
    setServerError("");
    setPostFieldErrors({ title: "", content: "" });

    setEditingPost(true);
    setPostDraft({ title: post?.title ?? "", content: post?.content ?? "" });
  };

  const cancelEditPost = () => {
    setEditingPost(false);
    setPostDraft({ title: "", content: "" });
    setPostFieldErrors({ title: "", content: "" });
    setServerError("");
  };

  const saveEditPost = async () => {
    if (!post?.id) return;

    setServerError("");

    const errs = validatePost(postDraft);
    setPostFieldErrors({
      title: errs.title || "",
      content: errs.content || "",
    });
    if (Object.keys(errs).length > 0) return;

    try {
      await updatePost({
        postId: post.id,
        title: postDraft.title.trim(),
        content: postDraft.content.trim(),
      });

      cancelEditPost();
      await load({ silent: true });
    } catch (e) {
      const msg = e?.message || "Failed to update post.";
      const dbErrs = mapDbErrorToFields(msg);

      if (dbErrs.title || dbErrs.content) {
        setPostFieldErrors({
          title: dbErrs.title || "",
          content: dbErrs.content || "",
        });
      } else {
        setServerError(msg);
      }
    }
  };

  const confirmAndDeletePost = async () => {
    setOpenPostMenu(false);
    setServerError("");

    const ok = window.confirm("Delete this post? This cannot be undone.");
    if (!ok) return;

    try {
      await deletePost({ postId: post.id });
      navigate("/posts");
    } catch (e) {
      setServerError(e?.message || "Failed to delete post.");
    }
  };

  const startEditComment = (comment) => {
    setOpenMenuForCommentId(null);
    setServerError("");
    setCommentFieldError("");

    setEditingCommentId(comment.id);
    setCommentDraft(comment.content ?? "");
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setCommentDraft("");
    setCommentFieldError("");
    setServerError("");
  };

  const saveEditComment = async (commentId) => {
    setServerError("");

    const trimmed = (commentDraft ?? "").trim();
    if (!trimmed) {
      setCommentFieldError("Content required");
      return;
    }

    try {
      await updateComment({ commentId, content: trimmed });
      cancelEditComment();
      await load({ silent: true }); // ✅ no page flash
    } catch (e) {
      setServerError(e?.message || "Failed to update comment.");
    }
  };

  const confirmAndDeleteComment = async (commentId) => {
    setOpenMenuForCommentId(null);
    setServerError("");

    const ok = window.confirm("Delete this comment? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteComment({ commentId });

      if (editingCommentId === commentId) cancelEditComment();

      await load({ silent: true });
    } catch (e) {
      setServerError(e?.message || "Failed to delete comment.");
    }
  };

  if (initialLoading) return <div className="p-4">Loading…</div>;

  if (!post) {
    return (
      <Container className="py-3">
        <Alert variant="danger" className="py-2">
          {serverError || "Post not found."}
        </Alert>
        <Button
          as={Link}
          to="/posts"
          variant="outline-secondary"
          size="sm"
          className="d-inline-flex align-items-center gap-2"
        >
          <i className="fa-solid fa-circle-arrow-left" aria-hidden="true" />
          <span>Back to posts</span>
        </Button>
      </Container>
    );
  }

  const ownPost = isOwn(post.author_id);

  return (
    <Container className="py-3">
      <div className="mb-3">
        <Button
          as={Link}
          to="/posts"
          variant="outline-secondary"
          size="sm"
          className="d-inline-flex align-items-center gap-2"
        >
          <i className="fa-solid fa-circle-arrow-left" aria-hidden="true" />
          <span>Back to posts</span>
        </Button>
      </div>

      {serverError && (
        <Alert variant="danger" className="py-2">
          {serverError}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-start justify-content-between gap-3">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2">
                <AvatarFromStorage pathOrUrl={post.post_author?.avatar_url} />
                <div>
                  <div className="fw-semibold">
                    {post.post_author?.username || "Unknown user"}
                  </div>
                  <div className="text-muted small">
                    {new Date(post.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 mt-3">
                <h2 className="h4 mb-0">{post.title}</h2>
              </div>
            </div>

            {ownPost && (
              <Dropdown
                align="end"
                show={openPostMenu}
                onToggle={(nextShow) => {
                  if (nextShow) setOpenMenuForCommentId(null);
                  setOpenPostMenu(nextShow);
                }}
              >
                <Dropdown.Toggle
                  variant="outline-secondary"
                  size="sm"
                  bsPrefix="btn"
                >
                  <i
                    className="fa-solid fa-angle-down"
                    style={{
                      transition: "transform 0.25s ease",
                      transform: openPostMenu
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={startEditPost}>Edit</Dropdown.Item>
                  <Dropdown.Item
                    className="text-danger"
                    onClick={confirmAndDeletePost}
                  >
                    Delete
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>

          {editingPost ? (
            <div className="mt-3">
              <Form.Group className="mb-2">
                <Form.Label className="small text-muted">Title</Form.Label>
                <Form.Control
                  value={postDraft.title}
                  onChange={(e) => {
                    setPostDraft((d) => ({ ...d, title: e.target.value }));
                    setPostFieldErrors((fe) => ({ ...fe, title: "" }));
                  }}
                  placeholder="Title"
                  isInvalid={!!postFieldErrors.title}
                />
                <Form.Control.Feedback type="invalid">
                  {postFieldErrors.title}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="small text-muted">Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={postDraft.content}
                  onChange={(e) => {
                    setPostDraft((d) => ({ ...d, content: e.target.value }));
                    setPostFieldErrors((fe) => ({ ...fe, content: "" }));
                  }}
                  placeholder="Content"
                  isInvalid={!!postFieldErrors.content}
                />
                <Form.Control.Feedback type="invalid">
                  {postFieldErrors.content}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex gap-2">
                <Button size="sm" onClick={saveEditPost}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={cancelEditPost}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-3 mb-0">{post.content}</p>
          )}

          <div className="mt-2">
            <PostVotes
              postId={post.id}
              onVoted={() => load({ silent: true })}
            />
          </div>

          <div className="mt-2 d-flex align-items-center justify-content-between">
            <Badge bg="secondary">Score: {Number(post.score ?? 0)}</Badge>
            <span className="text-muted small">
              {post.comments?.length ?? 0} comments
            </span>
          </div>
          <hr className="my-4" />

          <div>
            <h3 className="h6 mb-2">Comments</h3>

            <CreateComment
              postId={post.id}
              onCommentCreated={() => load({ silent: true })}
            />

            {(post.comments ?? []).length === 0 && (
              <div className="text-muted small mt-2">No comments yet</div>
            )}

            <ListGroup variant="flush" className="mt-2">
              {(post.comments ?? [])
                .slice()
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                .map((comment) => {
                  const ownComment = isOwn(comment.author_id);

                  return (
                    <ListGroup.Item key={comment.id} className="px-0">
                      <div className="d-flex align-items-start justify-content-between gap-2">
                        <div className="d-flex align-items-start gap-2">
                          <AvatarFromStorage
                            pathOrUrl={comment.comment_author?.avatar_url}
                          />
                          <div>
                            <div className="fw-semibold">
                              {comment.comment_author?.username ||
                                "Unknown user"}
                            </div>

                            {editingCommentId === comment.id ? (
                              <div className="mt-2">
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  value={commentDraft}
                                  onChange={(e) => {
                                    setCommentDraft(e.target.value);
                                    setCommentFieldError("");
                                  }}
                                  placeholder="Edit comment"
                                  isInvalid={!!commentFieldError}
                                />
                                {commentFieldError && (
                                  <div className="text-danger small mt-1">
                                    {commentFieldError}
                                  </div>
                                )}
                                <div className="d-flex gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => saveEditComment(comment.id)}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={cancelEditComment}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-1">{comment.content}</div>
                            )}

                            <div className="text-muted small mt-1">
                              {new Date(comment.created_at).toLocaleString(
                                "en-GB",
                              )}
                            </div>
                          </div>
                        </div>

                        {ownComment && (
                          <Dropdown
                            align="end"
                            show={openMenuForCommentId === comment.id}
                            onToggle={(nextShow) => {
                              if (nextShow) setOpenPostMenu(false);
                              setOpenMenuForCommentId(
                                nextShow ? comment.id : null,
                              );
                            }}
                          >
                            <Dropdown.Toggle
                              variant="outline-secondary"
                              size="sm"
                              bsPrefix="btn"
                            >
                              <i
                                className="fa-solid fa-angle-down"
                                style={{
                                  transition: "transform 0.25s ease",
                                  transform:
                                    openMenuForCommentId === comment.id
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",
                                }}
                              />
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              <Dropdown.Item
                                onClick={() => startEditComment(comment)}
                              >
                                Edit
                              </Dropdown.Item>
                              <Dropdown.Item
                                className="text-danger"
                                onClick={() =>
                                  confirmAndDeleteComment(comment.id)
                                }
                              >
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </div>
                    </ListGroup.Item>
                  );
                })}
            </ListGroup>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PostDetails;
