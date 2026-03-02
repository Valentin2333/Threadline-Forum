import { supabase } from "./supabaseClient";

export async function getPostById(postId) {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, author_id, title, content, created_at, score, comment_count, community_id,

      post_media (
        id, media_type, storage_path, created_at
      ),

      post_author:profiles!posts_author_id_fkey (
        username,
        avatar_url
      ),

      community:communities!posts_community_id_fkey ( id, name ),

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

export async function createPost({ userId, title, content, communityId = null }) {
  const row = {
    author_id: userId,
    title,
    content,
  };
  if (communityId) row.community_id = communityId;

  const { data, error } = await supabase
    .from("posts")
    .insert([row])
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

export async function getMostCommentedPosts(limit = 10) {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      created_at,
      score,
      comment_count,
      comments ( id )
    `)
    .limit(limit * 5); 

  if (error) throw error;

  const postsWithRealCounts = (data ?? []).map((post) => ({
    ...post,
    comment_count: post.comments?.length ?? 0,
    comments: undefined,
  }));

  postsWithRealCounts.sort((a, b) => {
    if (b.comment_count !== a.comment_count) {
      return b.comment_count - a.comment_count;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return postsWithRealCounts.slice(0, limit);
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