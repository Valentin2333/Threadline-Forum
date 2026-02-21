import { useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import { getAdminStats } from "../../api/admin";

const StatCard = ({ label, value, icon, loading }) => (
  <Card className="h-100 fs-stat-card">
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
          {loading ? <Spinner size="sm" /> : (value ?? "—")}
        </div>
      </div>
    </Card.Body>
  </Card>
);

const AdminStats = () => {
  const [stats, setStats] = useState({ users: null, posts: null, comments: null, blocked: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getAdminStats();
        if (!cancelled) setStats(data);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <Row className="g-3">
      <Col xs={6} lg={3}>
        <StatCard label="Users" value={stats.users} icon="fa-solid fa-users" loading={loading} />
      </Col>
      <Col xs={6} lg={3}>
        <StatCard label="Posts" value={stats.posts} icon="fa-solid fa-pen-to-square" loading={loading} />
      </Col>
      <Col xs={6} lg={3}>
        <StatCard label="Comments" value={stats.comments} icon="fa-solid fa-comments" loading={loading} />
      </Col>
      <Col xs={6} lg={3}>
        <StatCard label="Blocked" value={stats.blocked} icon="fa-solid fa-ban" loading={loading} />
      </Col>
    </Row>
  );
};

export default AdminStats;