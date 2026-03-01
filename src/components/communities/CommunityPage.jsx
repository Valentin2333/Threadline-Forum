import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import {
  getCommunityByName,
  getCommunityPosts,
  getCommunityPostCount,
  deleteCommunity,
} from "../../api/communities";
import useAuthUser from "../../hooks/useAuthUser";
import useAdminStatus from "../admin/hooks/useAdminStatus";
import useCommunityMembership from "./hooks/useCommunityMembership";

import CommunityHeader from "./CommunityHeader";
import CommunityMembers from "./CommunityMembers";
import CommunityCreatePostForm from "./CommunityCreatePostForm";
import CommunityPostList from "./CommunityPostList";
import DeleteConfirmModal from "../shared/DeleteConfirmModal";
import useRealtimePosts from "../../api/useRealtimePosts";
import useContentPermissions from "../../hooks/useContentPermissions";

import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const PAGE_SIZE = 10;

const CommunityPage = () => {
  const { communityName } = useParams();
  let decodedName;
  try {
    decodedName = decodeURIComponent(communityName || "");
  } catch {
    decodedName = "";
  }
  const navigate = useNavigate();

  const { user } = useAuthUser();
  const { isAdmin } = useAdminStatus(user?.id);
  const userId = useMemo(() => user?.id ?? null, [user]);

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [showMembers, setShowMembers] = useState(false);

  const [communityDeleteModal, setCommunityDeleteModal] = useState(false);
  const [communityDeleting, setCommunityDeleting] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const isCreator = Boolean(userId && community?.creator_id === userId);
  const { isOwn, canManage: canManagePost } = useContentPermissions({
    userId,
    isAdmin,
    isCreator,
  });
  const membership = useCommunityMembership({
    communityId: community?.id,
    userId,
  });

  const loadCommunity = useCallback(async () => {
    if (!decodedName) return;
    try {
      const data = await getCommunityByName(decodedName);
      setCommunity(data);
    } catch (e) {
      setCommunity(null);
      const msg = e?.message || "";
      if (msg.includes("JSON object") || msg.includes("invalid input syntax")) {
        setServerError("Community not found.");
      } else {
        setServerError(msg || "Community not found.");
      }
    }
  }, [decodedName]);

  const loadPosts = useCallback(
    async ({ reset = false } = {}) => {
      if (!community?.id) return;
      try {
        if (reset) {
          const currentCount = Math.max((page + 1) * PAGE_SIZE, PAGE_SIZE);
          const data = await getCommunityPosts(community.id, {
            from: 0,
            to: currentCount - 1,
          });
          setPosts(data ?? []);
          setHasMore((data ?? []).length >= currentCount);
        } else {
          const data = await getCommunityPosts(community.id, {
            from: 0,
            to: PAGE_SIZE - 1,
          });
          setPosts(data ?? []);
          setHasMore((data ?? []).length >= PAGE_SIZE);
          setPage(0);
        }
        const total = await getCommunityPostCount(community.id);
        setPostCount(total);
      } catch (e) {
        setServerError(e?.message || "Failed to load posts.");
      }
    },
    [community?.id, page],
  );

  const loadMorePosts = useCallback(async () => {
    if (!community?.id || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const from = nextPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const data = await getCommunityPosts(community.id, { from, to });
      const newPosts = data ?? [];
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const unique = newPosts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...unique];
      });
      setHasMore(newPosts.length >= PAGE_SIZE);
      setPage(nextPage);
    } catch (e) {
      console.error("Failed loading more posts:", e.message);
      setServerError(e?.message || "Failed loading more posts.");
    } finally {
      setLoadingMore(false);
    }
  }, [community?.id, page, loadingMore, hasMore]);

  const silentReload = useCallback(
    () => loadPosts({ reset: true }),
    [loadPosts],
  );

  useRealtimePosts({
    channelName: `community-${community?.id}`,
    communityId: community?.id,
    onUpdate: silentReload,
  });

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      setInitialLoading(true);
      setServerError("");
      try {
        const cData = await getCommunityByName(decodedName);
        if (!cancelled) setCommunity(cData);
        if (cData?.id) {
          const pData = await getCommunityPosts(cData.id, {
            from: 0,
            to: PAGE_SIZE - 1,
          });
          if (!cancelled) {
            setPosts(pData ?? []);
            setHasMore((pData ?? []).length >= PAGE_SIZE);
            setPage(0);
          }
          const total = await getCommunityPostCount(cData.id);
          if (!cancelled) setPostCount(total);
        }
      } catch (e) {
        if (!cancelled) {
          setCommunity(null);
          const msg = e?.message || "";
          if (
            msg.includes("JSON object") ||
            msg.includes("invalid input syntax")
          ) {
            setServerError("Community not found.");
          } else {
            setServerError(msg || "Community not found.");
          }
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
      const msg = e?.message || "Failed to join.";
      if (msg.includes("row-level security")) {
        setServerError(
          "Your account has been blocked. You cannot join communities.",
        );
      } else {
        setServerError(msg);
      }
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
      <Container className="py-3">
        <div className="d-flex align-items-center gap-2 text-muted">
          <Spinner size="sm" />
          <span>Loading community…</span>
        </div>
      </Container>
    );
  }

  if (!community) {
    return (
      <Container className="py-3">
        <Alert variant="danger">{serverError || "Community not found."}</Alert>
        <Button
          variant="outline-secondary"
          size="sm"
          className="d-inline-flex align-items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          <span>Go back</span>
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-3">
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
        postCount={postCount}
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
          onPostCreated={silentReload}
        />
      )}

      <CommunityPostList
        posts={posts}
        userId={userId}
        isMember={membership.member}
        isOwn={isOwn}
        canManage={canManagePost}
        onReload={silentReload}
        setServerError={setServerError}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMorePosts}
      />

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
