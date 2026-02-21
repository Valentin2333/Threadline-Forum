import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";

const RankedPostList = ({ title, icon, iconColor, posts, renderMeta }) => (
  <Card className="h-100">
    <Card.Header className="bg-dark text-light d-flex align-items-center gap-2">
      <i className={icon} style={{ fontSize: 14, color: iconColor }} />
      {title}
    </Card.Header>

    {posts.length === 0 ? (
      <Card.Body>
        <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
          No posts yet.
        </p>
      </Card.Body>
    ) : (
      <ListGroup variant="flush">
        {posts.map((post, i) => (
          <ListGroup.Item
            key={post.id}
            className="d-flex align-items-start gap-3 py-3"
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: "var(--fs-radius-sm)",
                background: iconColor
                  ? `${iconColor}1a`
                  : "var(--fs-primary-subtle)",
                color: iconColor || "var(--fs-primary)",
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
                {renderMeta(post)}
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    )}
  </Card>
);

export default RankedPostList;
