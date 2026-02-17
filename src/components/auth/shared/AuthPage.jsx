import { useLocation, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Register from "../Register/Register";
import Login from "../Login/Login";

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const mode = location.pathname === "/register" ? "register" : "login";

  const goLogin = () => navigate("/login");
  const goRegister = () => navigate("/register");

  return (
    <Container className="py-5" style={{ maxWidth: 480 }}>
      <Card className="fs-auth-card">
        <Card.Body className="p-4 pt-4">
          {mode === "login" ? (
            <Login onSwitchToRegister={goRegister} />
          ) : (
            <Register onSwitchToLogin={goLogin} />
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AuthPage;
