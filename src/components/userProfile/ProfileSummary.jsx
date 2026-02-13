const ProfileSummary = ({ userEmail, profile }) => {
  return (
    <div className="mb-3">
      <p className="mb-1">
        <strong>Email:</strong> {userEmail}
      </p>
      <p className="mb-1">
        <strong>Name:</strong> {profile.first_name} {profile.last_name}
      </p>
      <p className="mb-1">
        <strong>Username:</strong> {profile.username || "—"}
      </p>
      <p className="mb-0">
        <strong>Reputation:</strong> {profile.reputation ?? 0}
      </p>
    </div>
  );
};

export default ProfileSummary;
