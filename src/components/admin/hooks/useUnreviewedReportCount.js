import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../../api/supabaseClient";
import {
  getUnreviewedReportCount,
  subscribeToReportChanges,
} from "../../../api/reports";

const POLL_INTERVAL = 10000; // 10 seconds fallback

/**
 * Returns the current unreviewed report count, updated in realtime.
 * Only fetches if the user is an admin.
 */
const useUnreviewedReportCount = (isAdmin) => {
  const [count, setCount] = useState(0);
  const pollRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const n = await getUnreviewedReportCount();
      setCount(Math.max(0, n));
    } catch {
      // ignore – user might not be admin yet or RLS blocks
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      setCount(0);
      return;
    }

    let channel;

    const run = async () => {
      await refresh();

      // Realtime subscription for any change on the reports table
      channel = subscribeToReportChanges(() => {
        refresh();
      });

      // Polling fallback
      pollRef.current = setInterval(refresh, POLL_INTERVAL);
    };

    run();

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isAdmin, refresh]);

  /** Call this when admin opens/reviews a report to immediately decrement. */
  const decrement = useCallback(() => {
    setCount((prev) => Math.max(0, prev - 1));
  }, []);

  return { count, decrement, refresh };
};

export default useUnreviewedReportCount;
