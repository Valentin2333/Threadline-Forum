import { useMemo } from "react";
import { supabase } from "../../../api/supabaseClient";

const AVATAR_BUCKET = "avatars";

const useAvatarUrl = ({ avatarPath, avatarVersion }) => {
  return useMemo(() => {
    if (!avatarPath) return "";
    const { data } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(avatarPath);
    const base = data?.publicUrl ?? "";
    if (!base) return "";
    return `${base}?v=${avatarVersion}`;
  }, [avatarPath, avatarVersion]);
};

export default useAvatarUrl;
