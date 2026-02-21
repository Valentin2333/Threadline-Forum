import { useEffect, useMemo, useState } from "react";
import { getNewestPosts } from "../../../api/posts";
import useAuthUser from "../../navigation/hooks/useAuthUser";
import useAdminStatus from "../../admin/hooks/useAdminStatus";
import usePostEditing from "../hooks/usePostEditing";
import useCommentEditing from "../hooks/useCommentEditing";
import useDeleteModal from "../hooks/useDeleteModal";
import usePostFilters from "../hooks/usePostFilters";
import PostSearchBar from "../posts/PostSearchBar";
import PostFilterBar from "../posts/PostFilterBar";
import PostCard from "./PostCard";
import DeleteConfirmModal from "../../shared/DeleteConfirmModal";

import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import { Container } from "react-bootstrap";

const FetchPosts = ({ refreshTrigger }) => {
  const user = useAuthUser();
  const { isAdmin } = useAdminStatus(user?.id);

  const [posts, setPosts] = useState([]);
  const [expandedCommentsByPostId, setExpandedCommentsByPostId] = useState({});
  const [openMenuForPostId, setOpenMenuForPostId] = useState(null);
  const [openMenuForCommentId, setOpenMenuForCommentId] = useState(null);
  const [serverError, setServerError] = useState("");

  const userId = useMemo(() => user?.id ?? null, [user]);
  const isOwn = (authorId) =>
    Boolean(userId && authorId && userId === authorId);
  const canManage = (authorId) => isOwn(authorId) || isAdmin;

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

  const postEditing = usePostEditing({
    onSuccess: loadPosts,
    setServerError,
  });

  const commentEditing = useCommentEditing({
    onSuccess: loadPosts,
    setServerError,
  });

  const deleteModalHook = useDeleteModal({
    onSuccess: loadPosts,
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
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="fs-page-title mb-0">Posts</h2>

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
        onRefresh={loadPosts}
      />

      {serverError && (
        <Alert variant="danger" className="py-2">
          {serverError}
        </Alert>
      )}

      {filters.displayedPosts.length === 0 && (
        <Alert variant="secondary">
          <i className="fa-solid fa-inbox me-2" />
          No posts match your filters.
        </Alert>
      )}

      {filters.displayedPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isOwn={isOwn}
          canManage={canManage}
          editingPostId={postEditing.editingPostId}
          editingPostDraft={postEditing.editingPostDraft}
          setEditingPostDraft={postEditing.setEditingPostDraft}
          postFieldErrors={postEditing.postFieldErrors}
          setPostFieldErrors={postEditing.setPostFieldErrors}
          onStartEditPost={handleStartEditPost}
          onSaveEditPost={postEditing.saveEditPost}
          onCancelEditPost={postEditing.cancelEditPost}
          onDeletePost={handleOpenDeletePost}
          onVoted={loadPosts}
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
    </Container>
  );
};

export default FetchPosts;
