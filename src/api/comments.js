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

export async function updateComment({ commentId, content }) {
  const { data, error } = await supabase
    .from("comments")
    .update({ content })
    .eq("id", commentId)
    .select("id, post_id, author_id, content, created_at, score")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteComment({ commentId }) {
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw error;
  return true;
}
