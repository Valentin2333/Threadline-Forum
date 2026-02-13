import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const DeleteAccountModal = ({
  show,
  onHide,
  deleting,
  confirmText,
  onChangeConfirmText,
  onDelete,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton={!deleting}>
        <Modal.Title>Delete account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="danger" className="mb-3">
          This is permanent. Your profile will be deleted forever.
        </Alert>

        <Form.Group>
          <Form.Label>
            Type <strong>delete</strong> to confirm
          </Form.Label>
          <Form.Control
            value={confirmText}
            onChange={(e) => onChangeConfirmText(e.target.value)}
            disabled={deleting}
            placeholder="delete"
            autoFocus
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={deleting}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onDelete} disabled={deleting}>
          {deleting ? (
            <>
              <Spinner size="sm" className="me-2" />
              Deleting...
            </>
          ) : (
            "Delete permanently"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteAccountModal;
