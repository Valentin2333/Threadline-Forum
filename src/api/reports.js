import { supabase } from "./supabaseClient";

/**
 * Submit a report for a post or comment.
 * @param {{ postId?: string, commentId?: string, reason: string }} params
 */
export async function createReport({ postId, commentId, reason }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to report content.");

  const row = {
    reporter_id: user.id,
    reason,
    post_id: postId ?? null,
    comment_id: commentId ?? null,
  };

  const { error } = await supabase.from("reports").insert(row);
  if (error) throw error;
}

/**
 * Fetch all reports (admin only). Returns newest first.
 */
export async function getReports({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from("reports")
    .select(
      `
      id, reporter_id, post_id, comment_id, reason, is_reviewed, created_at,
      reporter:profiles!reports_reporter_id_fkey ( id, username, avatar_url ),
      comment:comments!reports_comment_id_fkey ( id, post_id )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/**
 * Count unreviewed reports (admin only).
 */
export async function getUnreviewedReportCount() {
  const { count, error } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("is_reviewed", false);

  if (error) throw error;
  return count ?? 0;
}

/**
 * Mark a report as reviewed (admin only).
 */
export async function markReportReviewed(reportId) {
  const { error } = await supabase
    .from("reports")
    .update({ is_reviewed: true })
    .eq("id", reportId);

  if (error) throw error;
}

/**
 * Realtime subscription for new report inserts (admin badge).
 */
export function subscribeToReportChanges(onChange) {
  const channelName = `reports-realtime-${Math.random().toString(16).slice(2)}`;

  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "reports" },
      () => {
        onChange?.();
      }
    )
    .subscribe();

  return channel;
}
