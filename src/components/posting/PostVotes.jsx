import { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { deleteVote, getMyVote, upsertVote } from "../../api/votes";

const PostVotes = ({ postId, onVoted }) => {
  const [user, setUser] = useState(null);
  const [myVote, setMyVote] = useState(0); // -1, 0, 1

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadVote = async () => {
      if (!user) {
        setMyVote(0);
        return;
      }
      const v = await getMyVote({ userId: user.id, targetId: postId });
      setMyVote(v);
    };

    loadVote();
  }, [user, postId]);

  const handleVote = async (value) => {
  if (!user) return;

  try {
    if (myVote === value) {
      await deleteVote({ userId: user.id, targetId: postId });
      setMyVote(0);
    } else {
      await upsertVote({ userId: user.id, targetId: postId, value });
      setMyVote(value);
    }

    onVoted?.();
  } catch (e) {
    console.error("VOTE ERROR:", e);
    alert(e?.message || "Vote failed");
  }
};


  if (!user) return null; // hide for logged-out users

  return (
    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
      <button
        onClick={() => handleVote(1)}
        style={{ fontWeight: myVote === 1 ? "bold" : "normal" }}
      >
        ▲ Upvote
      </button>

      <button
        onClick={() => handleVote(-1)}
        style={{ fontWeight: myVote === -1 ? "bold" : "normal" }}
      >
        ▼ Downvote
      </button>
    </div>
  );
};

export default PostVotes;
