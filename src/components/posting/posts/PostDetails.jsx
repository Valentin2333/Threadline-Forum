import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPostById } from "../../../api/posts";
import useAuthUser from "../../navigation/hooks/useAuthUser";
import useAdminStatus from "../../admin/hooks/useAdminStatus";
import usePostEditing from "../hooks/usePostEditing";
import useCommentEditing from "../hooks/useCommentEditing";
import useDeleteModal from "../hooks/useDeleteModal";
import CreateComment from "../comments/CreateComment";
import AvatarFromStorage from "../posts/AvatarFromStorage";
import PostEditForm from "./PostEditForm";
import CommentList from "../comments/CommentList";
import PostVotes from "../posts/PostVotes";
import DeleteConfirmModal from "../../shared/DeleteConfirmModal";
import { getPostMediaPublicUrl } from "../../../api/postMedia";

import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Dropdown from "react-bootstrap/Dropdown";

const PostDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const user = useAuthUser();
  const { isAdmin } = useAdminStatus(user?.id);

  const [post, setPost] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [openPostMenu, setOpenPostMenu] = useState(false);
  const [openMenuForCommentId, setOpenMenuForCommentId] = useState(null);
  const [serverError, setServerError] = useState("");

  const userId = useMemo(() => user?.id ?? null, [user]);
  const isOwn = (authorId) => Boolean(userId && authorId && userId === authorId);
  const canManage = (authorId) => isOwn(authorId) || isAdmin;

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

  const reload = () => load({ silent: true });

  const postEditing = usePostEditing({ onSuccess: reload, setServerError });
  const commentEditing = useCommentEditing({ onSuccess: reload, setServerError });

  const deleteModalHook = useDeleteModal({
    onSuccess: reload,
    onPostDeleted: () => navigate("/posts"),
    setServerError,
    cancelEditPost: postEditing.cancelEditPost,
    cancelEditComment: commentEditing.cancelEditComment,
    editingPostId: postEditing.editingPostId,
    editingCommentId: commentEditing.editingCommentId,
  });

  const handleStartEditPost = () => {
    setOpenPostMenu(false);
    postEditing.startEditPost(post);
  };

  const handleOpenDeletePost = () => {
    setOpenPostMenu(false);
    deleteModalHook.openDeletePostModal(post.id);
  };

  const handleStartEditComment = (comment) => {
    setOpenMenuForCommentId(null);
    commentEditing.startEditComment(comment);
  };

  const handleOpenDeleteComment = (commentId) => {
    setOpenMenuForCommentId(null);
    deleteModalHook.openDeleteCommentModal(commentId);
  };

  if (initialLoading) {
    return (
      <Container className="py-4" style={{ maxWidth: 800 }}>
        <div className="d-flex align-items-center gap-2 text-muted">
          <div className="spinner-border spinner-border-sm" />
          <span>Loading…</span>
        </div>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="py-3" style={{ maxWidth: 800 }}>
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
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          <span>Back to posts</span>
        </Button>
      </Container>
    );
  }

  const showPostMenu = canManage(post.author_id);
  const sortedComments = (post.comments ?? [])
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return (
    <Container className="py-3" style={{ maxWidth: 800 }}>
      <div className="mb-3">
        <Button
          as={Link}
          to="/posts"
          variant="outline-secondary"
          size="sm"
          className="d-inline-flex align-items-center gap-2"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          <span>Back to posts</span>
        </Button>
      </div>

      {serverError && (
        <Alert variant="danger" className="py-2">
          {serverError}
        </Alert>
      )}

      <Card>
        <Card.Body className="p-4">
          {/* Header row: author/title on left, menu on right */}
          <div className="d-flex align-items-start justify-content-between gap-3">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2">
                <Link
                  to={`/profile/${post.author_id}`}
                  className="text-decoration-none"
                >
                  <AvatarFromStorage pathOrUrl={post.post_author?.avatar_url} />
                </Link>
                <div>
                  <Link
                    to={`/profile/${post.author_id}`}
                    className="fs-author-name-link"
                  >
                    {post.post_author?.username || "Unknown user"}
                  </Link>
                  <div className="fs-timestamp">
                    {new Date(post.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 mt-3">
                <h2 className="h4 mb-0">{post.title}</h2>
              </div>
            </div>

            {showPostMenu && (
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
                  className="fs-menu-toggle"
                >
                  <i
                    className="fa-solid fa-ellipsis-vertical"
                    style={{ fontSize: 13 }}
                  />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {isOwn(post.author_id) && (
                    <Dropdown.Item onClick={handleStartEditPost}>
                      <i
                        className="fa-solid fa-pen me-2"
                        style={{ fontSize: 12 }}
                      />
                      Edit
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item
                    className="text-danger"
                    onClick={handleOpenDeletePost}
                  >
                    <i
                      className="fa-solid fa-trash me-2"
                      style={{ fontSize: 12 }}
                    />
                    Delete
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>

          {(post.post_media?.length ?? 0) > 0 && (
            <div className="mt-3">
              {post.post_media.map((m) => {
                const url = getPostMediaPublicUrl(m.storage_path);
                if (!url) return null;

                if (m.media_type === "video") {
                  return (
                    <div key={m.id} className="mb-3">
                      <video
                        controls
                        preload="metadata"
                        style={{
                          width: "100%",
                          maxHeight: 600,
                          borderRadius: 12,
                          display: "block",
                        }}
                      >
                        <source src={url} />
                      </video>
                    </div>
                  );
                }

                return (
                  <div key={m.id} className="mb-3">
                    <img
                      src={url}
                      alt="Post attachment"
                      style={{
                        width: "100%",
                        maxHeight: 700,
                        objectFit: "contain",
                        borderRadius: 12,
                        display: "block",
                        background: "rgba(0,0,0,0.04)",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Content / edit form */}
          {postEditing.editingPostId === post.id ? (
            <PostEditForm
              draft={postEditing.editingPostDraft}
              setDraft={postEditing.setEditingPostDraft}
              fieldErrors={postEditing.postFieldErrors}
              setFieldErrors={postEditing.setPostFieldErrors}
              onSave={() => postEditing.saveEditPost(post.id)}
              onCancel={postEditing.cancelEditPost}
              rows={5}
            />
          ) : (
            <p
              className="mt-3 mb-0"
              style={{ color: "var(--fs-text-secondary)", lineHeight: 1.7 }}
            >
              {post.content}
            </p>
          )}

          <div className="mt-3">
            <PostVotes postId={post.id} onVoted={reload} />
          </div>

          <div className="mt-3 d-flex align-items-center justify-content-between">
            <Badge className="fs-score-badge">
              <i className="fa-solid fa-arrow-up me-1" style={{ fontSize: 10 }} />
              {Number(post.score ?? 0)} points
            </Badge>
            <span className="text-muted" style={{ fontSize: "0.8125rem" }}>
              <i className="fa-regular fa-comment me-1" />
              {post.comments?.length ?? 0} comments
            </span>
          </div>

          <hr className="my-4" />

          <div>
            <h3 className="h6 mb-3" style={{ color: "var(--fs-text-secondary)" }}>
              <i className="fa-regular fa-comments me-2" style={{ fontSize: 14 }} />
              Comments
            </h3>

            <CreateComment postId={post.id} onCommentCreated={reload} />

            <div className="mt-2">
              <CommentList
                comments={sortedComments}
                isOwn={isOwn}
                canManage={canManage}
                editingCommentId={commentEditing.editingCommentId}
                editingCommentDraft={commentEditing.editingCommentDraft}
                setEditingCommentDraft={commentEditing.setEditingCommentDraft}
                commentFieldError={commentEditing.commentFieldError}
                setCommentFieldError={commentEditing.setCommentFieldError}
                onStartEdit={handleStartEditComment}
                onSaveEdit={commentEditing.saveEditComment}
                onCancelEdit={commentEditing.cancelEditComment}
                onDelete={handleOpenDeleteComment}
                openMenuForCommentId={openMenuForCommentId}
                onToggleMenu={setOpenMenuForCommentId}
                onMenuOpening={() => setOpenPostMenu(false)}
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      <DeleteConfirmModal
        show={deleteModalHook.deleteModal.show}
        onHide={deleteModalHook.closeDeleteModal}
        onDelete={deleteModalHook.executeDelete}
        deleting={deleteModalHook.deleting}
        title={deleteModalHook.deleteModal.type === "post" ? "Delete post" : "Delete comment"}
        warning={
          deleteModalHook.deleteModal.type === "post"
            ? "Are you sure you want to delete this post forever?"
            : "Are you sure you want to delete this comment forever?"
        }
      />
    </Container>
  );
};

export default PostDetails;