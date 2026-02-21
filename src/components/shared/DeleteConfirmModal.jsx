import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const DeleteConfirmModal = ({
  show,
  onHide,
  onDelete,
  deleting,
  title = "Delete",
  warning = "Are you sure you want to delete this forever?",
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton={!deleting}>
        <Modal.Title>
          <i className="fa-solid fa-triangle-exclamation me-2" style={{ color: "var(--fs-danger)" }} />
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="danger" className="mb-0">
          <i className="fa-solid fa-circle-exclamation me-2" />
          {warning}
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={deleting}>
          No
        </Button>
        <Button variant="danger" onClick={onDelete} disabled={deleting}>
          {deleting ? (
            <>
              <Spinner size="sm" className="me-2" />
              Deleting…
            </>
          ) : (
            <>
              <i className="fa-solid fa-trash me-2" style={{ fontSize: 12 }} />
              Yes
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmModal;