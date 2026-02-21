import { useState } from "react";
import { updatePost } from "../../../api/posts";
import { validatePost, mapDbErrorToFields } from "../utils/postValidation";

const usePostEditing = ({ onSuccess, setServerError }) => {
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostDraft, setEditingPostDraft] = useState({
    title: "",
    content: "",
  });
  const [postFieldErrors, setPostFieldErrors] = useState({
    title: "",
    content: "",
  });

  const startEditPost = (post) => {
    setServerError("");
    setPostFieldErrors({ title: "", content: "" });

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
      await onSuccess?.();
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

  return {
    editingPostId,
    editingPostDraft,
    setEditingPostDraft,
    postFieldErrors,
    setPostFieldErrors,
    startEditPost,
    cancelEditPost,
    saveEditPost,
  };
};

export default usePostEditing;
