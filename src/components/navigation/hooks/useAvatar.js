import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../api/supabaseClient";
import { AVATAR_BUCKET } from "../shared/constants";

const useAvatar = (userId) => {
  const [avatarPath, setAvatarPath] = useState("");
  const [avatarVersion, setAvatarVersion] = useState(0);

  const avatarUrl = useMemo(() => {
    if (!avatarPath) return "";
    const { data } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(avatarPath);
    const base = data?.publicUrl ?? "";
    if (!base) return "";
    return `${base}?v=${avatarVersion}`;
  }, [avatarPath, avatarVersion]);

  useEffect(() => {
    let cancelled = false;

    const loadAvatar = async () => {
      if (!userId) {
        setAvatarPath("");
        setAvatarVersion(Date.now());
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .single();

      if (!cancelled) {
        setAvatarPath(!error ? (data?.avatar_url ?? "") : "");
        setAvatarVersion(Date.now());
      }
    };

    loadAvatar();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    const handler = (evt) => {
      const nextPath = evt?.detail?.avatarPath ?? "";
      const nextVersion = evt?.detail?.version ?? Date.now();
      if (nextPath) setAvatarPath(nextPath);
      setAvatarVersion(nextVersion);
    };

    window.addEventListener("profile:avatar-updated", handler);
    return () => window.removeEventListener("profile:avatar-updated", handler);
  }, []);

  return { avatarUrl };
};

export default useAvatar;
