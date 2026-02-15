import Alert from "react-bootstrap/Alert";

const AuthAlerts = ({ infoMessage, serverError }) => {
  return (
    <>
      {infoMessage && (
        <Alert variant="success" className="mb-3">
          {infoMessage}
        </Alert>
      )}

      {serverError && (
        <Alert variant="danger" className="mb-3">
          {serverError}
        </Alert>
      )}
    </>
  );
};

export default AuthAlerts;
