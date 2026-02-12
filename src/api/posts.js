import { supabase } from "./supabaseClient";

export async function getNewestPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
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
