import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import AvatarFromStorage from "../posting/posts/AvatarFromStorage";

const PublicProfileHeader = ({ profile, isAdmin, blockLoading, onToggleBlock }) => (
  <div className="d-flex flex-column align-items-center text-center mb-4">
    <div className="fs-avatar fs-avatar-lg mb-2">
      {profile.avatar_url ? (
        <AvatarFromStorage pathOrUrl={profile.avatar_url} size="lg" />
      ) : (
        <i
          className="fa-solid fa-user"
          style={{ fontSize: 32, color: "var(--fs-text-muted)" }}
        />
      )}
    </div>

    <h2 className="fs-page-title mb-1">
      {profile.username || "Unknown user"}
    </h2>

    {(profile.first_name || profile.last_name) && (
      <p className="text-muted mb-2" style={{ fontSize: "0.9375rem" }}>
        {profile.first_name} {profile.last_name}
      </p>
    )}

    <div className="d-flex align-items-center gap-2 mb-2">
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          background: "var(--fs-primary-subtle)",
          color: "var(--fs-primary)",
          fontWeight: 600,
          fontSize: "0.875rem",
          padding: "0.25em 0.625em",
          borderRadius: "var(--fs-radius-pill)",
        }}
      >
        <i className="fa-solid fa-star" style={{ fontSize: 11 }} />
        {profile.reputation ?? 0} reputation
      </span>

      {profile.is_admin && (
        <Badge bg="primary" style={{ fontSize: "0.75rem" }}>
          Admin
        </Badge>
      )}

      {profile.is_blocked && (
        <Badge bg="danger" style={{ fontSize: "0.75rem" }}>
          Blocked
        </Badge>
      )}
    </div>

    {isAdmin && !profile.is_admin && (
      <Button
        size="sm"
        variant={profile.is_blocked ? "outline-success" : "outline-danger"}
        onClick={onToggleBlock}
        disabled={blockLoading}
        className="mt-1"
      >
        {blockLoading ? (
          <Spinner size="sm" />
        ) : profile.is_blocked ? (
          <>
            <i
              className="fa-solid fa-unlock me-2"
              style={{ fontSize: 11 }}
            />
            Unblock user
          </>
        ) : (
          <>
            <i className="fa-solid fa-ban me-2" style={{ fontSize: 11 }} />
            Block user
          </>
        )}
      </Button>
    )}
  </div>
);

export default PublicProfileHeader;
