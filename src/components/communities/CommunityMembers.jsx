import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCommunityMembers, removeMember } from "../../api/communities";
import DeleteConfirmModal from "../shared/DeleteConfirmModal";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import ListGroup from "react-bootstrap/ListGroup";
import AvatarFromStorage from "../posting/posts/AvatarFromStorage";

const CommunityMembers = ({
  show,
  onHide,
  communityId,
  creatorId,
  onMemberRemoved,
}) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [removeModal, setRemoveModal] = useState({
    show: false,
    userId: null,
    username: "",
  });
  const [removeDeleting, setRemoveDeleting] = useState(false);

  const load = async () => {
    if (!communityId) return;
    setLoading(true);
    setError("");
    try {
      const data = await getCommunityMembers(communityId);
      setMembers(data);
    } catch (e) {
      setError(e?.message || "Failed to load members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, communityId]);

  const openRemoveModal = (userId, username) => {
    setRemoveModal({ show: true, userId, username });
  };

  const closeRemoveModal = () => {
    setRemoveModal({ show: false, userId: null, username: "" });
  };

  const handleRemoveConfirmed = async () => {
    const userId = removeModal.userId;
    if (!userId) return;
    setRemoveDeleting(true);
    setError("");
    try {
      await removeMember({ communityId, userId });
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      onMemberRemoved?.();
      closeRemoveModal();
    } catch (e) {
      setError(e?.message || "Failed to remove member.");
      closeRemoveModal();
    } finally {
      setRemoveDeleting(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>
            <i
              className="fa-solid fa-users me-2"
              style={{ color: "var(--fs-primary)" }}
            />
            Community Members
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && (
            <Alert variant="danger" className="py-2">
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="d-flex align-items-center gap-2 text-muted py-3">
              <Spinner size="sm" />
              <span>Loading members…</span>
            </div>
          ) : members.length === 0 ? (
            <p className="text-muted mb-0">No members yet.</p>
          ) : (
            <ListGroup variant="flush">
              {members.map((m) => {
                const profile = m.profile;
                const isCreator = m.user_id === creatorId;
                const isAdmin = profile?.is_admin === true;
                const canRemove = !isCreator && !isAdmin;

                return (
                  <ListGroup.Item
                    key={m.id}
                    className="d-flex align-items-center justify-content-between py-2"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <Link
                        to={`/profile/${m.user_id}`}
                        className="text-decoration-none"
                      >
                        <AvatarFromStorage
                          pathOrUrl={profile?.avatar_url}
                          size="sm"
                        />
                      </Link>
                      <div>
                        <Link
                          to={`/profile/${m.user_id}`}
                          className="fs-author-name-link"
                        >
                          {profile?.username || "Unknown"}
                        </Link>
                        <div className="d-flex gap-1 mt-1">
                          {isCreator && (
                            <Badge
                              bg="warning"
                              text="dark"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Creator
                            </Badge>
                          )}
                          {isAdmin && (
                            <Badge bg="primary" style={{ fontSize: "0.65rem" }}>
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {canRemove && (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() =>
                          openRemoveModal(
                            m.user_id,
                            profile?.username || "this member",
                          )
                        }
                        disabled={removeDeleting === m.user_id}
                      >
                        {removeDeleting === m.user_id ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <i
                              className="fa-solid fa-user-minus me-1"
                              style={{ fontSize: 11 }}
                            />
                            Remove
                          </>
                        )}
                      </Button>
                    )}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <DeleteConfirmModal
        show={removeModal.show}
        onHide={closeRemoveModal}
        onDelete={handleRemoveConfirmed}
        deleting={removeDeleting}
        title="Remove member"
        warning={`Are you sure you want to remove "${removeModal.username}" from this community?`}
      />
    </>
  );
};

export default CommunityMembers;
