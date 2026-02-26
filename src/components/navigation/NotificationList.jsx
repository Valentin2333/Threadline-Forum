import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import NotificationItem from "./NotificationItem";

const NotificationList = ({
  items,
  loading,
  error,
  unreadCount,
  onMarkAllRead,
  onClickNotification,
}) => {
  return (
    <>
      <div className="px-3 pt-2 pb-1 d-flex align-items-center justify-content-between">
        <div className="fw-semibold">Notifications</div>
        <Button
          variant="link"
          size="sm"
          className="p-0"
          disabled={items.length === 0 || unreadCount === 0}
          onClick={onMarkAllRead}
        >
          Mark all read
        </Button>
      </div>

      <Dropdown.Divider />

      {loading && (
        <div className="px-3 py-2 text-muted d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" />
          <span>Loading…</span>
        </div>
      )}

      {!loading && error && (
        <div className="px-3 py-2 text-danger" style={{ fontSize: 13 }}>
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="px-3 py-3 text-muted" style={{ fontSize: 13 }}>
          No notifications yet.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div style={{ maxHeight: 420, overflowY: "auto" }}>
          {items.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onClick={() => onClickNotification(n)}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default NotificationList;