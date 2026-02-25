import { useEffect, useState } from "react";
import { supabase } from "../../../api/supabaseClient";
import { SELECT_COLS } from "../shared/constants";

const useProfileRow = ({ userId, reset }) => {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!userId) {
        setProfile(null);
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);
      setError("");

      try {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select(SELECT_COLS)
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        if (!cancelled) {
          setProfile(data);

          reset({
            firstName: data.first_name ?? "",
            lastName: data.last_name ?? "",
            username: data.username ?? "",
            phone: data.phone ?? "",
          });
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Could not load profile.");
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [userId, reset]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`profiles:${userId}:avatar`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const nextAvatarPath = payload?.new?.avatar_url ?? "";
          setProfile((prev) =>
            prev ? { ...prev, avatar_url: nextAvatarPath } : prev,
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { profile, setProfile, loadingProfile, error, setError };
};

export default useProfileRow;
