import { useEffect, useState } from "react";
import { supabase } from "../../../api/supabaseClient";

const useAuthUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const setUserFromSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!cancelled) setUser(data.session?.user ?? null);
    };

    setUserFromSession();

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

  return user;
};

export default useAuthUser;
