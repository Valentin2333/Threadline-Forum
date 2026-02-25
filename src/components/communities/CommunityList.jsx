import { useEffect, useState } from "react";
import { getTopCommunities, getUserCommunities } from "../../api/communities";
import useAuthUser from "../navigation/hooks/useAuthUser";
import CommunityCard from "./CommunityCard";
import CreateCommunityForm from "./CreateCommunityForm";
import GlobalSearchBar from "./GlobalSearchBar";

import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";

const CommunityList = () => {
  const user = useAuthUser();
  const [topCommunities, setTopCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const top = await getTopCommunities(20);
        if (!cancelled) setTopCommunities(top);

        if (user?.id) {
          const mine = await getUserCommunities(user.id);
          if (!cancelled) setMyCommunities(mine);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load communities.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (loading) {
    return (
      <Container className="py-4">
        <div className="d-flex align-items-center gap-2 text-muted">
          <Spinner size="sm" />
          <span>Loading communities…</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <h2 className="fs-page-title mb-0">
          <i
            className="fa-solid fa-users me-2"
            style={{ color: "var(--fs-primary)" }}
          />
          Communities
        </h2>
        <div className="d-flex align-items-stretch gap-2 fs-communities-actions">
          <GlobalSearchBar />
          {user && (
            <Button
              variant="primary"
              className="px-3 d-flex align-items-center justify-content-center"
              style={{ whiteSpace: "nowrap" }}
              onClick={() => setShowCreate(true)}
            >
              <i className="fa-solid fa-plus me-2" style={{ fontSize: 12 }} />
              Create Community
            </Button>
          )}
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {user && myCommunities.length > 0 && (
        <div className="mb-4">
          <h5 className="mb-3" style={{ color: "var(--fs-text-secondary)" }}>
            <i className="fa-solid fa-star me-2" style={{ fontSize: 13 }} />
            Your Communities
          </h5>
          {myCommunities.map((c) => (
            <CommunityCard key={c.id} community={c} />
          ))}
        </div>
      )}

      <div>
        <h5 className="mb-3" style={{ color: "var(--fs-text-secondary)" }}>
          <i className="fa-solid fa-fire me-2" style={{ fontSize: 13 }} />
          Top Communities
        </h5>
        {topCommunities.length === 0 ? (
          <p className="text-muted">
            No communities yet. Be the first to create one!
          </p>
        ) : (
          topCommunities.map((c) => <CommunityCard key={c.id} community={c} />)
        )}
      </div>

      {user && (
        <CreateCommunityForm
          show={showCreate}
          onHide={() => setShowCreate(false)}
          userId={user.id}
        />
      )}
    </Container>
  );
};

export default CommunityList;
