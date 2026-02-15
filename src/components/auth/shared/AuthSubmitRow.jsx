import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const AuthSubmitRow = ({
  loading,
  submitText,
  loadingText,
  secondaryText,
  onSecondaryClick,
}) => {
  return (
    <div className="d-flex gap-2 align-items-center">
      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Spinner size="sm" className="me-2" />
            {loadingText}
          </>
        ) : (
          submitText
        )}
      </Button>

      <Button variant="link" type="button" onClick={onSecondaryClick}>
        {secondaryText}
      </Button>
    </div>
  );
};

export default AuthSubmitRow;
