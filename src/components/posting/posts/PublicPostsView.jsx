import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMostCommentedPosts,
  getRecentPostsSummary,
} from "../../../api/posts";
import { getTopCommunities } from "../../../api/communities";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

import RankedPostList from "./RankedPostList";
import CommunityCard from "../../communities/CommunityCard";
import GlobalSearchBar from "../../communities/GlobalSearchBar";

const PublicPostsView = () => {
  const [mostCommented, setMostCommented] = useState([]);
  const [newest, setNewest] = useState([]);
  const [topCommunities, setTopCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [commented, recent, communities] = await Promise.all([
          getMostCommentedPosts(10),
          getRecentPostsSummary(10),
          getTopCommunities(10),
        ]);

        if (!cancelled) {
          setMostCommented(commented);
          setNewest(recent);
          setTopCommunities(communities);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Failed to load posts.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Container className="py-4">
        <div className="d-flex align-items-center gap-2 text-muted">
          <Spinner size="sm" />
          <span>Loading…</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fs-page-title mb-1">Feed</h2>
          <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
            <i className="fa-solid fa-lock me-1" style={{ fontSize: 12 }} />
            Log in to create communities, posts, comment, and vote.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <div className="d-flex flex-wrap gap-2 mb-4">
        <Button
          as={Link}
          to="/login"
          variant="primary"
          size="sm"
          className="px-3"
        >
          Log in
        </Button>
        <Button
          as={Link}
          to="/register"
          variant="outline-primary"
          size="sm"
          className="px-3"
        >
          Create account
        </Button>
      </div>

      <Row className="g-4">
        <Col xs={12} lg={6}>
          <RankedPostList
            title="Most Commented Posts"
            icon="fa-solid fa-fire"
            iconColor="#f59e0b"
            posts={mostCommented}
            renderMeta={(post) => (
              <>
                <Badge
                  className="fs-score-badge"
                  style={{ fontSize: "0.6875rem" }}
                >
                  <i
                    className="fa-regular fa-comment me-1"
                    style={{ fontSize: 10 }}
                  />
                  {post.comment_count ?? 0} comments
                </Badge>
                <span className="fs-timestamp">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </>
            )}
          />
        </Col>

        <Col xs={12} lg={6}>
          <RankedPostList
            title="Recently Added Posts"
            icon="fa-solid fa-clock"
            iconColor="#06b6d4"
            posts={newest}
            renderMeta={(post) => (
              <>
                <span className="fs-timestamp">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
                <Badge bg="secondary" style={{ fontSize: "0.6875rem" }}>
                  <i
                    className="fa-solid fa-arrow-up me-1"
                    style={{ fontSize: 9 }}
                  />
                  {post.score ?? 0}
                </Badge>
              </>
            )}
          />
        </Col>

        {/* Top Communities Section */}
        {topCommunities.length > 0 && (
          <div className="mb-4">
            <h5 className="mb-3" style={{ color: "var(--fs-text-secondary)" }}>
              <i className="fa-solid fa-fire me-2" style={{ fontSize: 13 }} />
              Popular Communities
            </h5>
            {topCommunities.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        )}
      </Row>
    </Container>
  );
};

export default PublicPostsView;
