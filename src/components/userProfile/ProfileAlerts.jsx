import Alert from "react-bootstrap/Alert";

const ProfileAlerts = ({ success, error }) => {
  return (
    <>
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
    </>
  );
};

export default ProfileAlerts;
