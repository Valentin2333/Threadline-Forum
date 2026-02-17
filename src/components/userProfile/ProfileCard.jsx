import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

const ProfileCard = ({ loadingProfile, profile, children }) => {
  return (
    <Card className="p-4">
      {loadingProfile ? (
        <div className="d-flex align-items-center gap-2 text-muted">
          <Spinner size="sm" />
          <span>Loading profile...</span>
        </div>
      ) : !profile ? (
        <Alert variant="warning" className="mb-0">
          <i className="fa-solid fa-circle-exclamation me-2" />
          No profile row found for this user.
        </Alert>
      ) : (
        children
      )}
    </Card>
  );
};

export default ProfileCard;
