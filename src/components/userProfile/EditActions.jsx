import Button from "react-bootstrap/Button";

const EditActions = ({ isEditing, saving, onStartEdit, onCancelEdit }) => {
  return (
    <div className="d-flex gap-2 mb-3">
      {!isEditing ? (
        <Button onClick={onStartEdit}>Edit profile</Button>
      ) : (
        <Button variant="secondary" onClick={onCancelEdit} disabled={saving}>
          Cancel
        </Button>
      )}
    </div>
  );
};

export default EditActions;
