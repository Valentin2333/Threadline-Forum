import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const ProfileShell = ({
  loadingUser,
  user,
  authError,
  onGoLogin,
  children,
}) => {
  if (loadingUser) {
    return (
      <Container className="py-4" style={{ maxWidth: 720 }}>
        <div className="d-flex align-items-center gap-2 text-muted">
          <Spinner size="sm" />
          <span>Loading user...</span>
        </div>
      </Container>
    );
  }

  if (authError) {
    return (
      <Container className="py-4" style={{ maxWidth: 720 }}>
        <Alert variant="danger" className="mb-0">
          {authError}
        </Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-4" style={{ maxWidth: 720 }}>
        <Alert variant="warning" className="mb-3">
          <i className="fa-solid fa-lock me-2" />
          You must be logged in to view your profile.
        </Alert>
        <Button onClick={onGoLogin}>Go to Login</Button>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: 720 }}>
      {children}
    </Container>
  );
};

export default ProfileShell;
