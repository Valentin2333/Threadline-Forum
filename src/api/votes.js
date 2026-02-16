import { supabase } from "./supabaseClient";

export async function upsertVote({ userId, targetId, value }) {
  const { data, error } = await supabase
    .from("votes")
    .upsert(
      {
        voter_id: userId,
        target_type: "post",
        target_id: targetId,
        value,
      },
      { onConflict: "voter_id,target_type,target_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}


export async function deleteVote({ userId, targetId }) {
  const { error } = await supabase
    .from("votes")
    .delete()
    .eq("voter_id", userId)
    .eq("target_type", "post")
    .eq("target_id", targetId);

  if (error) throw error;
}


export async function getMyVote({ userId, targetId }) {
  const { data, error } = await supabase
    .from("votes")
    .select("value")
    .eq("voter_id", userId)
    .eq("target_type", "post")
    .eq("target_id", targetId)
    .maybeSingle();

  if (error) throw error;
  return data?.value ?? 0; // 0 means no vote
}
