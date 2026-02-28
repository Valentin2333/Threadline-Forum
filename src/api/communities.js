import { supabase } from "./supabaseClient";

// ── Community CRUD ──────────────────────────────────────────

export async function createCommunity({ userId, name, description = "" }) {
  const fullName = name.startsWith("t/") ? name : `t/${name}`;

  const { data, error } = await supabase
    .from("communities")
    .insert([{ name: fullName, description, creator_id: userId }])
    .select("id, name, description, creator_id, member_count, created_at")
    .single();

  if (error) throw error;

  // auto-join creator
  await supabase
    .from("community_members")
    .insert([{ community_id: data.id, user_id: userId }]);

  return data;
}

export async function getCommunityByName(name) {
  const { data, error } = await supabase
    .from("communities")
    .select(
      `
      id, name, description, creator_id, member_count, created_at,
      creator:profiles!communities_creator_id_fkey ( username, avatar_url )
    `,
    )
    .eq("name", name)
    .single();

  if (error) throw error;
  return data;
}

export async function getTopCommunities(limit = 10) {
  const { data, error } = await supabase
    .from("communities")
    .select("id, name, description, creator_id, member_count, created_at")
    .order("member_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

// ── Created Communities (communities I created) ─────────────

export async function getCreatedCommunities(userId) {
  const { data, error } = await supabase
    .from("communities")
    .select(
      `
      id, name, description, creator_id, member_count, created_at,
      creator:profiles!communities_creator_id_fkey ( username, avatar_url )
    `,
    )
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ── Delete Community (removes all posts & members) ──────────

export async function deleteCommunity(communityId) {
  // 1. Delete all comments on posts in this community
  const { data: communityPosts } = await supabase
    .from("posts")
    .select("id")
    .eq("community_id", communityId);

  const postIds = (communityPosts ?? []).map((p) => p.id);

  if (postIds.length > 0) {
    // delete votes on those posts
    await supabase.from("votes").delete().in("post_id", postIds);
    // delete comments on those posts
    await supabase.from("comments").delete().in("post_id", postIds);
    // delete the posts themselves
    await supabase.from("posts").delete().eq("community_id", communityId);
  }

  // 2. Remove all members
  await supabase
    .from("community_members")
    .delete()
    .eq("community_id", communityId);

  // 3. Delete the community itself
  const { error } = await supabase
    .from("communities")
    .delete()
    .eq("id", communityId);

  if (error) throw error;
  return true;
}

// ── Membership ──────────────────────────────────────────────

export async function joinCommunity({ communityId, userId }) {
  const { data, error } = await supabase
    .from("community_members")
    .insert([{ community_id: communityId, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function leaveCommunity({ communityId, userId }) {
  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("community_id", communityId)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

export async function isMember({ communityId, userId }) {
  const { data, error } = await supabase
    .from("community_members")
    .select("id")
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export async function getUserCommunities(userId) {
  const { data, error } = await supabase
    .from("community_members")
    .select(
      `
      community_id,
      community:communities!community_members_community_id_fkey (
        id, name, description, member_count, creator_id, created_at
      )
    `,
    )
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map((r) => r.community).filter(Boolean);
}

export async function getCommunityMembers(communityId) {
  const { data, error } = await supabase
    .from("community_members")
    .select(
      `
      id, user_id, joined_at,
      profile:profiles!community_members_user_id_fkey (
        id, username, avatar_url, is_admin
      )
    `,
    )
    .eq("community_id", communityId)
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function removeMember({ communityId, userId }) {
  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("community_id", communityId)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

// ── Community Posts ─────────────────────────────────────────

export async function getCommunityPosts(communityId) {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id, author_id, title, content, created_at, score, comment_count, community_id,
      post_media (
        id, media_type, storage_path, created_at
      ),
      post_author:profiles!posts_author_id_fkey ( username, avatar_url ),
      comments (
        id, post_id, author_id, content, created_at, score,
        comment_author:profiles!comments_author_id_fkey ( username, avatar_url )
      )
    `,
    )
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPostsForJoinedCommunities(userId) {
  // get all community IDs the user has joined
  const { data: memberships, error: memErr } = await supabase
    .from("community_members")
    .select("community_id")
    .eq("user_id", userId);

  if (memErr) throw memErr;
  const communityIds = (memberships ?? []).map((m) => m.community_id);

  if (communityIds.length === 0) return [];

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id, author_id, title, content, created_at, score, comment_count, community_id,
      post_media (
        id, media_type, storage_path, created_at
      ),
      post_author:profiles!posts_author_id_fkey ( username, avatar_url ),
      community:communities!posts_community_id_fkey ( id, name ),
      comments (
        id, post_id, author_id, content, created_at, score,
        comment_author:profiles!comments_author_id_fkey ( username, avatar_url )
      )
    `,
    )
    .in("community_id", communityIds)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}

// ── Global search (communities + posts) ─────────────────────

export async function globalSearch(query, limit = 10) {
  const q = `%${query.trim()}%`;

  const [commRes, postRes] = await Promise.all([
    supabase
      .from("communities")
      .select("id, name, description, member_count")
      .ilike("name", q)
      .order("member_count", { ascending: false })
      .limit(limit),
    supabase
      .from("posts")
      .select(
        `
        id, title, score, comment_count, created_at, community_id,
        community:communities!posts_community_id_fkey ( id, name )
      `,
      )
      .or(`title.ilike.${q},content.ilike.${q}`)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  if (commRes.error) throw commRes.error;
  if (postRes.error) throw postRes.error;

  return {
    communities: commRes.data ?? [],
    posts: postRes.data ?? [],
  };
}
