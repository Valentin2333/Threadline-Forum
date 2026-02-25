import { useState } from "react";
import { supabase } from "../../../api/supabaseClient";
import { AVATAR_BUCKET, MAX_AVATAR_MB, ALLOWED_IMAGE_TYPES } from "../shared/constants";

const useAvatarUpload = ({
  userId,
  setProfile,
  setError,
  setSuccess,
  setAvatarVersion,
}) => {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  const validateAvatarFile = (file) => {
    if (!file) return "No file selected.";
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Please upload a JPG, PNG, WEBP, or GIF image.";
    }
    const maxBytes = MAX_AVATAR_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `Image is too large. Max size is ${MAX_AVATAR_MB}MB.`;
    }
    return "";
  };

  const onAvatarSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    setError("");
    setSuccess("");

    if (!userId) {
      setError("You must be logged in to upload an avatar.");
      return;
    }

    const validationMsg = validateAvatarFile(file);
    if (validationMsg) {
      setError(validationMsg);
      return;
    }

    setUploadingAvatar(true);

    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, {
          upsert: true,
          cacheControl: "0",
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: updated, error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: path })
        .eq("id", userId)
        .select(
          "id, username, first_name, last_name, avatar_url, is_blocked, reputation",
        )
        .single();

      if (updateError) throw updateError;

      setProfile(updated);

      const v = Date.now();
      setAvatarVersion(v);

      window.dispatchEvent(
        new CustomEvent("profile:avatar-updated", {
          detail: { avatarPath: path, version: v },
        }),
      );

      setShowAvatarUpload(false);
      setSuccess("Profile picture updated.");
    } catch (e2) {
      setError(e2?.message || "Could not upload profile picture.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const toggleAvatarUpload = () => {
    setError("");
    setSuccess("");
    setShowAvatarUpload((v) => !v);
  };

  return {
    uploadingAvatar,
    showAvatarUpload,
    setShowAvatarUpload,
    onAvatarSelected,
    toggleAvatarUpload,
    MAX_AVATAR_MB,
  };
};

export default useAvatarUpload;
