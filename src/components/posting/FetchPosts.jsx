import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNewestPosts, updatePost, deletePost } from "../../api/posts";
import { updateComment, deleteComment } from "../../api/comments";
import CreateComment from "../posting/CreateComment";
import AvatarFromStorage from "./AvatarFromStorage";
import useAuthUser from "../navigation/hooks/useAuthUser";

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

  if (m.includes("post_title_length")) errs.title = "Title must be 16–64 characters.";
  if (m.includes("post_content_length")) errs.content = "Content must be 32–8192 characters.";

  if (!errs.title && m.includes("title")) errs.title = "Invalid title.";
  if (!errs.content && m.includes("content")) errs.content = "Invalid content.";

  return errs;
};

const backdropStyle = {
  position: "fixed",
  inset: 0,
  background: "transparent",
  zIndex: 5,
};

const menuStyle = {
  position: "absolute",
  right: 0,
  top: "calc(100% + 6px)",
  border: "1px solid #ddd",
  background: "white",
  borderRadius: 8,
  padding: 6,
  minWidth: 140,
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  zIndex: 10,
};

const menuItemStyle = {
  width: "100%",
  textAlign: "left",
  padding: 8,
  border: "none",
  background: "transparent",
  cursor: "pointer",
};

const FetchPosts = ({ refreshTrigger }) => {
  const navigate = useNavigate();
  const user = useAuthUser();

  const [posts, setPosts] = useState([]);
  const [openCommentForPostId, setOpenCommentForPostId] = useState(null);

  // "3 dots" menu toggles
  const [openMenuForPostId, setOpenMenuForPostId] = useState(null);
  const [openMenuForCommentId, setOpenMenuForCommentId] = useState(null);

  // Editing state
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostDraft, setEditingPostDraft] = useState({ title: "", content: "" });
  const [postFieldErrors, setPostFieldErrors] = useState({ title: "", content: "" });

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
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const toggleCommentForm = (postId) => {
    setOpenCommentForPostId((current) => (current === postId ? null : postId));
  };

  const isOwn = (authorId) => Boolean(userId && authorId && userId === authorId);

  const startEditPost = (post) => {
    setServerError("");
    setPostFieldErrors({ title: "", content: "" });
    setOpenMenuForPostId(null);

    setEditingPostId(post.id);
    setEditingPostDraft({ title: post.title ?? "", content: post.content ?? "" });
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
    <div>
      <h2>Latest Posts</h2>

      {serverError && <p style={{ color: "red" }}>{serverError}</p>}
      {posts.length === 0 && <p>No posts yet</p>}

      {posts.map((post) => {
        const ownPost = isOwn(post.author_id);

        return (
          <div
            key={post.id}
            style={{
              border: "1px solid gray",
              margin: 10,
              padding: 10,
              borderRadius: 6,
              position: "relative",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <h3
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => navigate(`/posts/${post.id}`)}
                  title="Open post details"
                >
                  {post.title}
                </h3>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <AvatarFromStorage pathOrUrl={post.post_author?.avatar_url} />
                  <b>{post.post_author?.username || "Unknown user"}</b>
                </div>
              </div>

              {ownPost && (
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    aria-label="Post actions"
                    onClick={() => {
                      // ensure only one menu open at a time
                      setOpenMenuForCommentId(null);
                      setOpenMenuForPostId((cur) => (cur === post.id ? null : post.id));
                    }}
                    style={{
                      border: "1px solid #ccc",
                      background: "white",
                      borderRadius: 6,
                      padding: "2px 8px",
                      cursor: "pointer",
                      lineHeight: 1.2,
                    }}
                    title="Actions"
                  >
                    ⋯
                  </button>

                  {openMenuForPostId === post.id && (
                    <>
                      {/* Click-outside backdrop */}
                      <div style={backdropStyle} onClick={() => setOpenMenuForPostId(null)} />

                      <div style={menuStyle}>
                        <button type="button" onClick={() => startEditPost(post)} style={menuItemStyle}>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmAndDeletePost(post.id)}
                          style={{ ...menuItemStyle, color: "crimson" }}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {editingPostId === post.id ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 8 }}>
                  <input
                    value={editingPostDraft.title}
                    onChange={(e) => {
                      setEditingPostDraft((d) => ({ ...d, title: e.target.value }));
                      setPostFieldErrors((fe) => ({ ...fe, title: "" }));
                    }}
                    style={{ width: "100%" }}
                    placeholder="Title"
                  />
                  {postFieldErrors.title && <p style={{ color: "red", margin: "6px 0 0" }}>{postFieldErrors.title}</p>}
                </div>

                <div style={{ marginBottom: 8 }}>
                  <textarea
                    rows={4}
                    value={editingPostDraft.content}
                    onChange={(e) => {
                      setEditingPostDraft((d) => ({ ...d, content: e.target.value }));
                      setPostFieldErrors((fe) => ({ ...fe, content: "" }));
                    }}
                    style={{ width: "100%" }}
                    placeholder="Content"
                  />
                  {postFieldErrors.content && <p style={{ color: "red", margin: "6px 0 0" }}>{postFieldErrors.content}</p>}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => saveEditPost(post.id)}>
                    Save
                  </button>
                  <button type="button" onClick={cancelEditPost}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p>{post.content}</p>
            )}

            <button onClick={() => toggleCommentForm(post.id)}>
              {openCommentForPostId === post.id ? "Close" : "Add comment"}
            </button>

            {openCommentForPostId === post.id && (
              <CreateComment
                postId={post.id}
                onCommentCreated={loadPosts}
                onCancel={() => setOpenCommentForPostId(null)}
              />
            )}

            <div style={{ marginTop: 15 }}>
              <h4>Comments</h4>

              {(post.comments ?? []).length === 0 && <p style={{ color: "#777" }}>No comments yet</p>}

              {(post.comments ?? [])
                .slice()
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                .map((comment) => {
                  const ownComment = isOwn(comment.author_id);

                  return (
                    <div
                      key={comment.id}
                      style={{
                        marginLeft: 20,
                        borderLeft: "3px solid #ccc",
                        paddingLeft: 10,
                        marginBottom: 10,
                        position: "relative",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <AvatarFromStorage pathOrUrl={comment.comment_author?.avatar_url} />
                          <b>{comment.comment_author?.username || "Unknown user"}</b>
                        </div>

                        {ownComment && (
                          <div style={{ position: "relative" }}>
                            <button
                              type="button"
                              aria-label="Comment actions"
                              onClick={() => {
                                setOpenMenuForPostId(null);
                                setOpenMenuForCommentId((cur) => (cur === comment.id ? null : comment.id));
                              }}
                              style={{
                                border: "1px solid #ccc",
                                background: "white",
                                borderRadius: 6,
                                padding: "2px 8px",
                                cursor: "pointer",
                                lineHeight: 1.2,
                              }}
                              title="Actions"
                            >
                              ⋯
                            </button>

                            {openMenuForCommentId === comment.id && (
                              <>
                                {/* Click-outside backdrop */}
                                <div style={backdropStyle} onClick={() => setOpenMenuForCommentId(null)} />

                                <div style={menuStyle}>
                                  <button type="button" onClick={() => startEditComment(comment)} style={menuItemStyle}>
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => confirmAndDeleteComment(comment.id)}
                                    style={{ ...menuItemStyle, color: "crimson" }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {editingCommentId === comment.id ? (
                        <div style={{ marginTop: 8 }}>
                          <textarea
                            rows={3}
                            value={editingCommentDraft}
                            onChange={(e) => {
                              setEditingCommentDraft(e.target.value);
                              setCommentFieldError("");
                            }}
                            style={{ width: "100%" }}
                          />
                          {commentFieldError && <p style={{ color: "red", margin: "6px 0 0" }}>{commentFieldError}</p>}

                          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <button type="button" onClick={() => saveEditComment(comment.id)}>
                              Save
                            </button>
                            <button type="button" onClick={cancelEditComment}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginTop: 6 }}>{comment.content}</div>
                      )}

                      <small style={{ color: "#888" }}>{new Date(comment.created_at).toLocaleString()}</small>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FetchPosts;
