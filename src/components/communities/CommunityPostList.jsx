import { useState } from "react";
import usePostEditing from "../posting/hooks/usePostEditing";
import useCommentEditing from "../posting/hooks/useCommentEditing";
import useDeleteModal from "../posting/hooks/useDeleteModal";
import usePostFilters from "../posting/hooks/usePostFilters";

import PostCard from "../posting/posts/PostCard";
import PostSearchBar from "../posting/posts/PostSearchBar";
import PostFilterBar from "../posting/posts/PostFilterBar";
import DeleteConfirmModal from "../shared/DeleteConfirmModal";

import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

const CommunityPostList = ({
  posts,
  userId,
  isMember,
  isOwn,
  canManage,
  onReload,
  setServerError,
}) => {
  const [expandedCommentsByPostId, setExpandedCommentsByPostId] = useState({});
  const [openMenuForPostId, setOpenMenuForPostId] = useState(null);
  const [openMenuForCommentId, setOpenMenuForCommentId] = useState(null);

  const postEditing = usePostEditing({ onSuccess: onReload, setServerError });
  const commentEditing = useCommentEditing({
    onSuccess: onReload,
    setServerError,
  });
  const deleteModalHook = useDeleteModal({
    onSuccess: onReload,
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
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="fs-page-title mb-0" style={{ fontSize: "1.1rem" }}>
          Posts
        </h3>
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant={
              filters.showSearch || filters.hasActiveSearch
                ? "primary"
                : "outline-primary"
            }
            onClick={() => filters.setShowSearch((v) => !v)}
          >
            <i className="fa-solid fa-magnifying-glass me-2" />
            Search
          </Button>
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

      <PostSearchBar
        showSearch={filters.showSearch}
        searchQuery={filters.searchQuery}
        setSearchQuery={filters.setSearchQuery}
      />
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
        onRefresh={onReload}
      />

      {filters.displayedPosts.length === 0 && (
        <Alert variant="secondary">
          <i className="fa-solid fa-inbox me-2" />
          No posts in this community yet.
        </Alert>
      )}

      {filters.displayedPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          userId={userId}
          isOwn={isOwn}
          canManage={canManage}
          isMember={isMember}
          editingPostId={postEditing.editingPostId}
          editingPostDraft={postEditing.editingPostDraft}
          setEditingPostDraft={postEditing.setEditingPostDraft}
          postFieldErrors={postEditing.postFieldErrors}
          setPostFieldErrors={postEditing.setPostFieldErrors}
          onStartEditPost={handleStartEditPost}
          onSaveEditPost={postEditing.saveEditPost}
          onCancelEditPost={postEditing.cancelEditPost}
          onDeletePost={handleOpenDeletePost}
          onVoted={onReload}
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
      ))}

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
    </>
  );
};

export default CommunityPostList;
