const ProfileSummary = ({ userEmail, profile }) => {
  return (
    <dl className="fs-profile-info mb-3">
      <dt>Email</dt>
      <dd>{userEmail}</dd>

      <dt>Name</dt>
      <dd>{profile.first_name} {profile.last_name}</dd>

      <dt>Username</dt>
      <dd>{profile.username || "—"}</dd>

      <dt>Reputation</dt>
      <dd>
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
          {profile.reputation ?? 0}
        </span>
      </dd>
    </dl>
  );
};

export default ProfileSummary;
