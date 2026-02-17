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
    <div className="d-flex flex-column flex-sm-row gap-2 align-items-start align-items-sm-center mt-1">
      <Button type="submit" disabled={loading} className="px-4">
        {loading ? (
          <>
            <Spinner size="sm" className="me-2" />
            {loadingText}
          </>
        ) : (
          submitText
        )}
      </Button>

      <Button
        variant="link"
        type="button"
        onClick={onSecondaryClick}
        className="p-0"
        style={{ fontSize: "0.875rem" }}
      >
        {secondaryText}
      </Button>
    </div>
  );
};

export default AuthSubmitRow;
