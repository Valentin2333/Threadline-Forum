import { Link } from "react-router-dom";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Dropdown from "react-bootstrap/Dropdown";
import AvatarFromStorage from "../posting/posts/AvatarFromStorage";

const CommunityHeader = ({
  community,
  postCount,
  isMember,
  memberLoading,
  isCreator,
  isAdmin,
  userId,
  onJoin,
  onLeave,
  onManageMembers,
  onDeleteCommunity,
}) => {
  if (!community) return null;

  const canDelete = isCreator || isAdmin;

  return (
    <Card className="mb-4">
      <Card.Body className="p-4">
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
          <div>
            <h2 className="fs-page-title mb-1">{community.name}</h2>
            {community.description && (
              <p className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>
                {community.description}
              </p>
            )}
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <Badge bg="light" text="dark">
                <i
                  className="fa-solid fa-users me-1"
                  style={{ fontSize: 10 }}
                />
                {community.member_count ?? 0} members
              </Badge>
              <Badge bg="light" text="dark">
                <i
                  className="fa-solid fa-message me-1"
                  style={{ fontSize: 10 }}
                />
                {postCount ?? 0} posts
              </Badge>
              <span className="text-muted" style={{ fontSize: "0.8125rem" }}>
                Created {new Date(community.created_at).toLocaleDateString()}
              </span>
              {community.creator && (
                <span
                  className="d-flex align-items-center gap-1"
                  style={{ fontSize: "0.8125rem" }}
                >
                  <span className="text-muted">by</span>
                  <Link
                    to={`/profile/${community.creator_id}`}
                    className="d-flex align-items-center gap-1 text-decoration-none"
                  >
                    <AvatarFromStorage
                      pathOrUrl={community.creator?.avatar_url}
                      size="sm"
                    />
                    <span className="fs-author-name-link">
                      {community.creator?.username || "Unknown"}
                    </span>
                  </Link>
                </span>
              )}
            </div>
          </div>

          <div className="d-flex gap-2 align-items-center">
            {isCreator && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onManageMembers}
              >
                <i
                  className="fa-solid fa-user-gear me-1"
                  style={{ fontSize: 12 }}
                />
                Members
              </Button>
            )}

            {userId &&
              !memberLoading &&
              (isMember ? (
                !isCreator ? (
                  <Button variant="danger" size="sm" onClick={onLeave}>
                    <i
                      className="fa-solid fa-right-from-bracket me-1"
                      style={{ fontSize: 12 }}
                    />
                    Leave
                  </Button>
                ) : (
                  <Badge bg="success" className="py-2 px-3">
                    <i
                      className="fa-solid fa-crown me-1"
                      style={{ fontSize: 10 }}
                    />
                    Creator
                  </Badge>
                )
              ) : (
                <Button variant="primary" size="sm" onClick={onJoin}>
                  <i
                    className="fa-solid fa-plus me-1"
                    style={{ fontSize: 12 }}
                  />
                  Join
                </Button>
              ))}

            {canDelete && (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  size="sm"
                  bsPrefix="btn"
                  className="fs-menu-toggle"
                >
                  <i
                    className="fa-solid fa-ellipsis-vertical"
                    style={{ fontSize: 13 }}
                  />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item
                    className="text-danger"
                    onClick={onDeleteCommunity}
                  >
                    <i
                      className="fa-solid fa-trash me-2"
                      style={{ fontSize: 12 }}
                    />
                    Delete Community
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CommunityHeader;