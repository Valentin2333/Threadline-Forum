import Offcanvas from "react-bootstrap/Offcanvas";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import { NavLink, useNavigate } from "react-router-dom";
import { navItemStyles } from "./styles/navItemStyles";

const MobileSidebar = ({ show, onClose, user, onLogout }) => {
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
        <Offcanvas.Title>Menu</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column">
        <Nav className="flex-column">
          {user && (
            <Nav.Link
              as={NavLink}
              to="/profile"
              style={navItemStyles}
              onClick={onClose}
            >
              Your Profile
            </Nav.Link>
          )}

          <Nav.Link
            as={NavLink}
            to="/posts"
            style={navItemStyles}
            onClick={onClose}
          >
            Posts
          </Nav.Link>
        </Nav>

        <div className="flex-grow-1" />

        <div className="d-flex flex-column gap-2">
          {!user ? (
            <>
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
            </>
          ) : (
            <Button variant="outline-light" size="sm" onClick={onLogout}>
              Logout
            </Button>
          )}
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default MobileSidebar;
