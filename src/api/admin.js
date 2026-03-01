import { supabase } from "./supabaseClient";

export async function searchUsers({ query = "", limit = 50 } = {}) {
  let req = supabase
    .from("profiles")
    .select(
      "id, username, first_name, last_name, email, phone, avatar_url, is_blocked, is_admin, reputation",
    )
    .order("username", { ascending: true })
    .limit(limit);

  if (query.trim()) {
    const q = `%${query.trim()}%`;
    req = req.or(
      `username.ilike.${q},email.ilike.${q},first_name.ilike.${q},last_name.ilike.${q}`,
    );
  }

  const { data, error } = await req;
  if (error) throw error;
  return data ?? [];
}

export async function setUserBlocked({ userId, blocked }) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ is_blocked: blocked })
    .eq("id", userId)
    .select(
      "id, username, first_name, last_name, email, phone, avatar_url, is_blocked, is_admin, reputation",
    )
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAnyPost({ postId }) {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
  return true;
}

export async function getAllPosts({
  sortBy = "newest",
  search = "",
  limit = 50,
} = {}) {
  let req = supabase
    .from("posts")
    .select(
      `
      id, author_id, title, content, created_at, score, comment_count,
      post_author:profiles!posts_author_id_fkey (
        username,
        avatar_url
      ),
      comments ( id )
    `,
    )
    .limit(limit);

  if (search.trim()) {
    const q = `%${search.trim()}%`;
    req = req.or(`title.ilike.${q},content.ilike.${q}`);
  }

  if (sortBy === "oldest") {
    req = req.order("created_at", { ascending: true });
  } else if (sortBy === "score") {
    req = req
      .order("score", { ascending: false })
      .order("created_at", { ascending: false });
  } else if (sortBy === "comments") {
    req = req
      .order("comment_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    req = req.order("created_at", { ascending: false });
  }

  const { data, error } = await req;
  if (error) throw error;

  return (data ?? []).map((post) => ({
    ...post,
    actual_comment_count: post.comments?.length ?? 0,
    comments: undefined,
  }));
}

export async function getAllCommunities({
  sortBy = "newest",
  search = "",
  limit = 50,
} = {}) {
  let req = supabase
    .from("communities")
    .select(
      `
      id, name, description, created_at, member_count,
      creator:profiles!communities_creator_id_fkey (
        id, username, avatar_url
      )
    `,
    )
    .limit(limit);

  if (search.trim()) {
    const q = `%${search.trim()}%`;
    req = req.or(`name.ilike.${q},description.ilike.${q}`);
  }

  if (sortBy === "oldest") {
    req = req.order("created_at", { ascending: true });
  } else if (sortBy === "members") {
    req = req
      .order("member_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    req = req.order("created_at", { ascending: false });
  }

  const { data, error } = await req;
  if (error) throw error;
  return data ?? [];
}

export async function getAdminStats() {
  const [usersRes, postsRes, commentsRes, blockedRes, communitiesRes] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("comments").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_blocked", true),
      supabase.from("communities").select("*", { count: "exact", head: true }),
    ]);

  if (usersRes.error) throw usersRes.error;
  if (postsRes.error) throw postsRes.error;
  if (commentsRes.error) throw commentsRes.error;
  if (blockedRes.error) throw blockedRes.error;
  if (communitiesRes.error) throw communitiesRes.error;

  return {
    users: usersRes.count ?? 0,
    posts: postsRes.count ?? 0,
    comments: commentsRes.count ?? 0,
    blocked: blockedRes.count ?? 0,
    communities: communitiesRes.count ?? 0,
  };
}
