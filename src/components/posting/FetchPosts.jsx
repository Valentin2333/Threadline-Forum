import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNewestPosts, updatePost, deletePost } from "../../api/posts";
import { updateComment, deleteComment } from "../../api/comments";
import CreateComment from "../posting/CreateComment";
import AvatarFromStorage from "./AvatarFromStorage";
import useAuthUser from "../navigation/hooks/useAuthUser";
import PostVotes from "./PostVotes";

import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";

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
    errs.title = "Title must be 16-64 characters.";
  if (m.includes("post_content_length"))
    errs.content = "Content must be 32-8192 characters.";

  if (!errs.title && m.includes("title")) errs.title = "Invalid title.";
  if (!errs.content && m.includes("content")) errs.content = "Invalid content.";

  return errs;
};

const FetchPosts = ({ refreshTrigger }) => {
  const navigate = useNavigate();
  const user = useAuthUser();

  const [posts, setPosts] = useState([]);
  const [expandedCommentsByPostId, setExpandedCommentsByPostId] = useState({});

  // "3 dots" menu toggles
  const [openMenuForPostId, setOpenMenuForPostId] = useState(null);
  const [openMenuForCommentId, setOpenMenuForCommentId] = useState(null);

  // Editing state
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostDraft, setEditingPostDraft] = useState({
    title: "",
    content: "",
  });
  const [postFieldErrors, setPostFieldErrors] = useState({
    title: "",
    content: "",
  });

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentDraft, setEditingCommentDraft] = useState("");
  const [commentFieldError, setCommentFieldError] = useState("");

  const [serverError, setServerError] = useState("");

  const userId = useMemo(() => user?.id ?? null, [user]);

  const loadPosts = async () => {
    try {
      const data = await getNewestPosts();
      setPosts(data ?? []);
    } catch (err) {
      console.error("Failed loading posts:", err.message);
      setServerError(err?.message || "Failed loading posts.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    loadPosts();
  }, [refreshTrigger]);

  const isOwn = (authorId) =>
    Boolean(userId && authorId && userId === authorId);

  const startEditPost = (post) => {
    setServerError("");
    setPostFieldErrors({ title: "", content: "" });
    setOpenMenuForPostId(null);

    setEditingPostId(post.id);
    setEditingPostDraft({
      title: post.title ?? "",
      content: post.content ?? "",
    });
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditingPostDraft({ title: "", content: "" });
    setPostFieldErrors({ title: "", content: "" });
    setServerError("");
  };

  const saveEditPost = async (postId) => {
    setServerError("");

    const errs = validatePost(editingPostDraft);
    setPostFieldErrors({
      title: errs.title || "",
      content: errs.content || "",
    });

    if (Object.keys(errs).length > 0) return;

    try {
      await updatePost({
        postId,
        title: editingPostDraft.title.trim(),
        content: editingPostDraft.content.trim(),
      });

      cancelEditPost();
      await loadPosts();
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

  const confirmAndDeletePost = async (postId) => {
    setOpenMenuForPostId(null);
    setServerError("");

    const ok = window.confirm("Delete this post? This cannot be undone.");
    if (!ok) return;

    try {
      await deletePost({ postId });

      // If you were editing this post, reset edit state
      if (editingPostId === postId) cancelEditPost();

      await loadPosts();
    } catch (e) {
      setServerError(e?.message || "Failed to delete post.");
    }
  };

  const startEditComment = (comment) => {
    setServerError("");
    setCommentFieldError("");
    setOpenMenuForCommentId(null);

    setEditingCommentId(comment.id);
    setEditingCommentDraft(comment.content ?? "");
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentDraft("");
    setCommentFieldError("");
    setServerError("");
  };

  const saveEditComment = async (commentId) => {
    setServerError("");

    const trimmed = (editingCommentDraft ?? "").trim();
    if (!trimmed) {
      setCommentFieldError("Content required");
      return;
    }

    try {
      await updateComment({ commentId, content: trimmed });

      cancelEditComment();
      await loadPosts();
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

      await loadPosts();
    } catch (e) {
      setServerError(e?.message || "Failed to delete comment.");
    }
  };

  return (
    <div className="py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="mb-0">Latest Posts</h2>
      </div>

      {serverError && (
        <Alert variant="danger" className="py-2">
          {serverError}
        </Alert>
      )}

      {posts.length === 0 && <Alert variant="secondary">No posts yet</Alert>}

      {posts.map((post) => {
        const ownPost = isOwn(post.author_id);

        const sortedComments = (post.comments ?? [])
          .slice()
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        const isExpanded = !!expandedCommentsByPostId[post.id];
        const visibleComments =
          sortedComments.length > 2 && !isExpanded
            ? sortedComments.slice(0, 2)
            : sortedComments;

        return (
          <Card key={post.id} className="mb-3 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      variant="link"
                      className="p-0 text-decoration-none"
                      onClick={() => navigate(`/posts/${post.id}`)}
                      title="Open post details"
                    >
                      <span className="h5 mb-0 text-decoration-underline">
                        {post.title}
                      </span>
                    </Button>
                    <Badge bg="secondary">Score: {post.score}</Badge>
                  </div>

                  <div className="mt-2">
                    <PostVotes postId={post.id} onVoted={loadPosts} />
                  </div>
                </div>

                {ownPost && (
                  <Dropdown align="end" show={openMenuForPostId === post.id}>
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      size="sm"
                      bsPrefix="btn"
                      onClick={() => {
                        setOpenMenuForCommentId(null);
                        setOpenMenuForPostId((cur) =>
                          cur === post.id ? null : post.id,
                        );
                      }}
                    >
                      ⋯
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => {
                          setOpenMenuForPostId(null);
                          startEditPost(post);
                        }}
                      >
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="text-danger"
                        onClick={() => {
                          setOpenMenuForPostId(null);
                          confirmAndDeletePost(post.id);
                        }}
                      >
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>

              {/* Post content or edit form */}
              {editingPostId === post.id ? (
                <div className="mt-3">
                  <Form.Group className="mb-2">
                    <Form.Label className="small text-muted">Title</Form.Label>
                    <Form.Control
                      value={editingPostDraft.title}
                      onChange={(e) => {
                        setEditingPostDraft((d) => ({
                          ...d,
                          title: e.target.value,
                        }));
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
                    <Form.Label className="small text-muted">
                      Content
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={editingPostDraft.content}
                      onChange={(e) => {
                        setEditingPostDraft((d) => ({
                          ...d,
                          content: e.target.value,
                        }));
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
                    <Button size="sm" onClick={() => saveEditPost(post.id)}>
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

              {/* Add comment composer (always visible) */}
              <div className="mt-3">
                <CreateComment postId={post.id} onCommentCreated={loadPosts} />
              </div>

              {/* Comments */}
              <div className="mt-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h4 className="h6 mb-0">Comments</h4>

                  {sortedComments.length > 2 && (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() =>
                        setExpandedCommentsByPostId((m) => ({
                          ...m,
                          [post.id]: !isExpanded,
                        }))
                      }
                    >
                      {isExpanded
                        ? "Hide"
                        : `Show all (${sortedComments.length})`}
                    </Button>
                  )}
                </div>

                {sortedComments.length === 0 && (
                  <div className="text-muted small">No comments yet</div>
                )}

                <ListGroup variant="flush">
                  {visibleComments.map((comment) => {
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
                                    value={editingCommentDraft}
                                    onChange={(e) => {
                                      setEditingCommentDraft(e.target.value);
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
                                      onClick={() =>
                                        saveEditComment(comment.id)
                                      }
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
                                {new Date(comment.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {ownComment && (
                            <Dropdown
                              align="end"
                              show={openMenuForCommentId === comment.id}
                            >
                              <Dropdown.Toggle
                                variant="outline-secondary"
                                size="sm"
                                bsPrefix="btn"
                                onClick={() => {
                                  setOpenMenuForPostId(null);
                                  setOpenMenuForCommentId((cur) =>
                                    cur === comment.id ? null : comment.id,
                                  );
                                }}
                              >
                                ⋯
                              </Dropdown.Toggle>

                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() => {
                                    setOpenMenuForCommentId(null);
                                    startEditComment(comment);
                                  }}
                                >
                                  Edit
                                </Dropdown.Item>
                                <Dropdown.Item
                                  className="text-danger"
                                  onClick={() => {
                                    setOpenMenuForCommentId(null);
                                    confirmAndDeleteComment(comment.id);
                                  }}
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
        );
      })}
    </div>
  );
};

export default FetchPosts;
