import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPostById, updatePost, deletePost } from "../../api/posts";
import { updateComment, deleteComment } from "../../api/comments";
import CreateComment from "./CreateComment";
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

const PostDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const user = useAuthUser();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openCommentForm, setOpenCommentForm] = useState(false);

  // menus
  const [openPostMenu, setOpenPostMenu] = useState(false);
  const [openMenuForCommentId, setOpenMenuForCommentId] = useState(null);

  // editing
  const [editingPost, setEditingPost] = useState(false);
  const [postDraft, setPostDraft] = useState({ title: "", content: "" });
  const [postFieldErrors, setPostFieldErrors] = useState({ title: "", content: "" });

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentFieldError, setCommentFieldError] = useState("");

  const [serverError, setServerError] = useState("");

  const userId = useMemo(() => user?.id ?? null, [user]);
  const isOwn = (authorId) => Boolean(userId && authorId && userId === authorId);

  const load = async () => {
    try {
      setServerError("");
      setLoading(true);
      const data = await getPostById(postId);
      setPost(data);
    } catch (e) {
      setServerError(e?.message || "Failed to load post.");
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
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
      await load();
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
      await load();
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

      await load();
    } catch (e) {
      setServerError(e?.message || "Failed to delete comment.");
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;

  if (!post) {
    return (
      <div className="p-4">
        <p style={{ color: "crimson" }}>{serverError || "Post not found."}</p>
        <Link to="/posts">← Back to posts</Link>
      </div>
    );
  }

  const ownPost = isOwn(post.author_id);

  return (
    <div className="p-4">
      <div style={{ marginBottom: 12 }}>
        <Link to="/posts">← Back to posts</Link>
      </div>

      {serverError && <p style={{ color: "red" }}>{serverError}</p>}

      <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ marginTop: 0 }}>{post.title}</h2>
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
                  setOpenMenuForCommentId(null);
                  setOpenPostMenu((v) => !v);
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

              {openPostMenu && (
                <>
                  <div style={backdropStyle} onClick={() => setOpenPostMenu(false)} />

                  <div style={menuStyle}>
                    <button type="button" onClick={startEditPost} style={menuItemStyle}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={confirmAndDeletePost}
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

        {editingPost ? (
          <div>
            <div style={{ marginBottom: 8 }}>
              <input
                value={postDraft.title}
                onChange={(e) => {
                  setPostDraft((d) => ({ ...d, title: e.target.value }));
                  setPostFieldErrors((fe) => ({ ...fe, title: "" }));
                }}
                style={{ width: "100%" }}
              />
              {postFieldErrors.title && <p style={{ color: "red", margin: "6px 0 0" }}>{postFieldErrors.title}</p>}
            </div>

            <div style={{ marginBottom: 8 }}>
              <textarea
                rows={6}
                value={postDraft.content}
                onChange={(e) => {
                  setPostDraft((d) => ({ ...d, content: e.target.value }));
                  setPostFieldErrors((fe) => ({ ...fe, content: "" }));
                }}
                style={{ width: "100%" }}
              />
              {postFieldErrors.content && <p style={{ color: "red", margin: "6px 0 0" }}>{postFieldErrors.content}</p>}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={saveEditPost}>
                Save
              </button>
              <button type="button" onClick={cancelEditPost}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>
        )}

        <small style={{ color: "#777" }}>{new Date(post.created_at).toLocaleString()}</small>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3>Comments</h3>

        <button type="button" onClick={() => setOpenCommentForm((v) => !v)}>
          {openCommentForm ? "Close" : "Add comment"}
        </button>

        {openCommentForm && (
          <CreateComment postId={post.id} onCommentCreated={load} onCancel={() => setOpenCommentForm(false)} />
        )}

        {(post.comments ?? []).length === 0 && <p style={{ color: "#777" }}>No comments yet</p>}

        {(post.comments ?? [])
          .slice()
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .map((comment) => {
            const ownComment = isOwn(comment.author_id);

            return (
              <div key={comment.id} style={{ marginTop: 12, borderLeft: "3px solid #ccc", paddingLeft: 10, position: "relative" }}>
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
                          setOpenPostMenu(false);
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
                      value={commentDraft}
                      onChange={(e) => {
                        setCommentDraft(e.target.value);
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
                  <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{comment.content}</div>
                )}

                <small style={{ color: "#888" }}>{new Date(comment.created_at).toLocaleString()}</small>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default PostDetails;
