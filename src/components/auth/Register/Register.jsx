import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import AuthAlerts from "../shared/AuthAlerts";
import AuthSubmitRow from "../shared/AuthSubmitRow";
import useRegisterSubmit from "./hooks/useRegisterSubmit";
import useRegisterForm from "./hooks/useRegisterForm";
import RegisterFields from "./RegisterFields";

const Register = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const { form, rules } = useRegisterForm();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = form;

  const { onSubmit } = useRegisterSubmit({
    clearErrors,
    setError,
    setServerError,
    setLoading,
    navigate,
  });

  return (
    <Form autoComplete="on" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <h2 className="fs-page-title mb-1">Create account</h2>
        <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
          Join the community and start posting
        </p>
      </div>

      <AuthAlerts infoMessage="" serverError={serverError} />
      <RegisterFields register={register} errors={errors} rules={rules} />

      <AuthSubmitRow
        loading={loading}
        submitText="Register"
        loadingText="Creating account..."
        secondaryText="Already have an account? Log in"
        onSecondaryClick={onSwitchToLogin}
      />
    </Form>
  );
};

export default Register;
