import { supabase } from "./supabaseClient";

export async function getNewestPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, author_id, title, content, created_at, score, comment_count,

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
