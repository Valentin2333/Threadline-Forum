import Nav from "react-bootstrap/Nav";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import { NavLink, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import ThemeToggle from "../theme/ThemeToggle";
import { navItemStyles, navItemStylesWithAvatar } from "./styles/navItemStyles";
import NotificationsBell from "./NotificationsBell";
import useUnreviewedReportCount from "../admin/hooks/useUnreviewedReportCount";

const DesktopNav = ({ user, avatarUrl, isAdmin }) => {
  const navigate = useNavigate();
  const { count: reportCount } = useUnreviewedReportCount(isAdmin);

  return (
    <>
      <Nav className="me-auto d-none d-lg-flex">
        <Nav.Link as={NavLink} to="/feed" style={navItemStyles}>
          <i className="fa-solid fa-rss me-2" style={{ fontSize: 13 }} />
          Feed
        </Nav.Link>

        {user && (
          <Nav.Link as={NavLink} to="/communities" style={navItemStyles}>
            <i className="fa-solid fa-users me-2" style={{ fontSize: 13 }} />
            Communities
          </Nav.Link>
        )}

        {user && (
          <Nav.Link as={NavLink} to="/my-communities" style={navItemStyles}>
            <i className="fa-solid fa-hammer me-2" style={{ fontSize: 13 }} />
            My Communities
          </Nav.Link>
        )}

        {user && isAdmin && (
          <Nav.Link
            as={NavLink}
            to="/admin"
            style={{ ...navItemStyles, position: "relative" }}
          >
            <i
              className="fa-solid fa-shield-halved me-2"
              style={{ fontSize: 13 }}
            />
            Admin
            {reportCount > 0 && (
              <Badge
                pill
                bg="danger"
                className="position-absolute"
                style={{ top: 2, right: -4, fontSize: 10 }}
              >
                {reportCount > 99 ? "99+" : reportCount}
              </Badge>
            )}
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

        <ThemeToggle className="ms-2" />
      </Nav>
    </>
  );
};

export default DesktopNav;
