import { useEffect, useMemo, useState } from "react";
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


    const StatValue = ({ value, label }) => (
        <Card className="h-100 shadow-sm">
            <Card.Body>
                <div className="d-flex align-items-start justify-content-between gap-2">
                    <div>
                        <Card.Title className="mb-1">{label}</Card.Title>
                        <Card.Text className="text-muted mb-0">
                            Live count from the database
                        </Card.Text>
                    </div>

                    <Badge bg="secondary" className="fs-6">
                        {loading ? (
                            <span className="d-inline-flex align-items-center gap-2">
                                <Spinner animation="border" size="sm" /> Loading
                            </span>
                        ) : (
                            value ?? "—"
                        )}
                    </Badge>
                </div>
            </Card.Body>
        </Card>
    );

    return (
        <Container className="py-4">
            <Row className="g-4 align-items-stretch">
                <Col xs={12} lg={7}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column">
                            <div className="mb-3">
                                <h1 className="h3 mb-2">
                                    {user
                                        ? `Welcome back${username ? `, ${username}` : ""}!`
                                        : "Welcome to Forum"}
                                </h1>
                                <p className="text-muted mb-0">
                                    A simple community space powered by Supabase — post ideas,
                                    discuss in comments, and build your profile.
                                </p>
                            </div>

                            <Row className="g-3 mb-3">
                                <Col xs={12} md={6}>
                                    <StatValue value={stats.users} label="Members" />
                                </Col>
                                <Col xs={12} md={6}>
                                    <StatValue value={stats.posts} label="Posts created" />
                                </Col>
                            </Row>

                            {error ? (
                                <Alert variant="warning" className="mb-3">
                                    {error}
                                </Alert>
                            ) : null}

                            <div className="mt-auto d-flex flex-wrap gap-2">
                                <Button as={Link} to="/posts" variant="primary">
                                    Browse posts
                                </Button>

                                {user ? (
                                    <Button as={Link} to="/profile" variant="outline-secondary">
                                        View profile
                                    </Button>
                                ) : (
                                    <>
                                        <Button as={Link} to="/register" variant="outline-secondary">
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
                    <Card className="h-100 shadow-sm">
                        <Card.Header className="bg-dark text-light">
                            Core features
                        </Card.Header>

                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <div className="d-flex justify-content-between align-items-start gap-3">
                                    <div>
                                        <div className="fw-semibold">Create and browse posts</div>
                                        <div className="text-muted small">
                                            Share ideas with a title + content and see the newest posts
                                            first.
                                        </div>
                                    </div>
                                    <Badge bg="light" text="dark">
                                        Posts
                                    </Badge>
                                </div>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <div className="d-flex justify-content-between align-items-start gap-3">
                                    <div>
                                        <div className="fw-semibold">Comment threads</div>
                                        <div className="text-muted small">
                                            Discuss posts with replies that include author information
                                            and timestamps.
                                        </div>
                                    </div>
                                    <Badge bg="light" text="dark">
                                        Comments
                                    </Badge>
                                </div>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <div className="d-flex justify-content-between align-items-start gap-3">
                                    <div>
                                        <div className="fw-semibold">Profiles + avatars</div>
                                        <div className="text-muted small">
                                            Customize your profile and upload an avatar to storage.
                                        </div>
                                    </div>
                                    <Badge bg="light" text="dark">
                                        Profile
                                    </Badge>
                                </div>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <div className="d-flex justify-content-between align-items-start gap-3">
                                    <div>
                                        <div className="fw-semibold">Authentication</div>
                                        <div className="text-muted small">
                                            Secure signup/login with Supabase Auth and session-aware
                                            navigation.
                                        </div>
                                    </div>
                                    <Badge bg="light" text="dark">
                                        Auth
                                    </Badge>
                                </div>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <div className="d-flex justify-content-between align-items-start gap-3">
                                    <div>
                                        <div className="fw-semibold">Account management</div>
                                        <div className="text-muted small">
                                            Update your profile data and delete your account when
                                            needed.
                                        </div>
                                    </div>
                                    <Badge bg="light" text="dark">
                                        Settings
                                    </Badge>
                                </div>
                            </ListGroup.Item>
                        </ListGroup>

                        <Card.Body className="pt-3">
                            <div className="text-muted small">
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
