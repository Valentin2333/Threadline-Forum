import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "react-bootstrap/Badge";
import Dropdown from "react-bootstrap/Dropdown";
import useNotifications from "./hooks/useNotifications";
import NotificationList from "./NotificationList";

const NotificationsBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const {
    items,
    loading,
    error,
    unreadCount,
    loadWithUI,
    markRead,
    markAllRead,
  } = useNotifications();

  const handleClickNotification = async (n) => {
    if (!n.is_read) await markRead(n.id);
    setOpen(false);
    if (n.post_id) navigate(`/posts/${n.post_id}`);
  };

  return (
    <Dropdown
      align="end"
      show={open}
      onToggle={(next) => {
        setOpen(next);
        if (next) loadWithUI();
      }}
    >
      <Dropdown.Toggle
        variant="outline-light"
        size="sm"
        bsPrefix="btn"
        className="position-relative"
        style={{ padding: "0.35rem 0.6rem" }}
        aria-label="Notifications"
        title="Notifications"
      >
        <i className="fa-regular fa-bell" />
        {unreadCount > 0 && (
          <Badge
            pill
            bg="danger"
            className="position-absolute"
            style={{ top: -6, right: -8, fontSize: 10 }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: "min(360px, calc(100vw - 2rem))" }}>
        <NotificationList
          items={items}
          loading={loading}
          error={error}
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
          onClickNotification={handleClickNotification}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationsBell;