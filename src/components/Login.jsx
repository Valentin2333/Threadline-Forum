import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { supabase } from "../api/supabaseClient";

const Login = ({ onSwitchToRegister }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  // Read values passed from Register
  const prefilledEmail = location.state?.email ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  // Show success message + prefill email after registration
  useEffect(() => {
    if (location.state?.authMessage) {
      setInfoMessage(location.state.authMessage);
    }

    if (prefilledEmail) {
      setValue("email", prefilledEmail);
    }
  }, [location.state, prefilledEmail, setValue]);

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);

    try {
      const email = data.email.trim().toLowerCase();
      const password = data.password;

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setServerError(error.message);
        return;
      }

      // Clear message and router state so it doesn't reappear
      setInfoMessage("");
      navigate("/", { replace: true });
    } catch (e) {
      setServerError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-3">Login</h2>

      {infoMessage && (
        <Alert variant="success" className="mb-3">
          {infoMessage}
        </Alert>
      )}

      {serverError && (
        <Alert variant="danger" className="mb-3">
          {serverError}
        </Alert>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && <p className="text-danger">{errors.email.message}</p>}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          {...register("password", { required: "Password is required" })}
        />
        {errors.password && (
          <p className="text-danger">{errors.password.message}</p>
        )}
      </Form.Group>

      <div className="d-flex gap-2 align-items-center">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>

        <Button variant="link" type="button" onClick={onSwitchToRegister}>
          Don&apos;t have an account? Register
        </Button>
      </div>
    </Form>
  );
};

export default Login;
