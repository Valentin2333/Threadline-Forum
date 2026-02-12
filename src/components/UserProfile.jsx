import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import { supabase } from "../api/supabaseClient";

const NAME_MIN = 4;
const NAME_MAX = 32;

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_MB = 5;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const UserProfile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [profile, setProfile] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // We store avatar_url in DB as a PATH like: "<uid>/avatar.png"
  const avatarPath = useMemo(
    () => profile?.avatar_url ?? "",
    [profile?.avatar_url],
  );

  const avatarUrl = useMemo(() => {
    if (!avatarPath) return "";
    const { data } = supabase.storage.from("avatars").getPublicUrl(avatarPath);
    return data?.publicUrl ?? "";
  }, [avatarPath]);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      setLoadingUser(true);
      setError("");

      try {
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!cancelled) setUser(data.user ?? null);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Could not read auth user.");
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!user?.id) {
        setProfile(null);
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);
      setError("");
      setSuccess("");

      try {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select(
            "id, username, first_name, last_name, avatar_url, is_blocked, reputation",
          )
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (!cancelled) {
          setProfile(data);
          setFirstName(data.first_name ?? "");
          setLastName(data.last_name ?? "");
          setUsername(data.username ?? "");
          setIsEditing(false);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Could not load profile.");
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const validate = () => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    const un = username.trim();

    if (fn.length < NAME_MIN || fn.length > NAME_MAX) {
      return `First name must be between ${NAME_MIN} and ${NAME_MAX} characters.`;
    }
    if (ln.length < NAME_MIN || ln.length > NAME_MAX) {
      return `Last name must be between ${NAME_MIN} and ${NAME_MAX} characters.`;
    }
    if (un.length > 0 && (un.length < NAME_MIN || un.length > NAME_MAX)) {
      return `Username must be between ${NAME_MIN} and ${NAME_MAX} characters (or empty).`;
    }
    return "";
  };

  const startEdit = () => {
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setError("");
    setSuccess("");
    setIsEditing(false);

    // revert inputs back to saved profile values
    setFirstName(profile?.first_name ?? "");
    setLastName(profile?.last_name ?? "");
    setUsername(profile?.username ?? "");
  };

  const onSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user?.id) {
      setError("You must be logged in to update your profile.");
      return;
    }

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSaving(true);

    try {
      const newUsername = username.trim();
      const newFirstName = firstName.trim();
      const newLastName = lastName.trim();

      // Optional: username uniqueness check (case-insensitive)
      if (newUsername.length > 0) {
        const { data: existing, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .ilike("username", newUsername)
          .neq("id", user.id)
          .limit(1);

        if (checkError) throw checkError;

        if (existing && existing.length > 0) {
          setError("Username is already taken.");
          setSaving(false);
          return;
        }
      }

      const { data: updated, error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: newFirstName,
          last_name: newLastName,
          username: newUsername.length ? newUsername : null,
        })
        .eq("id", user.id)
        .select(
          "id, username, first_name, last_name, avatar_url, is_blocked, reputation",
        )
        .single();

      if (updateError) throw updateError;

      setProfile(updated);
      setSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (e2) {
      setError(e2?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

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

    if (!user?.id) {
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
      const path = `${user.id}/avatar.${ext}`;

      // Helpful debug: confirm path matches policy: "<uid>/..."
      // console.log("AUTH UID:", user.id);
      // console.log("UPLOAD PATH:", path);
      console.log("AUTH UID:", user.id);
      console.log("UPLOAD PATH:", path);

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, {
          upsert: true,
          cacheControl: "3600",
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Store PATH in DB, not full URL
      const { data: updated, error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: path })
        .eq("id", user.id)
        .select(
          "id, username, first_name, last_name, avatar_url, is_blocked, reputation",
        )
        .single();

      if (updateError) throw updateError;

      setProfile(updated);
      setSuccess("Profile picture updated.");
    } catch (e2) {
      setError(e2?.message || "Could not upload profile picture.");
    } finally {
      setUploadingAvatar(false);
    }
  };

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

    if (!user?.id) {
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

      if (fnError) {
        throw new Error(fnError.message || "Edge Function failed.");
      }

      await supabase.auth.signOut();
      navigate("/");
    } catch (e2) {
      setError(e2?.message || "Could not delete account.");
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  if (loadingUser) {
    return (
      <Container className="py-4" style={{ maxWidth: 720 }}>
        <div className="d-flex align-items-center gap-2">
          <Spinner size="sm" />
          <span>Loading user...</span>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-4" style={{ maxWidth: 720 }}>
        <Alert variant="warning" className="mb-3">
          You must be logged in to view your profile.
        </Alert>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: 720 }}>
      <h2 className="mb-3">Profile</h2>

      <Card className="p-4">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              overflow: "hidden",
              background: "#f1f3f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 28, opacity: 0.6 }}>👤</span>
            )}
          </div>

          <div className="flex-grow-1">
            <p className="mb-1">
              <strong>Email:</strong> {user.email}
            </p>

            <Form.Group controlId="avatarUpload" className="mb-0">
              <Form.Label className="mb-1">Profile picture</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={onAvatarSelected}
                  disabled={uploadingAvatar}
                />
                {uploadingAvatar && <Spinner size="sm" />}
              </div>
              <Form.Text muted>
                Max {MAX_AVATAR_MB}MB. JPG/PNG/WEBP/GIF.
              </Form.Text>
            </Form.Group>
          </div>
        </div>

        {loadingProfile ? (
          <div className="d-flex align-items-center gap-2">
            <Spinner size="sm" />
            <span>Loading profile...</span>
          </div>
        ) : !profile ? (
          <Alert variant="warning" className="mb-0">
            No profile row found for this user.
          </Alert>
        ) : (
          <>
            <div className="mb-3">
              <p className="mb-1">
                <strong>Name:</strong> {profile.first_name} {profile.last_name}
              </p>
              <p className="mb-1">
                <strong>Username:</strong> {profile.username || "—"}
              </p>
              <p className="mb-1">
                <strong>Reputation:</strong> {profile.reputation ?? 0}
              </p>
              <p className="mb-0">
                <strong>Blocked:</strong> {profile.is_blocked ? "Yes" : "No"}
              </p>
            </div>

            <div className="d-flex gap-2 mb-3">
              {!isEditing ? (
                <Button onClick={startEdit}>Edit profile</Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </Button>
              )}
            </div>

            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            {isEditing && (
              <Form onSubmit={onSave}>
                <Form.Group className="mb-3">
                  <Form.Label>First name</Form.Label>
                  <Form.Control
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                  <Form.Text muted>
                    Must be {NAME_MIN}–{NAME_MAX} characters.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Last name</Form.Label>
                  <Form.Control
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                  <Form.Text muted>
                    Must be {NAME_MIN}–{NAME_MAX} characters.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Username (optional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                  />
                  <Form.Text muted>
                    If set, must be {NAME_MIN}–{NAME_MAX} characters.
                  </Form.Text>
                </Form.Group>

                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </Form>
            )}

            <hr className="my-4" />

            <div>
              <h5 className="mb-2">Danger zone</h5>
              <p className="text-muted mb-3">
                This permanently deletes your account and signs you out.
              </p>
              <Button variant="danger" onClick={openDeleteModal}>
                Delete my account
              </Button>
            </div>
          </>
        )}
      </Card>

      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton={!deletingAccount}>
          <Modal.Title>Delete account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger" className="mb-3">
            This is permanent. Your Supabase auth user and profile will be
            deleted.
          </Alert>

          <Form.Group>
            <Form.Label>
              Type <strong>delete</strong> to confirm
            </Form.Label>
            <Form.Control
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              disabled={deletingAccount}
              placeholder="delete"
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={closeDeleteModal}
            disabled={deletingAccount}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onDeleteAccount}
            disabled={deletingAccount}
          >
            {deletingAccount ? (
              <>
                <Spinner size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Delete permanently"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserProfile;
