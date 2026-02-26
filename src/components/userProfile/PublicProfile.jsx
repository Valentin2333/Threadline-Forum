import { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import { supabase } from "../../api/supabaseClient";
import { setUserBlocked } from "../../api/admin";
import useAuthUser from "../../hooks/useAuthUser";
import useAdminStatus from "../admin/hooks/useAdminStatus";
import PublicProfileHeader from "./PublicProfileHeader";
import RecentPostsList from "./RecentPostsList";

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthUser();
  const { isAdmin } = useAdminStatus(currentUser?.id);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blockLoading, setBlockLoading] = useState(false);

  const isOwnProfile = currentUser && currentUser.id === userId;

  useEffect(() => {
    if (isOwnProfile) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(
            "id, username, first_name, last_name, avatar_url, reputation, is_blocked, is_admin",
          )
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        if (!cancelled) setProfile(profileData);

        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select("id, title, created_at, score, comment_count")
          .eq("author_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!postError && !cancelled) {
          setPosts(postData ?? []);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Could not load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [userId, isOwnProfile]);

  if (isOwnProfile) {
    return <Navigate to="/profile" replace />;
  }

  const toggleBlock = async () => {
    if (!profile) return;
    setBlockLoading(true);
    setError("");
    try {
      const updated = await setUserBlocked({
        userId: profile.id,
        blocked: !profile.is_blocked,
      });
      setProfile((prev) => ({ ...prev, is_blocked: updated.is_blocked }));
    } catch (e) {
      setError(e?.message || "Action failed.");
    } finally {
      setBlockLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4" style={{ maxWidth: 720 }}>
        <div className="d-flex align-items-center gap-2 text-muted">
          <Spinner size="sm" />
          <span>Loading profile…</span>
        </div>
      </Container>
    );
  }

  if (error && !profile) {
    return (
      <Container className="py-4" style={{ maxWidth: 720 }}>
        <Alert variant="danger" className="mb-3">
          {error || "User not found."}
        </Alert>
        <Button
          variant="outline-secondary"
          size="sm"
          className="d-inline-flex align-items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          <span>Back</span>
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: 720 }}>
      <div className="mb-3">
        <Button
          variant="outline-secondary"
          size="sm"
          className="d-inline-flex align-items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          <span>Back</span>
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="py-2">
          {error}
        </Alert>
      )}

      <Card className="p-4">
        <PublicProfileHeader
          profile={profile}
          isAdmin={isAdmin}
          blockLoading={blockLoading}
          onToggleBlock={toggleBlock}
        />

        <hr className="my-3" />

        <RecentPostsList posts={posts} />
      </Card>
    </Container>
  );
};

export default PublicProfile;
