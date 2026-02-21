import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const PostEditForm = ({
  draft,
  setDraft,
  fieldErrors,
  setFieldErrors,
  onSave,
  onCancel,
  rows = 4,
}) => (
  <div className="mt-3">
    <Form.Group className="mb-2">
      <Form.Label className="small text-muted">Title</Form.Label>
      <Form.Control
        value={draft.title}
        onChange={(e) => {
          setDraft((d) => ({ ...d, title: e.target.value }));
          setFieldErrors((fe) => ({ ...fe, title: "" }));
        }}
        placeholder="Title"
        isInvalid={!!fieldErrors.title}
      />
      <Form.Control.Feedback type="invalid">
        {fieldErrors.title}
      </Form.Control.Feedback>
    </Form.Group>

    <Form.Group className="mb-2">
      <Form.Label className="small text-muted">Content</Form.Label>
      <Form.Control
        as="textarea"
        rows={rows}
        value={draft.content}
        onChange={(e) => {
          setDraft((d) => ({ ...d, content: e.target.value }));
          setFieldErrors((fe) => ({ ...fe, content: "" }));
        }}
        placeholder="Content"
        isInvalid={!!fieldErrors.content}
      />
      <Form.Control.Feedback type="invalid">
        {fieldErrors.content}
      </Form.Control.Feedback>
    </Form.Group>

    <div className="d-flex gap-2">
      <Button size="sm" onClick={onSave}>
        Save
      </Button>
      <Button size="sm" variant="outline-secondary" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  </div>
);

export default PostEditForm;
