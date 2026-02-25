import Button from "react-bootstrap/Button";

const DeleteAccountSection = ({ onOpen }) => {
  return (
    <div className="fs-danger-zone">
      <h6
        className="mb-2"
        style={{ color: "var(--fs-danger)", fontWeight: 600 }}
      >
        <i
          className="fa-solid fa-triangle-exclamation me-2"
          style={{ fontSize: 14 }}
        />
        Danger zone
      </h6>
      <p className="text-muted mb-3" style={{ fontSize: "0.875rem" }}>
        This permanently deletes your account and signs you out.
      </p>
      <Button variant="danger" onClick={onOpen} size="sm">
        <i className="fa-solid fa-trash me-2" style={{ fontSize: 12 }} />
        Delete my account
      </Button>
    </div>
  );
};

export default DeleteAccountSection;
