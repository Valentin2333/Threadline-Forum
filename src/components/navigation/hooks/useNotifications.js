import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../api/supabaseClient";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToMyNotificationInserts,
} from "../../../api/notifications";

const POLL_INTERVAL = 5000;

const useNotifications = () => {
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

  const loadWithUI = useCallback(async () => {
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
  }, []);

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

      pollRef.current = setInterval(load, POLL_INTERVAL);
    };

    run();

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [load, loadWithUI]);

  const markRead = useCallback(async (id) => {
    try {
      await markNotificationRead(id);
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, is_read: true } : x))
      );
    } catch {
      // ignore
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      setError(e?.message || "Failed to mark all as read.");
    }
  }, []);

  return {
    items,
    loading,
    error,
    unreadCount,
    loadWithUI,
    markRead,
    markAllRead,
  };
};

export default useNotifications;