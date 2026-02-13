import { supabase } from "./supabaseClient";

export async function createComment({ userId, postId, content }) {
  const { data, error } = await supabase
    .from("comments")
    .insert([
      {
        author_id: userId,
        post_id: postId,
        content,
      },
    ])
    .select("id, post_id, author_id, content, created_at, score")
    .single();

  if (error) throw error;
  return data;
}
