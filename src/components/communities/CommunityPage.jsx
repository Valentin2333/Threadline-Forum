import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import {
  getCommunityByName,
  getCommunityPosts,
  deleteCommunity,
} from "../../api/communities";
import useAuthUser from "../navigation/hooks/useAuthUser";
import useAdminStatus from "../admin/hooks/useAdminStatus";
import useCommunityMembership from "./hooks/useCommunityMembership";

import CommunityHeader from "./CommunityHeader";
import CommunityMembers from "./CommunityMembers";
import CommunityCreatePostForm from "./CommunityCreatePostForm";
import CommunityPostList from "./CommunityPostList";
import DeleteConfirmModal from "../shared/DeleteConfirmModal";

import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const CommunityPage = () => {
  const { communityName } = useParams();
  const decodedName = decodeURIComponent(communityName || "");
  const navigate = useNavigate();

  const user = useAuthUser();
  const { isAdmin } = useAdminStatus(user?.id);
  const userId = useMemo(() => user?.id ?? null, [user]);

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [showMembers, setShowMembers] = useState(false);

  // community delete modal
  const [communityDeleteModal, setCommunityDeleteModal] = useState(false);
  const [communityDeleting, setCommunityDeleting] = useState(false);

  const isCreator = Boolean(userId && community?.creator_id === userId);
  const membership = useCommunityMembership({
    communityId: community?.id,
    userId,
  });

  const isOwn = (authorId) =>
    Boolean(userId && authorId && userId === authorId);

  const canManagePost = (authorId) => {
    if (!userId) return false;
    if (userId === authorId) return true;
    if (isAdmin) return true;
    if (isCreator) return true;
    return false;
  };

  const loadCommunity = useCallback(async () => {
    if (!decodedName) return;
    try {
      const data = await getCommunityByName(decodedName);
      setCommunity(data);
    } catch (e) {
      setCommunity(null);
      setServerError(e?.message || "Community not found.");
    }
  }, [decodedName]);

  const loadPosts = useCallback(async () => {
    if (!community?.id) return;
    try {
      const data = await getCommunityPosts(community.id);
      setPosts(data ?? []);
    } catch (e) {
      setServerError(e?.message || "Failed to load posts.");
    }
  }, [community?.id]);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      setInitialLoading(true);
      setServerError("");
      try {
        const cData = await getCommunityByName(decodedName);
        if (!cancelled) setCommunity(cData);
        if (cData?.id) {
          const pData = await getCommunityPosts(cData.id);
          if (!cancelled) setPosts(pData ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setCommunity(null);
          setServerError(e?.message || "Community not found.");
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [decodedName]);

  const handleJoin = async () => {
    try {
      await membership.join();
      await loadCommunity();
    } catch (e) {
      setServerError(e?.message || "Failed to join.");
    }
  };

  const handleLeave = async () => {
    try {
      await membership.leave();
      await loadCommunity();
    } catch (e) {
      setServerError(e?.message || "Failed to leave.");
    }
  };

  const handleOpenDeleteCommunity = () => setCommunityDeleteModal(true);
  const handleCloseDeleteCommunity = () => setCommunityDeleteModal(false);

  const handleDeleteCommunity = async () => {
    if (!community?.id) return;
    setCommunityDeleting(true);
    setServerError("");
    try {
      await deleteCommunity(community.id);
      setCommunityDeleteModal(false);
      navigate("/communities", { replace: true });
    } catch (e) {
      setServerError(e?.message || "Failed to delete community.");
      setCommunityDeleteModal(false);
    } finally {
      setCommunityDeleting(false);
    }
  };

  if (!decodedName) return <Navigate to="/feed" replace />;

  if (initialLoading) {
    return (
      <Container className="py-4">
        <div className="d-flex align-items-center gap-2 text-muted">
          <Spinner size="sm" />
          <span>Loading community…</span>
        </div>
      </Container>
    );
  }

  if (!community) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{serverError || "Community not found."}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      {/* Back button */}
      <div className="mb-3">
        <Button
          variant="outline-secondary"
          size="sm"
          className="d-inline-flex align-items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          <span>Back</span>
        </Button>
      </div>

      <CommunityHeader
        community={community}
        isMember={membership.member}
        memberLoading={membership.loading}
        isCreator={isCreator}
        isAdmin={isAdmin}
        userId={userId}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onManageMembers={() => setShowMembers(true)}
        onDeleteCommunity={handleOpenDeleteCommunity}
      />

      {serverError && (
        <Alert variant="danger" className="py-2">
          {serverError}
        </Alert>
      )}

      {membership.member && userId && (
        <CommunityCreatePostForm
          communityId={community.id}
          communityName={community.name}
          userId={userId}
          onPostCreated={loadPosts}
        />
      )}

      <CommunityPostList
        posts={posts}
        userId={userId}
        isMember={membership.member}
        isOwn={isOwn}
        canManage={canManagePost}
        onReload={loadPosts}
        setServerError={setServerError}
      />

      {/* Delete community modal */}
      <DeleteConfirmModal
        show={communityDeleteModal}
        onHide={handleCloseDeleteCommunity}
        onDelete={handleDeleteCommunity}
        deleting={communityDeleting}
        title="Delete community"
        warning={`Are you sure you want to delete "${community.name}"? All posts will be deleted and all members removed. This action cannot be undone.`}
      />

      <CommunityMembers
        show={showMembers}
        onHide={() => setShowMembers(false)}
        communityId={community.id}
        creatorId={community.creator_id}
        onMemberRemoved={loadCommunity}
      />
    </Container>
  );
};

export default CommunityPage;
