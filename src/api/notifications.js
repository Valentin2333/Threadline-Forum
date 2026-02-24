import { supabase } from "./supabaseClient";

// Fetch the current user's notifications (RLS limits rows to recipient).
export async function getMyNotifications({ limit = 30 } = {}) {
  const { data, error } = await supabase
    .from("notifications")
    .select(
      `
      id, recipient_id, actor_id, post_id, comment_id, type, is_read, created_at,
      actor:profiles!notifications_actor_id_fkey ( id, username, avatar_url )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(id) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  if (error) throw error;
}

// Realtime: listen only to INSERTs for this user.
export function subscribeToMyNotificationInserts(userId, onInsert, onStatus) {
  if (!userId) return null;

  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => onInsert?.(payload.new)
    )
    .subscribe((status) => {
      onStatus?.(status); // e.g. "SUBSCRIBED"
    });

  return channel;
}