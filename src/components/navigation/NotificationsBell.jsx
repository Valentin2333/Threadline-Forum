import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import { supabase } from "../../api/supabaseClient";

import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToMyNotificationInserts,
} from "../../api/notifications";

const POLL_INTERVAL = 5000; // 5 seconds

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

const NotificationsBell = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const pollRef = useRef(null);

  const unreadCount = useMemo(
    () => items.reduce((acc, n) => acc + (n.is_read ? 0 : 1), 0),
    [items]
  );

  const load = useCallback(async () => {
    try {
      const data = await getMyNotifications({ limit: 30 });
      setItems(data);
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
  }, []);

  const loadWithUI = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyNotifications({ limit: 30 });
      setItems(data);
    } catch (e) {
      setError(e?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let channel;

    const run = async () => {
      const { data, error: authErr } = await supabase.auth.getUser();
      if (authErr) {
        console.error("auth.getUser error:", authErr);
        return;
      }

      const uid = data?.user?.id;
      if (!uid) return;

      loadWithUI();

      // Realtime for instant new notifications
      channel = subscribeToMyNotificationInserts(uid, async (newNotif) => {
        setItems((prev) => {
          if (prev.some((x) => x.id === newNotif.id)) return prev;
          return [{ ...newNotif, actor: null }, ...prev];
        });

        if (newNotif.actor_id) {
          try {
            const { data: actor } = await supabase
              .from("profiles")
              .select("id, username, avatar_url")
              .eq("id", newNotif.actor_id)
              .single();

            if (actor) {
              setItems((prev) =>
                prev.map((n) =>
                  n.id === newNotif.id ? { ...n, actor } : n
                )
              );
            }
          } catch {
            // ignore
          }
        }
      });

      // Poll to catch vote removals (realtime DELETE blocked by RLS)
      pollRef.current = setInterval(load, POLL_INTERVAL);
    };

    run();

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const handleClickNotification = async (n) => {
    try {
      if (!n.is_read) {
        await markNotificationRead(n.id);
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x))
        );
      }
    } catch {
      // even if marking read fails, still navigate
    }

    setOpen(false);
    if (n.post_id) navigate(`/posts/${n.post_id}`);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      setError(e?.message || "Failed to mark all as read.");
    }
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

      <Dropdown.Menu style={{ width: 360 }}>
        <div className="px-3 pt-2 pb-1 d-flex align-items-center justify-content-between">
          <div className="fw-semibold">Notifications</div>
          <Button
            variant="link"
            size="sm"
            className="p-0"
            disabled={items.length === 0 || unreadCount === 0}
            onClick={handleMarkAllRead}
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
              <Dropdown.Item
                key={n.id}
                onClick={() => handleClickNotification(n)}
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
                      background: n.is_read
                        ? "transparent"
                        : "var(--bs-danger)",
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
            ))}
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationsBell;