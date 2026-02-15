import { useState } from "react";
import { supabase } from "../../../api/supabaseClient";

const useDeleteAccount = ({ userId, navigate, setError, setSuccess }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const openDeleteModal = () => {
    setError("");
    setSuccess("");
    setDeleteConfirmText("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (!deletingAccount) setShowDeleteModal(false);
  };

  const onDeleteAccount = async () => {
    setError("");
    setSuccess("");

    if (!userId) {
      setError("You must be logged in to delete your account.");
      return;
    }

    if (deleteConfirmText.trim().toLowerCase() !== "delete") {
      setError('Type "delete" to confirm.');
      return;
    }

    setDeletingAccount(true);

    try {
      const { error: fnError } = await supabase.functions.invoke("delete-user");
      if (fnError) throw new Error(fnError.message || "Edge Function failed.");

      await supabase.auth.signOut();
      navigate("/");
    } catch (e2) {
      setError(e2?.message || "Could not delete account.");
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  return {
    showDeleteModal,
    deletingAccount,
    deleteConfirmText,
    setDeleteConfirmText,
    openDeleteModal,
    closeDeleteModal,
    onDeleteAccount,
  };
};

export default useDeleteAccount;
