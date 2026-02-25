import { supabase } from "./supabaseClient";

// Supabase Storage bucket used for post attachments
export const POST_MEDIA_BUCKET = "post-media";

export function getPostMediaPublicUrl(storagePath) {
  if (!storagePath) return "";
  const { data } = supabase.storage.from(POST_MEDIA_BUCKET).getPublicUrl(storagePath);
  return data?.publicUrl ?? "";
}

function inferMediaType(file) {
  const t = file?.type ?? "";
  return t.startsWith("video/") ? "video" : "image";
}

/**
 * Upload a single media file to Storage and create its DB row in `post_media`.
 * Returns the inserted `post_media` row.
 */
export async function uploadPostMedia({ postId, userId, file }) {
  if (!postId) throw new Error("uploadPostMedia: postId is required");
  if (!userId) throw new Error("uploadPostMedia: userId is required");
  if (!file) throw new Error("uploadPostMedia: file is required");

  const mediaType = inferMediaType(file);

  // Store as: <userId>/<postId>/<timestamp>-<filename>
  const safeName = String(file.name ?? "file").replace(/[^\w.\-]/g, "_");
  const storagePath = `${userId}/${postId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(POST_MEDIA_BUCKET)
    .upload(storagePath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data, error: dbError } = await supabase
    .from("post_media")
    .insert([
      {
        post_id: postId,
        uploader_id: userId,
        media_type: mediaType,
        storage_path: storagePath,
      },
    ])
    .select()
    .single();

  if (dbError) throw dbError;
  return data;
}