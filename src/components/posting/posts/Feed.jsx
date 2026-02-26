import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getPostsForJoinedCommunities,
  getTopCommunities,
  getUserCommunities,
} from "../../../api/communities";
import useAuthUser from "../../../hooks/useAuthUser";
import useAdminStatus from "../../admin/hooks/useAdminStatus";
import usePostEditing from "../hooks/usePostEditing";
import useCommentEditing from "../hooks/useCommentEditing";
import useDeleteModal from "../hooks/useDeleteModal";
import usePostFilters from "../hooks/usePostFilters";
import PostCard from "./PostCard";
import PostFilterBar from "./PostFilterBar";
import DeleteConfirmModal from "../../shared/DeleteConfirmModal";
import CommunityCard from "../../communities/CommunityCard";
import GlobalSearchBar from "../../communities/GlobalSearchBar";
import useRealtimePosts from "../../../api/useRealtimePosts";
import useContentPermissions from "../../../hooks/useContentPermissions";

import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { Container } from "react-bootstrap";

const Feed = () => {
  const { user } = useAuthUser();
  const { isAdmin } = useAdminStatus(user?.id);

  const [posts, setPosts] = useState([]);
  const [topCommunities, setTopCommunities] = useState([]);
  const [hasJoinedCommunities, setHasJoinedCommunities] = useState(null);
  const [expandedCommentsByPostId, setExpandedCommentsByPostId] = useState({});
  const [openMenuForPostId, setOpenMenuForPostId] = useState(null);
  const [openMenuForCommentId, setOpenMenuForCommentId] = useState(null);
  const [serverError, setServerError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  const userId = useMemo(() => user?.id ?? null, [user]);
  const { isOwn, canManage } = useContentPermissions({ userId, isAdmin });

  const loadPosts = useCallback(
    async ({ silent = false } = {}) => {
      if (!userId) return;
      if (!silent) setInitialLoading(true);
      try {
        const myCommunities = await getUserCommunities(userId);
        setHasJoinedCommunities(myCommunities.length > 0);

        if (myCommunities.length > 0) {
          const data = await getPostsForJoinedCommunities(userId);
          setPosts(data ?? []);
        } else {
          setPosts([]);
          const top = await getTopCommunities(10);
          setTopCommunities(top);
        }
      } catch (err) {
        console.error("Failed loading posts:", err.message);
        setServerError(err?.message || "Failed loading posts.");
      } finally {
        if (!silent) setInitialLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    loadPosts({ silent: false });
  }, [loadPosts]);

  const silentReload = useCallback(
    () => loadPosts({ silent: true }),
    [loadPosts],
  );

  useRealtimePosts({ channelName: "feed-realtime", onUpdate: silentReload });

  const postEditing = usePostEditing({
    onSuccess: silentReload,
    setServerError,
  });
  const commentEditing = useCommentEditing({
    onSuccess: silentReload,
    setServerError,
  });
  const deleteModalHook = useDeleteModal({
    onSuccess: silentReload,
    setServerError,
    cancelEditPost: postEditing.cancelEditPost,
    cancelEditComment: commentEditing.cancelEditComment,
    editingPostId: postEditing.editingPostId,
    editingCommentId: commentEditing.editingCommentId,
  });

  const filters = usePostFilters({ posts, userId });

  const handleStartEditPost = (post) => {
    setOpenMenuForPostId(null);
    postEditing.startEditPost(post);
  };
  const handleStartEditComment = (comment) => {
    setOpenMenuForCommentId(null);
    commentEditing.startEditComment(comment);
  };
  const handleOpenDeletePost = (postId) => {
    setOpenMenuForPostId(null);
    deleteModalHook.openDeletePostModal(postId);
  };
  const handleOpenDeleteComment = (commentId) => {
    setOpenMenuForCommentId(null);
    deleteModalHook.openDeleteCommentModal(commentId);
  };

  return (
    <Container className="py-3">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <h2 className="fs-page-title mb-0">
          <i
            className="fa-solid fa-rss me-2"
            style={{ color: "var(--fs-primary)" }}
          />
          Feed
        </h2>
        <GlobalSearchBar />
      </div>

      {serverError && (
        <Alert variant="danger" className="py-2">
          {serverError}
        </Alert>
      )}

      {initialLoading ? (
        <div className="d-flex align-items-center gap-2 text-muted py-3">
          <Spinner size="sm" />
          <span>Loading your feed…</span>
        </div>
      ) : hasJoinedCommunities === false ? (
        <div>
          <Alert variant="info" className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-info" />
            <span>
              You haven't joined any communities yet. Join some to see posts in
              your feed!{" "}
              <Link to="/communities" className="fw-semibold">
                Browse communities
              </Link>
            </span>
          </Alert>

          <h5 className="mb-3" style={{ color: "var(--fs-text-secondary)" }}>
            <i className="fa-solid fa-fire me-2" style={{ fontSize: 13 }} />
            Top Communities
          </h5>
          {topCommunities.length === 0 ? (
            <p className="text-muted">No communities yet.</p>
          ) : (
            topCommunities.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))
          )}
        </div>
      ) : (
        <>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h3 className="fs-page-title mb-0" style={{ fontSize: "1.1rem" }}>
              Posts
            </h3>
            <div className="d-flex gap-2">
              <Button
                size="sm"
                variant={
                  filters.showFilters || filters.hasActiveFilters
                    ? "primary"
                    : "outline-primary"
                }
                onClick={() => filters.setShowFilters((v) => !v)}
              >
                <i className="fa-solid fa-sliders me-2" />
                Filter & Sort
              </Button>
            </div>
          </div>

          <PostFilterBar
            showFilters={filters.showFilters}
            sortBy={filters.sortBy}
            setSortBy={filters.setSortBy}
            authorFilter={filters.authorFilter}
            setAuthorFilter={filters.setAuthorFilter}
            scoreFilter={filters.scoreFilter}
            setScoreFilter={filters.setScoreFilter}
            userId={userId}
            onClear={filters.clearControls}
            onRefresh={silentReload}
          />

          {filters.displayedPosts.length === 0 ? (
            <Alert variant="secondary">
              <i className="fa-solid fa-inbox me-2" />
              No posts match your filters.
            </Alert>
          ) : (
            filters.displayedPosts.map((post) => (
              <div key={post.id}>
                {post.community?.name && (
                  <div className="mb-1">
                    <Link
                      to={`/community/${encodeURIComponent(
                        post.community.name,
                      )}`}
                      className="text-decoration-none"
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--fs-primary)",
                      }}
                    >
                      <i
                        className="fa-solid fa-users me-1"
                        style={{ fontSize: 10 }}
                      />
                      {post.community.name}
                    </Link>
                  </div>
                )}
                <PostCard
                  post={post}
                  userId={userId}
                  isOwn={isOwn}
                  canManage={canManage}
                  isMember={true}
                  editingPostId={postEditing.editingPostId}
                  editingPostDraft={postEditing.editingPostDraft}
                  setEditingPostDraft={postEditing.setEditingPostDraft}
                  postFieldErrors={postEditing.postFieldErrors}
                  setPostFieldErrors={postEditing.setPostFieldErrors}
                  onStartEditPost={handleStartEditPost}
                  onSaveEditPost={postEditing.saveEditPost}
                  onCancelEditPost={postEditing.cancelEditPost}
                  onDeletePost={handleOpenDeletePost}
                  onVoted={silentReload}
                  editingCommentId={commentEditing.editingCommentId}
                  editingCommentDraft={commentEditing.editingCommentDraft}
                  setEditingCommentDraft={commentEditing.setEditingCommentDraft}
                  commentFieldError={commentEditing.commentFieldError}
                  setCommentFieldError={commentEditing.setCommentFieldError}
                  onStartEditComment={handleStartEditComment}
                  onSaveEditComment={commentEditing.saveEditComment}
                  onCancelEditComment={commentEditing.cancelEditComment}
                  onDeleteComment={handleOpenDeleteComment}
                  openMenuForCommentId={openMenuForCommentId}
                  onToggleCommentMenu={setOpenMenuForCommentId}
                  openMenuForPostId={openMenuForPostId}
                  onTogglePostMenu={setOpenMenuForPostId}
                  onCloseCommentMenu={() => setOpenMenuForCommentId(null)}
                  isExpanded={!!expandedCommentsByPostId[post.id]}
                  onToggleExpand={() =>
                    setExpandedCommentsByPostId((m) => ({
                      ...m,
                      [post.id]: !m[post.id],
                    }))
                  }
                />
              </div>
            ))
          )}
        </>
      )}

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
    </Container>
  );
};

export default Feed;
