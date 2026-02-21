import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMostCommentedPosts, getRecentPostsSummary } from "../../../api/posts";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

import RankedPostList from "./RankedPostList";

const PublicPostsView = () => {
  const [mostCommented, setMostCommented] = useState([]);
  const [newest, setNewest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [commented, recent] = await Promise.all([
          getMostCommentedPosts(10),
          getRecentPostsSummary(10),
        ]);

        if (!cancelled) {
          setMostCommented(commented);
          setNewest(recent);
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
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Container className="py-4">
        <div className="d-flex align-items-center gap-2 text-muted">
          <Spinner size="sm" />
          <span>Loading posts…</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2 className="fs-page-title mb-1">Posts</h2>
        <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
          <i className="fa-solid fa-lock me-1" style={{ fontSize: 12 }} />
          Log in to create posts, comment, and vote.
        </p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-3">{error}</Alert>
      )}

      <div className="d-flex flex-wrap gap-2 mb-4">
        <Button as={Link} to="/login" variant="primary" size="sm" className="px-3">
          Log in
        </Button>
        <Button as={Link} to="/register" variant="outline-primary" size="sm" className="px-3">
          Create account
        </Button>
      </div>

      <Row className="g-4">
        <Col xs={12} lg={6}>
          <RankedPostList
            title="Most Commented"
            icon="fa-solid fa-fire"
            iconColor="#f59e0b"
            posts={mostCommented}
            renderMeta={(post) => (
              <>
                <Badge className="fs-score-badge" style={{ fontSize: "0.6875rem" }}>
                  <i className="fa-regular fa-comment me-1" style={{ fontSize: 10 }} />
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
            title="Recently Added"
            icon="fa-solid fa-clock"
            iconColor="#06b6d4"
            posts={newest}
            renderMeta={(post) => (
              <>
                <span className="fs-timestamp">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
                <Badge bg="secondary" style={{ fontSize: "0.6875rem" }}>
                  <i className="fa-solid fa-arrow-up me-1" style={{ fontSize: 9 }} />
                  {post.score ?? 0}
                </Badge>
              </>
            )}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default PublicPostsView;
