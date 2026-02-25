import { useEffect } from "react";
import { supabase } from "../api/supabaseClient";

const useRealtimePosts = ({ channelName, communityId = null, onUpdate }) => {
  useEffect(() => {
    if (!onUpdate) return;

    const postFilter = communityId
      ? { event: "*", schema: "public", table: "posts", filter: `community_id=eq.${communityId}` }
      : { event: "*", schema: "public", table: "posts" };

    const commentFilter = { event: "*", schema: "public", table: "comments" };

    const postMediaFilter = { event: "*", schema: "public", table: "post_media" };

    const channel = supabase
      .channel(channelName || "realtime-posts")
      .on("postgres_changes", postFilter, () => {
        onUpdate();
      })
      .on("postgres_changes", commentFilter, () => {
        onUpdate();
      })
      .on("postgres_changes", postMediaFilter, () => {
        onUpdate();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, communityId, onUpdate]);
};

export default useRealtimePosts;