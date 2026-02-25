import { useMemo } from "react";
import { supabase } from "../../../api/supabaseClient";
import { AVATAR_BUCKET } from "../shared/constants";

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
