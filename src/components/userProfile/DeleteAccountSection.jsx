import Button from "react-bootstrap/Button";

const DeleteAccountSection = ({ onOpen }) => {
  return (
    <div>
      <p className="text-muted mb-3">
        This permanently deletes your account and signs you out.
      </p>
      <Button variant="danger" onClick={onOpen}>
        Delete my account
      </Button>
    </div>
  );
};

export default DeleteAccountSection;
