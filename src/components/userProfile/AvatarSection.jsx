import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const AvatarSection = ({
  avatarUrl,
  hasAvatar,
  showAvatarUpload,
  uploadingAvatar,
  onAvatarSelected,
  onToggleUpload,
  maxAvatarMb,
}) => {
  return (
    <div className="d-flex flex-column align-items-center text-center mb-4">
      <div className="fs-avatar fs-avatar-lg mb-2">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile avatar"
          />
        ) : (
          <i className="fa-solid fa-user" style={{ fontSize: 32, color: "var(--fs-text-muted)" }} />
        )}
      </div>

      <Button
        variant="link"
        size="sm"
        className="p-0"
        onClick={onToggleUpload}
        disabled={uploadingAvatar}
        style={{ fontSize: "0.8125rem" }}
      >
        <i className="fa-solid fa-camera me-1" style={{ fontSize: 12 }} />
        {hasAvatar ? "Change picture" : "Upload picture"}
      </Button>

      {showAvatarUpload && (
        <Form.Group
          controlId="avatarUpload"
          className="mt-2 w-100"
          style={{ maxWidth: 360 }}
        >
          <div className="d-flex align-items-center gap-2 justify-content-center">
            <Form.Control
              type="file"
              accept="image/*"
              onChange={onAvatarSelected}
              disabled={uploadingAvatar}
              size="sm"
            />
            {uploadingAvatar && <Spinner size="sm" />}
          </div>
          <Form.Text muted>
            Max {maxAvatarMb}MB. JPG/PNG/WEBP/GIF.
          </Form.Text>
        </Form.Group>
      )}
    </div>
  );
};

export default AvatarSection;
