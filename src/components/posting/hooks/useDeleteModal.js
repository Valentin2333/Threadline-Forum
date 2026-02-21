import { useState } from "react";
import { deletePost } from "../../../api/posts";
import { deleteComment } from "../../../api/comments";

const useDeleteModal = ({
  onSuccess,
  onPostDeleted,
  setServerError,
  cancelEditPost,
  cancelEditComment,
  editingPostId,
  editingCommentId,
}) => {
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    type: null,
    id: null,
  });
  const [deleting, setDeleting] = useState(false);

  const openDeletePostModal = (postId) => {
    setServerError("");
    setDeleteModal({ show: true, type: "post", id: postId });
  };

  const openDeleteCommentModal = (commentId) => {
    setServerError("");
    setDeleteModal({ show: true, type: "comment", id: commentId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, type: null, id: null });
  };

  const executeDelete = async () => {
    setDeleting(true);
    setServerError("");

    try {
      if (deleteModal.type === "post") {
        await deletePost({ postId: deleteModal.id });
        if (editingPostId === deleteModal.id) cancelEditPost?.();

        if (onPostDeleted) {
          closeDeleteModal();
          onPostDeleted();
          return;
        }
      } else if (deleteModal.type === "comment") {
        await deleteComment({ commentId: deleteModal.id });
        if (editingCommentId === deleteModal.id) cancelEditComment?.();
      }

      closeDeleteModal();
      await onSuccess?.();
    } catch (e) {
      setServerError(e?.message || `Failed to delete ${deleteModal.type}.`);
      closeDeleteModal();
    } finally {
      setDeleting(false);
    }
  };

  return {
    deleteModal,
    deleting,
    openDeletePostModal,
    openDeleteCommentModal,
    closeDeleteModal,
    executeDelete,
  };
};

export default useDeleteModal;
