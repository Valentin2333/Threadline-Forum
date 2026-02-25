import { useEffect, useState } from "react";
import { supabase } from "../../../api/supabaseClient";

const useAuthUser = () => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      setLoadingUser(true);
      setError("");

      try {
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!cancelled) setUser(data.user ?? null);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Could not read auth user.");
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, loadingUser, error };
};

export default useAuthUser;
