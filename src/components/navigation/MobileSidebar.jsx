import Offcanvas from "react-bootstrap/Offcanvas";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import { NavLink, useNavigate } from "react-router-dom";
import { navItemStyles } from "./styles/navItemStyles";

const MobileSidebar = ({ show, onClose, user, isAdmin }) => {
  const navigate = useNavigate();

  return (
    <Offcanvas
      id="main-offcanvas"
      show={show}
      onHide={onClose}
      placement="start"
      className="bg-dark text-light"
    >
      <Offcanvas.Header closeButton closeVariant="white">
        <Offcanvas.Title>
          <i className="fa-solid fa-comments me-2" style={{ fontSize: 16 }} />
          Forum
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column">
        <Nav className="flex-column gap-1">
          <Nav.Link
            as={NavLink}
            to="/"
            end
            style={navItemStyles}
            onClick={onClose}
          >
            <i className="fa-solid fa-house me-2" style={{ fontSize: 13 }} />
            Home
          </Nav.Link>

          <Nav.Link
            as={NavLink}
            to="/posts"
            style={navItemStyles}
            onClick={onClose}
          >
            <i className="fa-solid fa-newspaper me-2" style={{ fontSize: 13 }} />
            Posts
          </Nav.Link>

          {user && (
            <Nav.Link
              as={NavLink}
              to="/profile"
              style={navItemStyles}
              onClick={onClose}
            >
              <i className="fa-solid fa-user me-2" style={{ fontSize: 13 }} />
              Your Profile
            </Nav.Link>
          )}

          {user && isAdmin && (
            <Nav.Link
              as={NavLink}
              to="/admin"
              style={navItemStyles}
              onClick={onClose}
            >
              <i className="fa-solid fa-shield-halved me-2" style={{ fontSize: 13 }} />
              Admin
            </Nav.Link>
          )}
        </Nav>

        <div className="flex-grow-1" />

        {!user && (
          <div className="d-flex flex-column gap-2">
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => {
                onClose();
                navigate("/login");
              }}
            >
              Login
            </Button>
            <Button
              variant="light"
              size="sm"
              onClick={() => {
                onClose();
                navigate("/register");
              }}
            >
              Register
            </Button>
          </div>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default MobileSidebar;