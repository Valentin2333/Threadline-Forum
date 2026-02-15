import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileShell from "./ProfileShell";
import ProfileCard from "./ProfileCard";
import AvatarSection from "./AvatarSection";
import ProfileSummary from "./ProfileSummary";
import ProfileAlerts from "./ProfileAlerts";
import EditActions from "./EditActions";
import EditProfileForm from "./EditProfileForm";
import DeleteAccountSection from "./DeleteAccountSection";
import DeleteAccountModal from "./DeleteAccountModal";
import useAuthUser from "./hooks/useAuthUser";
import useProfileEditForm from "./hooks/useProfileEditForm";
import useProfileRow from "./hooks/useProfileRow";
import useAvatarUrl from "./hooks/useAvatarUrl";
import useAvatarUpload from "./hooks/useAvatarUpload";
import useDeleteAccount from "./hooks/useDeleteAccount";
import { supabase } from "../../api/supabaseClient";

const UserProfile = () => {
  const navigate = useNavigate();

  const { user, loadingUser, error: authError } = useAuthUser();

  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(0);

  const form = useProfileEditForm();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isDirty, isValid },
  } = form;

  const { profile, setProfile, loadingProfile, error, setError } =
    useProfileRow({
      userId: user?.id,
      reset,
    });

  useEffect(() => {
    if (!profile) return;

    setIsEditing(false);
    setAvatarVersion(Date.now());
  }, [profile]);

  const avatarPath = useMemo(
    () => profile?.avatar_url ?? "",
    [profile?.avatar_url],
  );
  const avatarUrl = useAvatarUrl({ avatarPath, avatarVersion });
  const hasAvatar = Boolean(avatarPath);

  const {
    uploadingAvatar,
    showAvatarUpload,
    setShowAvatarUpload,
    onAvatarSelected,
    toggleAvatarUpload,
    MAX_AVATAR_MB,
  } = useAvatarUpload({
    userId: user?.id,
    setProfile,
    setError,
    setSuccess,
    setAvatarVersion,
  });

  const {
    showDeleteModal,
    deletingAccount,
    deleteConfirmText,
    setDeleteConfirmText,
    openDeleteModal,
    closeDeleteModal,
    onDeleteAccount,
  } = useDeleteAccount({
    userId: user?.id,
    navigate,
    setError,
    setSuccess,
  });

  const startEdit = () => {
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setError("");
    setSuccess("");
    setIsEditing(false);

    reset({
      firstName: profile?.first_name ?? "",
      lastName: profile?.last_name ?? "",
      username: profile?.username ?? "",
    });
  };

  const onSave = async (values) => {
    setError("");
    setSuccess("");

    if (!user?.id) {
      setError("You must be logged in to update your profile.");
      return;
    }

    setSaving(true);

    try {
      const newFirstName = (values.firstName ?? "").trim();
      const newLastName = (values.lastName ?? "").trim();

      const { data: updated, error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: newFirstName,
          last_name: newLastName,
        })
        .eq("id", user.id)
        .select(
          "id, username, first_name, last_name, avatar_url, is_blocked, reputation",
        )
        .single();

      if (updateError) throw updateError;

      setProfile(updated);

      reset({
        firstName: updated.first_name ?? "",
        lastName: updated.last_name ?? "",
        username: updated.username ?? "",
      });

      setSuccess("Profile updated successfully.");
      setIsEditing(false);
      setShowAvatarUpload(false);
    } catch (e2) {
      setError(e2?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProfileShell
      loadingUser={loadingUser}
      user={user}
      authError={authError}
      onGoLogin={() => navigate("/login")}
    >
      <h2 className="mb-3">Your Profile</h2>

      <ProfileCard loadingProfile={loadingProfile} profile={profile}>
        <AvatarSection
          avatarUrl={avatarUrl}
          hasAvatar={hasAvatar}
          showAvatarUpload={showAvatarUpload}
          uploadingAvatar={uploadingAvatar}
          onAvatarSelected={onAvatarSelected}
          onToggleUpload={toggleAvatarUpload}
          maxAvatarMb={MAX_AVATAR_MB}
        />

        {user?.email && (
          <ProfileSummary userEmail={user.email} profile={profile} />
        )}

        <EditActions
          isEditing={isEditing}
          saving={saving}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
        />

        <ProfileAlerts success={success} error={error} />

        {isEditing && (
          <EditProfileForm
            register={register}
            handleSubmit={handleSubmit}
            onSave={onSave}
            errors={errors}
            isDirty={isDirty}
            isValid={isValid}
            saving={saving}
            getValues={getValues}
            reset={reset}
          />
        )}

        <hr className="my-4" />

        <DeleteAccountSection onOpen={openDeleteModal} />
      </ProfileCard>

      <DeleteAccountModal
        show={showDeleteModal}
        onHide={closeDeleteModal}
        deleting={deletingAccount}
        confirmText={deleteConfirmText}
        onChangeConfirmText={setDeleteConfirmText}
        onDelete={onDeleteAccount}
      />
    </ProfileShell>
  );
};

export default UserProfile;
