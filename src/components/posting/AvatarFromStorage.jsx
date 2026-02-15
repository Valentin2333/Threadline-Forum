import { useMemo } from "react";
import { supabase } from "../../api/supabaseClient";
import Avatar from "../navigation/Avatar";

/**
 * Accepts either:
 * - a full URL (https://...)
 * - or a storage path (userId/avatar.png)
 */
const AvatarFromStoragePath = ({ pathOrUrl }) => {
  const url = useMemo(() => {
    if (!pathOrUrl) return "";

    // Already a real URL
    if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
      return pathOrUrl;
    }

    // Treat as storage path inside bucket "avatars"
    const { data } = supabase.storage.from("avatars").getPublicUrl(pathOrUrl);
    return data?.publicUrl ?? "";
  }, [pathOrUrl]);

  return <Avatar url={url} />;
};

export default AvatarFromStoragePath;
