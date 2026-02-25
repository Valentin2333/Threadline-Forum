import Offcanvas from "react-bootstrap/Offcanvas";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import { NavLink, useNavigate } from "react-router-dom";
import { navItemStyles } from "./styles/navItemStyles";
import ThemeToggle from "../theme/ThemeToggle";

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
          Threadline
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
            to="/feed"
            style={navItemStyles}
            onClick={onClose}
          >
            <i className="fa-solid fa-rss me-2" style={{ fontSize: 13 }} />
            Feed
          </Nav.Link>

          {user && (
            <Nav.Link
              as={NavLink}
              to="/communities"
              style={navItemStyles}
              onClick={onClose}
            >
              <i className="fa-solid fa-users me-2" style={{ fontSize: 13 }} />
              Communities
            </Nav.Link>
          )}

          {user && (
            <Nav.Link
              as={NavLink}
              to="/my-communities"
              style={navItemStyles}
              onClick={onClose}
            >
              <i className="fa-solid fa-hammer me-2" style={{ fontSize: 13 }} />
              My Communities
            </Nav.Link>
          )}

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
              <i
                className="fa-solid fa-shield-halved me-2"
                style={{ fontSize: 13 }}
              />
              Admin
            </Nav.Link>
          )}
        </Nav>

        <div className="flex-grow-1" />

        <div className="d-flex flex-column gap-2">
          {!user && (
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
          )}

          <div className={`d-flex align-items-center gap-2 ${!user ? "mt-1" : ""}`}>
            <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)" }}>
              <i className="fa-solid fa-circle-half-stroke me-1" style={{ fontSize: 11 }} />
              Theme
            </span>
            <ThemeToggle />
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default MobileSidebar;
