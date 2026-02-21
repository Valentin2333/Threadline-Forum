import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";

const StatCard = ({ value, label, icon, loading }) => (
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
        <i
          className={icon}
          style={{ color: "var(--fs-primary)", fontSize: 18 }}
        />
      </div>
      <div>
        <div
          className="text-muted"
          style={{
            fontSize: "0.75rem",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </div>
        <div
          className="fw-bold"
          style={{
            fontSize: "1.375rem",
            lineHeight: 1.2,
            color: "var(--fs-text)",
          }}
        >
          {loading ? <Spinner animation="border" size="sm" /> : (value ?? "—")}
        </div>
      </div>
    </Card.Body>
  </Card>
);

export default StatCard;
