import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPostById } from "../../../api/posts";
import { isMember as checkMembership } from "../../../api/communities";
import useAuthUser from "../../../hooks/useAuthUser";
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
import ReportModal from "../../shared/ReportModal";
import { getPostMediaPublicUrl } from "../../../api/postMedia";
import ContentActionMenu from "../../shared/ContentActionMenu";

import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";

const PostDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const { isAdmin } = useAdminStatus(user?.id);

  const [post, setPost] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [openPostMenu, setOpenPostMenu] = useState(false);
  const [openMenuForCommentId, setOpenMenuForCommentId] = useState(null);
  const [serverError, setServerError] = useState("");
  const [memberStatus, setMemberStatus] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  const userId = useMemo(() => user?.id ?? null, [user]);
  const isOwn = (authorId) =>
    Boolean(userId && authorId && userId === authorId);
  const canManage = (authorId) => isOwn(authorId) || isAdmin;

  const load = useCallback(
    async ({ silent = false } = {}) => {
      try {
        setServerError("");
        if (!silent) setInitialLoading(true);

        const data = await getPostById(postId);
        setPost(data);

        if (userId && data?.community_id) {
          const yes = await checkMembership({
            communityId: data.community_id,
            userId,
          });
          setMemberStatus(yes);
        }
      } catch (e) {
        const msg = e?.message || "";
        if (
          msg.includes("invalid input syntax") ||
          msg.includes("JSON object")
        ) {
          setServerError("Post not found.");
        } else {
          setServerError(msg || "Failed to load post.");
        }
        setPost(null);
      } finally {
        if (!silent) setInitialLoading(false);
      }
    },
    [postId, userId],
  );

  useEffect(() => {
    load({ silent: false });
  }, [load]);

  const reload = useCallback(() => load({ silent: true }), [load]);

  const postEditing = usePostEditing({ onSuccess: reload, setServerError });
  const commentEditing = useCommentEditing({
    onSuccess: reload,
    setServerError,
  });

  const deleteModalHook = useDeleteModal({
    onSuccess: reload,
    onPostDeleted: () => navigate("/feed"),
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
      <Container className="py-3">
        <div className="d-flex align-items-center gap-2 text-muted">
          <div className="spinner-border spinner-border-sm" />
          <span>Loading…</span>
        </div>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="py-3">
        <Alert variant="danger" className="py-2">
          {serverError || "Post not found."}
        </Alert>
        <Button
          variant="outline-secondary"
          size="sm"
          className="d-inline-flex align-items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          <span>Go back</span>
        </Button>
      </Container>
    );
  }

  const showPostMenu = Boolean(user);
  const sortedComments = (post.comments ?? [])
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return (
    <Container className="py-3">
      <div
        className="mb-3 d-flex align-items-center gap-3"
        style={{ minWidth: 0 }}
      >
        <Button
          variant="outline-secondary"
          size="sm"
          className="d-inline-flex align-items-center gap-2"
          style={{ flexShrink: 0 }}
          onClick={() => navigate(-1)}
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          <span>Back</span>
        </Button>

        {post.community?.name && (
          <Link
            to={`/community/${encodeURIComponent(post.community.name)}`}
            className="text-decoration-none d-inline-flex align-items-center gap-1 text-truncate"
            style={{
              fontSize: "0.85rem",
              color: "var(--fs-primary)",
              minWidth: 0,
            }}
            title={post.community.name}
          >
            <i
              className="fa-solid fa-users"
              style={{ fontSize: 11, flexShrink: 0 }}
            />
            <span className="text-truncate">{post.community.name}</span>
          </Link>
        )}
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
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="d-flex align-items-center gap-2">
                <Link
                  to={`/profile/${post.author_id}`}
                  className="text-decoration-none"
                >
                  <AvatarFromStorage pathOrUrl={post.post_author?.avatar_url} />
                </Link>
                <div style={{ minWidth: 0 }}>
                  <Link
                    to={`/profile/${post.author_id}`}
                    className="fs-author-name-link d-block text-truncate"
                    title={post.post_author?.username || "Unknown user"}
                  >
                    {post.post_author?.username || "Unknown user"}
                  </Link>
                  <div className="fs-timestamp">
                    {new Date(post.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-3" style={{ minWidth: 0 }}>
                <h2 className="h4 mb-0 text-truncate" title={post.title}>
                  {post.title}
                </h2>
              </div>
            </div>

            {showPostMenu && (
              <ContentActionMenu
                show={openPostMenu}
                onToggle={(nextShow) => {
                  if (nextShow) setOpenMenuForCommentId(null);
                  setOpenPostMenu(nextShow);
                }}
                showEdit={isOwn(post.author_id)}
                showDelete={canManage(post.author_id)}
                showReport={!isOwn(post.author_id)}
                onEdit={handleStartEditPost}
                onDelete={handleOpenDeletePost}
                onReport={() => {
                  setOpenPostMenu(false);
                  setReportTarget({ postId: post.id });
                }}
              />
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
            <PostVotes
              postId={post.id}
              onVoted={reload}
              isMember={memberStatus}
            />
          </div>

          <div className="mt-3 d-flex align-items-center justify-content-between">
            <Badge className="fs-score-badge">
              <i
                className="fa-solid fa-arrow-up me-1"
                style={{ fontSize: 10 }}
              />
              {Number(post.score ?? 0)} points
            </Badge>
            <span className="text-muted" style={{ fontSize: "0.8125rem" }}>
              <i className="fa-regular fa-comment me-1" />
              {post.comments?.length ?? 0} comments
            </span>
          </div>

          <hr className="my-4" />

          <div>
            <h3
              className="h6 mb-3"
              style={{ color: "var(--fs-text-secondary)" }}
            >
              <i
                className="fa-regular fa-comments me-2"
                style={{ fontSize: 14 }}
              />
              Comments
            </h3>

            <CreateComment
              postId={post.id}
              onCommentCreated={reload}
              isMember={memberStatus}
            />

            <div className="mt-2">
              <CommentList
                comments={sortedComments}
                userId={userId}
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
                onReport={(commentId) => setReportTarget({ commentId })}
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
        title={
          deleteModalHook.deleteModal.type === "post"
            ? "Delete post"
            : "Delete comment"
        }
        warning={
          deleteModalHook.deleteModal.type === "post"
            ? "Are you sure you want to delete this post forever?"
            : "Are you sure you want to delete this comment forever?"
        }
      />

      <ReportModal
        show={!!reportTarget}
        onHide={() => setReportTarget(null)}
        postId={reportTarget?.postId}
        commentId={reportTarget?.commentId}
      />
    </Container>
  );
};

export default PostDetails;
