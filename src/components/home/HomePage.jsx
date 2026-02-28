import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { supabase } from "../../api/supabaseClient";
import useAuthUser from "../../hooks/useAuthUser";
import StatCard from "./StatCard";
import FeatureList from "./FeatureList";

const HomePage = () => {
  const { user } = useAuthUser();

  const [stats, setStats] = useState({
    users: null,
    posts: null,
    communities: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      setLoading(true);
      setError("");

      try {
        const [profilesRes, postsRes, communitiesRes] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("posts").select("*", { count: "exact", head: true }),
          supabase
            .from("communities")
            .select("*", { count: "exact", head: true }),
        ]);

        if (profilesRes.error) throw profilesRes.error;
        if (postsRes.error) throw postsRes.error;
        if (communitiesRes.error) throw communitiesRes.error;

        if (!cancelled) {
          setStats({
            users: profilesRes.count ?? 0,
            posts: postsRes.count ?? 0,
            communities: communitiesRes.count ?? 0,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Could not load platform stats.");
          setStats({ users: null, posts: null, communities: null });
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

  return (
    <Container className="py-4">
      <Row className="g-4 align-items-stretch">
        <Col xs={12} lg={7}>
          <Card className="h-100 card-hover-lift">
            <Card.Body className="d-flex flex-column p-4">
              <div className="mb-4">
                <h1 className="fs-page-title mb-2">
                  {user
                    ? `${username ? `${username}'s here 👋` : ""}`
                    : "Threadline"}
                </h1>
                <p className="text-muted mb-0">
                  A community space - join communities, post ideas, discuss in
                  comments, vote, and build your profile.
                </p>
              </div>

              <Row className="g-3 mb-4">
                <Col xs={12} md={4}>
                  <StatCard
                    value={stats.users}
                    label="Members"
                    icon="fa-solid fa-users"
                    loading={loading}
                  />
                </Col>
                <Col xs={12} md={4}>
                  <StatCard
                    value={stats.posts}
                    label="Posts created"
                    icon="fa-solid fa-pen-to-square"
                    loading={loading}
                  />
                </Col>
                <Col xs={12} md={4}>
                  <StatCard
                    value={stats.communities}
                    label="Communities"
                    icon="fa-solid fa-people-group"
                    loading={loading}
                  />
                </Col>
              </Row>

              {error ? (
                <Alert variant="warning" className="mb-3">
                  {error}
                </Alert>
              ) : null}

              <div className="mt-auto d-flex flex-wrap gap-2">
                <Button
                  as={Link}
                  to="/communities"
                  variant="primary"
                  className="px-4"
                >
                  <i
                    className="fa-solid fa-users me-2"
                    style={{ fontSize: 13 }}
                  />
                  Browse communities
                </Button>

                <Button
                  as={Link}
                  to="/posts"
                  variant="outline-primary"
                  className="px-4"
                >
                  <i
                    className="fa-solid fa-newspaper me-2"
                    style={{ fontSize: 13 }}
                  />
                  View feed
                </Button>

                {user ? (
                  <Button as={Link} to="/profile" variant="outline-secondary">
                    <i
                      className="fa-solid fa-user me-2"
                      style={{ fontSize: 13 }}
                    />
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
          <FeatureList />
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
