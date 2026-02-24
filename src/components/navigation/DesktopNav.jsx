import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import { NavLink, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { navItemStyles, navItemStylesWithAvatar } from "./styles/navItemStyles";
import NotificationsBell from "./NotificationsBell";

const DesktopNav = ({ user, avatarUrl, isAdmin }) => {
  const navigate = useNavigate();

  return (
    <>
      <Nav className="me-auto d-none d-lg-flex">
        <Nav.Link as={NavLink} to="/posts" style={navItemStyles}>
          <i className="fa-solid fa-newspaper me-2" style={{ fontSize: 13 }} />
          Posts
        </Nav.Link>

        {user && isAdmin && (
          <Nav.Link as={NavLink} to="/admin" style={navItemStyles}>
            <i className="fa-solid fa-shield-halved me-2" style={{ fontSize: 13 }} />
            Admin
          </Nav.Link>
        )}
      </Nav>

      <Nav className="ms-auto align-items-lg-center gap-2 d-none d-lg-flex">
        {user && (
          <>
            <NotificationsBell userId={user.id} />
            <Nav.Link as={NavLink} to="/profile" style={navItemStylesWithAvatar}>
              <Avatar url={avatarUrl} size="sm" />
              <span className="ms-1">Profile</span>
            </Nav.Link>
          </>
        )}

        {!user && (
          <>
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button
              variant="light"
              size="sm"
              onClick={() => navigate("/register")}
            >
              Register
            </Button>
          </>
        )}
      </Nav>
    </>
  );
};

export default DesktopNav;