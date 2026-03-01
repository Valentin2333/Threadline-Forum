import { useState, forwardRef } from "react";
import Form from "react-bootstrap/Form";

const PasswordInput = forwardRef(
  ({ isInvalid, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="fs-password-wrapper">
        <Form.Control
          ref={ref}
          type={visible ? "text" : "password"}
          isInvalid={isInvalid}
          {...rest}
        />

        <button
          type="button"
          className="fs-password-toggle"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          <i className={`fa-regular ${visible ? "fa-eye-slash" : "fa-eye"}`} />
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;