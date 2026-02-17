import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMostCommentedPosts, getRecentPostsSummary } from "../../api/posts";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

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
        {/* Most commented */}
        <Col xs={12} lg={6}>
          <Card className="h-100">
            <Card.Header className="bg-dark text-light d-flex align-items-center gap-2">
              <i className="fa-solid fa-fire" style={{ fontSize: 14, color: "#f59e0b" }} />
              Most Commented
            </Card.Header>

            {mostCommented.length === 0 ? (
              <Card.Body>
                <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>No posts yet.</p>
              </Card.Body>
            ) : (
              <ListGroup variant="flush">
                {mostCommented.map((post, i) => (
                  <ListGroup.Item
                    key={post.id}
                    className="d-flex align-items-start gap-3 py-3"
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "var(--fs-radius-sm)",
                        background: "var(--fs-primary-subtle)",
                        color: "var(--fs-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {i + 1}
                    </span>

                    <div className="flex-grow-1 min-width-0">
                      <div
                        className="fw-semibold text-truncate"
                        style={{ fontSize: "0.9375rem" }}
                        title={post.title}
                      >
                        {post.title}
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <Badge className="fs-score-badge" style={{ fontSize: "0.6875rem" }}>
                          <i className="fa-regular fa-comment me-1" style={{ fontSize: 10 }} />
                          {post.comment_count ?? 0} comments
                        </Badge>
                        <span className="fs-timestamp">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card>
        </Col>

        {/* Most recent */}
        <Col xs={12} lg={6}>
          <Card className="h-100">
            <Card.Header className="bg-dark text-light d-flex align-items-center gap-2">
              <i className="fa-solid fa-clock" style={{ fontSize: 14, color: "#06b6d4" }} />
              Recently Added
            </Card.Header>

            {newest.length === 0 ? (
              <Card.Body>
                <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>No posts yet.</p>
              </Card.Body>
            ) : (
              <ListGroup variant="flush">
                {newest.map((post, i) => (
                  <ListGroup.Item
                    key={post.id}
                    className="d-flex align-items-start gap-3 py-3"
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "var(--fs-radius-sm)",
                        background: "rgba(6, 182, 212, 0.1)",
                        color: "#06b6d4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {i + 1}
                    </span>

                    <div className="flex-grow-1 min-width-0">
                      <div
                        className="fw-semibold text-truncate"
                        style={{ fontSize: "0.9375rem" }}
                        title={post.title}
                      >
                        {post.title}
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span className="fs-timestamp">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <Badge bg="secondary" style={{ fontSize: "0.6875rem" }}>
                          <i className="fa-solid fa-arrow-up me-1" style={{ fontSize: 9 }} />
                          {post.score ?? 0}
                        </Badge>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PublicPostsView;