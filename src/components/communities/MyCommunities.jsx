import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCreatedCommunities, deleteCommunity } from "../../api/communities";
import useAuthUser from "../navigation/hooks/useAuthUser";
import CommunityCard from "./CommunityCard";
import CreateCommunityForm from "./CreateCommunityForm";
import DeleteConfirmModal from "../shared/DeleteConfirmModal";

import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";

const MyCommunities = () => {
  const user = useAuthUser();
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  // delete community modal state
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    community: null,
  });
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const data = await getCreatedCommunities(user.id);
      setCommunities(data);
    } catch (e) {
      setError(e?.message || "Failed to load your communities.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const openDeleteModal = (community) => {
    setDeleteModal({ show: true, community });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, community: null });
  };

  const handleDeleteCommunity = async () => {
    if (!deleteModal.community) return;
    setDeleting(true);
    setError("");
    try {
      await deleteCommunity(deleteModal.community.id);
      closeDeleteModal();
      await load();
    } catch (e) {
      setError(e?.message || "Failed to delete community.");
      closeDeleteModal();
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="d-flex align-items-center gap-2 text-muted">
          <Spinner size="sm" />
          <span>Loading your communities…</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-4 fs-my-communities-header gap-2">
        <h2 className="fs-page-title mb-0">
          <i
            className="fa-solid fa-hammer me-2"
            style={{ color: "var(--fs-primary)" }}
          />
          My Created Communities
        </h2>
        <div className="d-flex gap-2 fs-my-communities-actions">
          <Button
            variant="outline-primary"
            size="sm"
            className="px-3"
            onClick={() => navigate("/communities")}
          >
            <i className="fa-solid fa-users me-2" style={{ fontSize: 12 }} />
            All Communities
          </Button>
          {user && (
            <Button
              variant="primary"
              size="sm"
              className="px-3"
              onClick={() => setShowCreate(true)}
            >
              <i className="fa-solid fa-plus me-2" style={{ fontSize: 12 }} />
              Create Community
            </Button>
          )}
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {communities.length === 0 ? (
        <Alert variant="secondary">
          <i className="fa-solid fa-inbox me-2" />
          You haven't created any communities yet.
        </Alert>
      ) : (
        communities.map((c) => (
          <div key={c.id} className="d-flex align-items-center gap-2 mb-2">
            <div className="flex-grow-1">
              <CommunityCard community={c} />
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              title="Delete community"
              onClick={() => openDeleteModal(c)}
              style={{ minWidth: 38, height: 38 }}
            >
              <i className="fa-solid fa-trash" style={{ fontSize: 12 }} />
            </Button>
          </div>
        ))
      )}

      {user && (
        <CreateCommunityForm
          show={showCreate}
          onHide={() => setShowCreate(false)}
          userId={user.id}
        />
      )}

      <DeleteConfirmModal
        show={deleteModal.show}
        onHide={closeDeleteModal}
        onDelete={handleDeleteCommunity}
        deleting={deleting}
        title="Delete community"
        warning={
          deleteModal.community
            ? `Are you sure you want to delete "${deleteModal.community.name}"? All posts will be deleted and all members removed. This action cannot be undone.`
            : "Are you sure you want to delete this community forever?"
        }
      />
    </Container>
  );
};

export default MyCommunities;
