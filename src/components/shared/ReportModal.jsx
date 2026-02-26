import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import { createReport } from "../../api/reports";

const REASONS = [
  { value: "harassment", label: "Harassment", icon: "fa-solid fa-hand" },
  { value: "violence", label: "Violence", icon: "fa-solid fa-burst" },
  { value: "hate", label: "Hate", icon: "fa-solid fa-ban" },
];

const ReportModal = ({ show, onHide, postId, commentId }) => {
  const [selected, setSelected] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const targetLabel = postId ? "post" : "comment";

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError("");
    try {
      await createReport({ postId, commentId, reason: selected });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (e) {
      setError(e?.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelected("");
    setError("");
    setSuccess(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.1rem" }}>
          <i
            className="fa-solid fa-flag me-2"
            style={{ color: "var(--bs-danger)", fontSize: 14 }}
          />
          Report {targetLabel}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {success ? (
          <Alert variant="success" className="mb-0 py-2">
            <i className="fa-solid fa-check me-2" />
            Report submitted. Thank you.
          </Alert>
        ) : (
          <>
            <p
              className="mb-3"
              style={{ fontSize: "0.875rem", color: "var(--fs-text-secondary)" }}
            >
              Select a reason for reporting this {targetLabel}:
            </p>

            {REASONS.map((r) => (
              <Form.Check
                key={r.value}
                type="radio"
                id={`report-reason-${r.value}`}
                name="report-reason"
                className="mb-2"
                label={
                  <span className="d-flex align-items-center gap-2">
                    <i className={r.icon} style={{ fontSize: 12, width: 16 }} />
                    {r.label}
                  </span>
                }
                checked={selected === r.value}
                onChange={() => setSelected(r.value)}
              />
            ))}

            {error && (
              <Alert variant="danger" className="mt-3 mb-0 py-2" style={{ fontSize: 13 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </Modal.Body>

      {!success && (
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={!selected || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Submitting…
              </>
            ) : (
              <>
                <i className="fa-solid fa-flag me-2" style={{ fontSize: 11 }} />
                Submit Report
              </>
            )}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default ReportModal;
