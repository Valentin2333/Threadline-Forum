import { supabase } from "./supabaseClient";

export async function getNewestPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, author_id, title, content, created_at, score, comment_count,

      post_media (
        id, media_type, storage_path, created_at
      ),

      post_author:profiles!posts_author_id_fkey (
        username,
        avatar_url
      ),

      comments (
        id, post_id, author_id, content, created_at, score,

        comment_author:profiles!comments_author_id_fkey (
          username,
          avatar_url
        )
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data ?? [];
}

export async function getPostById(postId) {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, author_id, title, content, created_at, score, comment_count,

      post_media (
        id, media_type, storage_path, created_at
      ),

      post_author:profiles!posts_author_id_fkey (
        username,
        avatar_url
      ),

      comments (
        id, post_id, author_id, content, created_at, score,

        comment_author:profiles!comments_author_id_fkey (
          username,
          avatar_url
        )
      )
    `)
    .eq("id", postId)
    .single();

  if (error) throw error;
  return data;
}

export async function createPost({ userId, title, content }) {
  const { data, error } = await supabase
    .from("posts")
    .insert([
      {
        author_id: userId,
        title,
        content,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePost({ postId, title, content }) {
  const { data, error } = await supabase
    .from("posts")
    .update({ title, content })
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost({ postId }) {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
  return true;
}

export async function getTopPosts(limit = 10) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, created_at, score, comment_count")
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getMostCommentedPosts(limit = 10) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, created_at, score, comment_count")
    .order("comment_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getRecentPostsSummary(limit = 10) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, created_at, score, comment_count")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}