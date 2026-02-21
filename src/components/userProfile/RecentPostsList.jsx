import { Link } from "react-router-dom";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";

const RecentPostsList = ({ posts }) => (
  <div>
    <h3 className="h6 mb-3" style={{ color: "var(--fs-text-secondary)" }}>
      <i
        className="fa-solid fa-pen-to-square me-2"
        style={{ fontSize: 14 }}
      />
      Recent posts
    </h3>

    {posts.length === 0 ? (
      <div className="text-muted" style={{ fontSize: "0.875rem" }}>
        This user hasn't posted yet.
      </div>
    ) : (
      <ListGroup variant="flush">
        {posts.map((post) => (
          <ListGroup.Item key={post.id} className="px-0 py-2">
            <div className="d-flex align-items-start justify-content-between gap-2">
              <div className="flex-grow-1 min-width-0">
                <Link
                  to={`/posts/${post.id}`}
                  className="fw-semibold text-truncate d-block fs-post-title"
                  style={{ fontSize: "0.9375rem" }}
                  title={post.title}
                >
                  {post.title}
                </Link>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className="fs-timestamp">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  <Badge
                    className="fs-score-badge"
                    style={{ fontSize: "0.6875rem" }}
                  >
                    <i
                      className="fa-solid fa-arrow-up me-1"
                      style={{ fontSize: 9 }}
                    />
                    {post.score ?? 0}
                  </Badge>
                  <Badge bg="secondary" style={{ fontSize: "0.6875rem" }}>
                    <i
                      className="fa-regular fa-comment me-1"
                      style={{ fontSize: 9 }}
                    />
                    {post.comment_count ?? 0}
                  </Badge>
                </div>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    )}
  </div>
);

export default RecentPostsList;
