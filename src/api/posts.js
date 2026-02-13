import { supabase } from "./supabaseClient";

export async function getNewestPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, author_id, title, content, created_at, score, comment_count,
      comments ( id, post_id, author_id, content, created_at, score )
    `)
    .order("created_at", { ascending: false })
    .limit(10);

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
