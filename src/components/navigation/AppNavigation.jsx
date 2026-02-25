import { useState } from "react";
import { NavLink } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import useAuthUser from "./hooks/useAuthUser";
import useAvatar from "./hooks/useAvatar";
import useAdminStatus from "../admin/hooks/useAdminStatus";
import DesktopNav from "./DesktopNav";
import MobileSidebar from "./MobileSidebar";

const AppNavigation = () => {
  const user = useAuthUser();
  const { avatarUrl } = useAvatar(user?.id);
  const { isAdmin } = useAdminStatus(user?.id);

  const [showSidebar, setShowSidebar] = useState(false);

  const closeSidebar = () => setShowSidebar(false);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" expanded={false}>
      <Container>
        <Navbar.Toggle
          aria-controls="main-offcanvas"
          onClick={() => setShowSidebar(true)}
        />

        <Navbar.Brand as={NavLink} to="/" end onClick={closeSidebar}>
          Threadline
        </Navbar.Brand>

        <DesktopNav user={user} avatarUrl={avatarUrl} isAdmin={isAdmin} />

        <MobileSidebar
          show={showSidebar}
          onClose={closeSidebar}
          user={user}
          isAdmin={isAdmin}
        />
      </Container>
    </Navbar>
  );
};

export default AppNavigation;
