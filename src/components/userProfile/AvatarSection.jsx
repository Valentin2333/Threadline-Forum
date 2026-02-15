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
    <div className="d-flex flex-column align-items-center text-center mb-3">
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: "50%",
          overflow: "hidden",
          background: "#f1f3f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile avatar"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 36, opacity: 0.6 }}>👤</span>
        )}
      </div>

      <Button
        variant="link"
        size="sm"
        className="mt-2 p-0"
        onClick={onToggleUpload}
        disabled={uploadingAvatar}
      >
        {hasAvatar ? "Change profile picture" : "Upload profile picture"}
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
