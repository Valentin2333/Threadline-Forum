import Dropdown from "react-bootstrap/Dropdown";

const formatTime = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "";
  }
};

const labelFor = (n) => {
  const who = n?.actor?.username || "Someone";
  if (n?.type === "comment") return `${who} commented on your post`;
  if (n?.type === "upvote") return `${who} upvoted your post`;
  if (n?.type === "downvote") return `${who} downvoted your post`;
  return "New notification";
};

const NotificationItem = ({ notification, onClick }) => {
  const n = notification;

  return (
    <Dropdown.Item
      onClick={onClick}
      className="py-2"
      style={{ whiteSpace: "normal" }}
    >
      <div className="d-flex align-items-start gap-2">
        <div
          className="mt-1"
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: n.is_read ? "transparent" : "var(--bs-danger)",
            flex: "0 0 auto",
          }}
        />
        <div className="flex-grow-1">
          <div
            className={n.is_read ? "text-muted" : "fw-semibold"}
            style={{ fontSize: 13 }}
          >
            {labelFor(n)}
          </div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            {formatTime(n.created_at)}
          </div>
        </div>
      </div>
    </Dropdown.Item>
  );
};

export default NotificationItem;