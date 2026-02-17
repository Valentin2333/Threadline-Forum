import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import { NavLink, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { navItemStyles, navItemStylesWithAvatar } from "./styles/navItemStyles";

const DesktopNav = ({ user, avatarUrl, onLogout }) => {
  const navigate = useNavigate();

  return (
    <>
      <Nav className="me-auto d-none d-lg-flex">
        <Nav.Link as={NavLink} to="/posts" style={navItemStyles}>
          Posts
        </Nav.Link>
      </Nav>

      <Nav className="ms-auto align-items-lg-center gap-2 d-none d-lg-flex">
        {user && (
          <Nav.Link as={NavLink} to="/profile" style={navItemStylesWithAvatar}>
            <Avatar url={avatarUrl} />
            Your Profile
          </Nav.Link>
        )}

        {!user ? (
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
        ) : (
          <Button variant="outline-light" size="sm" onClick={onLogout}>
            Logout
          </Button>
        )}
      </Nav>
    </>
  );
};

export default DesktopNav;
