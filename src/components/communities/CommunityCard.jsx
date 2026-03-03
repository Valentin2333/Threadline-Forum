import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";

const CommunityCard = ({ community }) => (
  <Card className="mb-2 fs-post-card">
    <Card.Body className="py-3 px-4">
      <div className="d-flex align-items-center justify-content-between">
        <div style={{ minWidth: 0 }}>
          <Link
            to={`/community/${encodeURIComponent(community.name)}`}
            className="fw-semibold text-decoration-none d-block text-truncate fs-community-name-link"
            style={{ color: "var(--fs-primary)", fontSize: "1rem" }}
            title={community.name}
          >
            {community.name}
          </Link>
          {community.description && (
            <div className="text-muted" style={{ fontSize: "0.8125rem" }}>
              {community.description.length > 120
                ? community.description.substring(0, 120) + "…"
                : community.description}
            </div>
          )}
        </div>
        <Badge
          bg="light"
          text="dark"
          className="ms-3"
          style={{ whiteSpace: "nowrap" }}
        >
          <i className="fa-solid fa-users me-1" style={{ fontSize: 10 }} />
          {community.member_count ?? 0}
        </Badge>
      </div>
    </Card.Body>
  </Card>
);

export default CommunityCard;