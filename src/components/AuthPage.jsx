import { useLocation, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Register from "./Register";
import Login from "./Login";

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const mode = location.pathname === "/register" ? "register" : "login";

  const goLogin = () => navigate("/login");
  const goRegister = () => navigate("/register");

  return (
    <Container className="py-5" style={{ maxWidth: 520 }}>
      <Card className="p-4">
        {mode === "login" ? (
          <Login onSwitchToRegister={goRegister} />
        ) : (
          <Register onSwitchToLogin={goLogin} />
        )}
      </Card>
    </Container>
  );
};

export default AuthPage;
