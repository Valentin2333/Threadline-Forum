import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { supabase } from "../api/supabaseClient";

const AVATAR_BUCKET = "avatars";

const Avatar = ({ url }) => {
  if (!url) {
    return (
      <span
        aria-hidden="true"
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.15)",
          marginRight: 8,
          fontSize: 14,
        }}
      >
        👤
      </span>
    );
  }

  return (
    <img
      src={url}
      alt=""
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        objectFit: "cover",
        marginRight: 8,
      }}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
};

const AppNavbar = () => {
  const [user, setUser] = useState(null);

  // DB stores PATH
  const [avatarPath, setAvatarPath] = useState("");
  const [avatarVersion, setAvatarVersion] = useState(0);

  const navigate = useNavigate();

  const avatarUrl = useMemo(() => {
    if (!avatarPath) return "";
    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(avatarPath);
    const base = data?.publicUrl ?? "";
    if (!base) return "";
    return `${base}?v=${avatarVersion}`;
  }, [avatarPath, avatarVersion]);

  useEffect(() => {
    let cancelled = false;

    const setUserFromSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!cancelled) setUser(data.session?.user ?? null);
    };

    setUserFromSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Load avatar on login
  useEffect(() => {
    let cancelled = false;

    const loadAvatar = async () => {
      if (!user?.id) {
        setAvatarPath("");
        setAvatarVersion(Date.now());
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (!cancelled) {
        setAvatarPath(!error ? data?.avatar_url ?? "" : "");
        setAvatarVersion(Date.now());
      }
    };

    loadAvatar();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // ✅ Listen to local event fired by UserProfile (works without realtime)
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Forum
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/posts">
              Posts
            </Nav.Link>

            {user && (
              <Nav.Link as={Link} to="/profile" className="d-flex align-items-center">
                <Avatar url={avatarUrl} />
                Profile
              </Nav.Link>
            )}
          </Nav>

          <Nav className="ms-auto align-items-lg-center gap-2">
            {!user ? (
              <>
                <Button variant="outline-light" size="sm" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button variant="light" size="sm" onClick={() => navigate("/register")}>
                  Register
                </Button>
              </>
            ) : (
              <Button variant="outline-light" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
