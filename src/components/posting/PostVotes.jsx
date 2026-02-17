import { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { deleteVote, getMyVote, upsertVote } from "../../api/votes";

import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";

const PostVotes = ({ postId, onVoted }) => {
  const [user, setUser] = useState(null);
  const [myVote, setMyVote] = useState(0); // -1, 0, 1

  // icon animations
  const [animateUp, setAnimateUp] = useState(false);
  const [animateDown, setAnimateDown] = useState(false);

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

  const triggerAnim = (value) => {
    if (value === 1) {
      setAnimateUp(false);
      // allow retrigger even if user clicks fast
      window.requestAnimationFrame(() => {
        setAnimateUp(true);
        window.setTimeout(() => setAnimateUp(false), 450);
      });
    } else if (value === -1) {
      setAnimateDown(false);
      window.requestAnimationFrame(() => {
        setAnimateDown(true);
        window.setTimeout(() => setAnimateDown(false), 550);
      });
    }
  };

  const handleVote = async (value) => {
    if (!user) return;

    // animate immediately on click
    triggerAnim(value);

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

  const upActive = myVote === 1;
  const downActive = myVote === -1;

  return (
    <ButtonGroup className="mt-2 shadow-sm" aria-label="Vote controls">
      <Button
        size="sm"
        variant={upActive ? "success" : "outline-success"}
        className={`d-inline-flex align-items-center justify-content-center px-3 ${
          upActive ? "fw-semibold" : ""
        }`}
        onClick={() => handleVote(1)}
        aria-label="Upvote"
        title={upActive ? "Remove upvote" : "Upvote"}
      >
        <i
          className={`fa-solid fa-thumbs-up me-2 ${animateUp ? "bump" : ""} ${
            upActive ? "vote-active" : ""
          }`}
        />
        <span className="small">{upActive ? "Upvoted" : "Upvote"}</span>
      </Button>

      <Button
        size="sm"
        variant={downActive ? "danger" : "outline-danger"}
        className={`d-inline-flex align-items-center justify-content-center px-3 ${
          downActive ? "fw-semibold" : ""
        }`}
        onClick={() => handleVote(-1)}
        aria-label="Downvote"
        title={downActive ? "Remove downvote" : "Downvote"}
      >
        <i className={`fa-solid fa-thumbs-down me-2 ${animateDown ? "shake" : ""}`} />
        <span className="small">{downActive ? "Downvoted" : "Downvote"}</span>
      </Button>
    </ButtonGroup>
  );
};

export default PostVotes;
