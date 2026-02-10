import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { supabase } from "../api/supabaseClient";

const NAME_MIN = 4;
const NAME_MAX = 32;

const Register = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const emailPattern = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);

    try {
      const firstName = data.firstName.trim();
      const lastName = data.lastName.trim();
      const username = data.username.trim();
      const email = data.email.trim().toLowerCase();
      const password = data.password;

      // Optional: check username uniqueness (case-insensitive)
      if (username.length > 0) {
        const { data: existing, error: usernameCheckError } = await supabase
          .from("profiles")
          .select("id")
          .ilike("username", username)
          .limit(1);

        if (usernameCheckError) throw usernameCheckError;

        if (existing && existing.length > 0) {
          setError("username", {
            type: "validate",
            message: "Username is already taken.",
          });
          setLoading(false);
          return;
        }
      }

      // Sign up in Supabase Auth (profile row created by trigger using metadata)
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            username: username.length ? username : null,
          },
        },
      });

      if (signUpError) {
        setServerError(signUpError.message);
        setLoading(false);
        return;
      }

      // If email confirmation is enabled, session will usually be null.
      // We still redirect to login and show the "confirm email" message.
      const confirmMessage =
        "Registration successful! Please confirm your email from your inbox, then log in.";

      // Prefer navigating via router state (works great for flash messages)
      navigate("/login", {
        replace: true,
        state: { authMessage: confirmMessage, email },
      });
    } catch (e) {
      setServerError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-3">Register</h2>

      {serverError && (
        <Alert variant="danger" className="mb-3">
          {serverError}
        </Alert>
      )}

      <Form.Group className="mb-3">
        <Form.Label>First name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter first name"
          {...register("firstName", {
            required: "First name is required",
            minLength: { value: NAME_MIN, message: `First name must be at least ${NAME_MIN} characters` },
            maxLength: { value: NAME_MAX, message: `First name must be at most ${NAME_MAX} characters` },
            validate: (v) =>
              v.trim().length >= NAME_MIN || `First name must be at least ${NAME_MIN} characters`,
          })}
        />
        {errors.firstName && <p className="text-danger">{errors.firstName.message}</p>}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Last name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter last name"
          {...register("lastName", {
            required: "Last name is required",
            minLength: { value: NAME_MIN, message: `Last name must be at least ${NAME_MIN} characters` },
            maxLength: { value: NAME_MAX, message: `Last name must be at most ${NAME_MAX} characters` },
            validate: (v) =>
              v.trim().length >= NAME_MIN || `Last name must be at least ${NAME_MIN} characters`,
          })}
        />
        {errors.lastName && <p className="text-danger">{errors.lastName.message}</p>}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Username (optional)</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter username"
          {...register("username", {
            validate: (v) => {
              const val = v.trim();
              if (val.length === 0) return true;
              if (val.length < NAME_MIN) return `Username must be at least ${NAME_MIN} characters`;
              if (val.length > NAME_MAX) return `Username must be at most ${NAME_MAX} characters`;
              return true;
            },
          })}
        />
        {errors.username && <p className="text-danger">{errors.username.message}</p>}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          {...register("email", {
            required: "Email is required",
            pattern: { value: emailPattern, message: "Please enter a valid email" },
          })}
        />
        {errors.email && <p className="text-danger">{errors.email.message}</p>}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Enter password"
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters" },
          })}
        />
        {errors.password && <p className="text-danger">{errors.password.message}</p>}
      </Form.Group>

      <div className="d-flex gap-2 align-items-center">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Creating account...
            </>
          ) : (
            "Register"
          )}
        </Button>

        <Button variant="link" type="button" onClick={onSwitchToLogin}>
          Already have an account? Log in
        </Button>
      </div>
    </Form>
  );
};

export default Register;
