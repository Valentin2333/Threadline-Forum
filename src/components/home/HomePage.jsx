import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";
import { supabase } from "../../api/supabaseClient";
import useAuthUser from "../navigation/hooks/useAuthUser";

const HomePage = () => {
  const user = useAuthUser();

  const [stats, setStats] = useState({ users: null, posts: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      setLoading(true);
      setError("");

      try {
        const [profilesRes, postsRes] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("posts").select("*", { count: "exact", head: true }),
        ]);

        if (profilesRes.error) throw profilesRes.error;
        if (postsRes.error) throw postsRes.error;

        if (!cancelled) {
          setStats({
            users: profilesRes.count ?? 0,
            posts: postsRes.count ?? 0,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Could not load platform stats.");
          setStats({ users: null, posts: null });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setUsername("");
      return;
    }

    let cancelled = false;

    const loadUsername = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (!cancelled && !error && data?.username) {
        setUsername(data.username);
      }
    };

    loadUsername();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const StatValue = ({ value, label, icon }) => (
    <Card className="h-100 fs-stat-card card-hover-lift">
      <Card.Body className="d-flex align-items-center gap-3">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--fs-radius-sm)",
            background: "var(--fs-primary-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <i className={icon} style={{ color: "var(--fs-primary)", fontSize: 18 }} />
        </div>
        <div>
          <div className="text-muted" style={{ fontSize: "0.75rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {label}
          </div>
          <div className="fw-bold" style={{ fontSize: "1.375rem", lineHeight: 1.2, color: "var(--fs-text)" }}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              (value ?? "—")
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container className="py-4">
      <Row className="g-4 align-items-stretch">
        <Col xs={12} lg={7}>
          <Card className="h-100 card-hover-lift">
            <Card.Body className="d-flex flex-column p-4">
              <div className="mb-4">
                <h1 className="fs-page-title mb-2">
                  {user
                    ? `Welcome back${username ? `, ${username}` : ""}!`
                    : "Welcome to Forum"}
                </h1>
                <p className="text-muted mb-0">
                  A community space — post ideas, discuss in comments, and build
                  your profile.
                </p>
              </div>

              <Row className="g-3 mb-4">
                <Col xs={12} md={6}>
                  <StatValue value={stats.users} label="Members" icon="fa-solid fa-users" />
                </Col>
                <Col xs={12} md={6}>
                  <StatValue value={stats.posts} label="Posts created" icon="fa-solid fa-pen-to-square" />
                </Col>
              </Row>

              {error ? (
                <Alert variant="warning" className="mb-3">
                  {error}
                </Alert>
              ) : null}

              <div className="mt-auto d-flex flex-wrap gap-2">
                <Button as={Link} to="/posts" variant="primary" className="px-4">
                  <i className="fa-solid fa-newspaper me-2" style={{ fontSize: 13 }} />
                  Browse posts
                </Button>

                {user ? (
                  <Button as={Link} to="/profile" variant="outline-secondary">
                    <i className="fa-solid fa-user me-2" style={{ fontSize: 13 }} />
                    View profile
                  </Button>
                ) : (
                  <>
                    <Button
                      as={Link}
                      to="/register"
                      variant="outline-secondary"
                    >
                      Create account
                    </Button>
                    <Button as={Link} to="/login" variant="outline-secondary">
                      Log in
                    </Button>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={5}>
          <Card className="h-100">
            <Card.Header className="bg-dark text-light d-flex align-items-center gap-2">
              <i className="fa-solid fa-bolt" style={{ fontSize: 14 }} />
              Core features
            </Card.Header>

            <ListGroup variant="flush">
              {[
                { title: "Create and browse posts", desc: "Share ideas with a title + content and see the newest posts first.", badge: "Posts", icon: "fa-solid fa-pen" },
                { title: "Upvote or downvote posts", desc: "Upvote or downvote posts that you like or dislike.", badge: "Posts", icon: "fa-solid fa-thumbs-up" },
                { title: "Comment threads", desc: "Discuss posts with replies that include author information and timestamps.", badge: "Comments", icon: "fa-solid fa-comments" },
                { title: "Profiles + profile pictures", desc: "Customize your profile and upload an avatar to storage.", badge: "Profile", icon: "fa-solid fa-image" },
                { title: "Account management", desc: "Update your profile data and delete your account when needed.", badge: "Settings", icon: "fa-solid fa-gear" },
                { title: "Authentication", desc: "Secure signup/login with Supabase Auth and session-aware navigation.", badge: "Auth", icon: "fa-solid fa-lock" },
              ].map((f, i) => (
                <ListGroup.Item key={i} className="fs-feature-item">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div className="d-flex gap-3 align-items-start">
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "var(--fs-radius-sm)",
                          background: "var(--fs-primary-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        <i className={f.icon} style={{ color: "var(--fs-primary)", fontSize: 13 }} />
                      </div>
                      <div>
                        <div className="fw-semibold" style={{ fontSize: "0.875rem" }}>{f.title}</div>
                        <div className="text-muted" style={{ fontSize: "0.8125rem" }}>
                          {f.desc}
                        </div>
                      </div>
                    </div>
                    <Badge bg="light" text="dark">
                      {f.badge}
                    </Badge>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <Card.Body className="pt-3">
              <div className="text-muted" style={{ fontSize: "0.8125rem" }}>
                <i className="fa-solid fa-lightbulb me-1" style={{ color: "var(--fs-warning)" }} />
                Tip: Head to <span className="fw-semibold">Posts</span> to start
                a new discussion.
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
