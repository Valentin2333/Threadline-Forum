import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { supabase } from "../../../api/supabaseClient";
import AuthAlerts from "../shared/AuthAlerts";
import AuthSubmitRow from "../shared/AuthSubmitRow";
import useLoginPrefill from "./hooks/useLoginPrefill";
import PasswordInput from "../shared/PasswordInput";

const Login = ({ onSwitchToRegister }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

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

  useLoginPrefill({
    locationState: location.state,
    setInfoMessage,
    prefilledEmail,
    setValue,
  });

  const { ref: passwordRef, ...passwordRest } = register("password", {
    required: "Password is required",
  });

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
      <div className="mb-4">
        <h2 className="fs-page-title mb-1">Welcome back</h2>
        <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
          Sign in to your account to continue
        </p>
      </div>

      <AuthAlerts infoMessage={infoMessage} serverError={serverError} />

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="you@example.com"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && (
          <p className="text-danger small mt-1 mb-0">{errors.email.message}</p>
        )}
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Password</Form.Label>
        <PasswordInput
          ref={passwordRef}
          placeholder="Enter your password"
          isInvalid={!!errors.password}
          {...passwordRest}
        />
      </Form.Group>

      <AuthSubmitRow
        loading={loading}
        submitText="Login"
        loadingText="Logging in..."
        secondaryText="Don't have an account? Register"
        onSecondaryClick={onSwitchToRegister}
      />
    </Form>
  );
};

export default Login;
