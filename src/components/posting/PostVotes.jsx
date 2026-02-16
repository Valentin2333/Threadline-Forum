import { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { deleteVote, getMyVote, upsertVote } from "../../api/votes";

import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";

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
    <ButtonGroup className="mt-2" aria-label="Vote controls">
      <Button
        size="sm"
        variant={myVote === 1 ? "success" : "outline-success"}
        onClick={() => handleVote(1)}
      >
        ▲ Upvote
      </Button>
      <Button
        size="sm"
        variant={myVote === -1 ? "danger" : "outline-danger"}
        onClick={() => handleVote(-1)}
      >
        ▼ Downvote
      </Button>
    </ButtonGroup>
  );
};

export default PostVotes;
