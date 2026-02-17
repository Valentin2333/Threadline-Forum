import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import { supabase } from "../../api/supabaseClient";
import useAuthUser from "./hooks/useAuthUser";
import useAvatar from "./hooks/useAvatar";
import DesktopNav from "./DesktopNav";
import MobileSidebar from "./MobileSidebar";

const AppNavigation = () => {
  const user = useAuthUser();
  const { avatarUrl } = useAvatar(user?.id);

  const [showSidebar, setShowSidebar] = useState(false);

  const navigate = useNavigate();

  const closeSidebar = () => setShowSidebar(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    closeSidebar();
    navigate("/");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" expanded={false}>
      <Container>
        <Navbar.Toggle
          aria-controls="main-offcanvas"
          onClick={() => setShowSidebar(true)}
        />

        <Navbar.Brand as={NavLink} to="/" end onClick={closeSidebar}>
          Forum
        </Navbar.Brand>

        <DesktopNav user={user} avatarUrl={avatarUrl} onLogout={handleLogout} />

        <MobileSidebar
          show={showSidebar}
          onClose={closeSidebar}
          user={user}
          onLogout={handleLogout}
        />
      </Container>
    </Navbar>
  );
};

export default AppNavigation;
