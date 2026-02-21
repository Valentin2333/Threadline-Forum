import { useState } from "react";
import { updateComment } from "../../../api/comments";

const useCommentEditing = ({ onSuccess, setServerError }) => {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentDraft, setEditingCommentDraft] = useState("");
  const [commentFieldError, setCommentFieldError] = useState("");

  const startEditComment = (comment) => {
    setServerError("");
    setCommentFieldError("");

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
      await onSuccess?.();
    } catch (e) {
      setServerError(e?.message || "Failed to update comment.");
    }
  };

  return {
    editingCommentId,
    editingCommentDraft,
    setEditingCommentDraft,
    commentFieldError,
    setCommentFieldError,
    startEditComment,
    cancelEditComment,
    saveEditComment,
  };
};

export default useCommentEditing;
