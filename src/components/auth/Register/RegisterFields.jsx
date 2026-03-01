import { useState } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {TERMS_SECTIONS, PRIVACY_SECTIONS} from "../shared/constants"
import PasswordInput from "../shared/PasswordInput";
import PasswordRules from "../shared/PasswordRules";

const PolicyModal = ({ show, onHide, title, icon, sections }) => (
  <Modal show={show} onHide={onHide} size="lg" scrollable centered>
    <Modal.Header closeButton>
      <Modal.Title style={{ fontSize: "1.125rem" }}>
        <i className={`${icon} me-2`} style={{ color: "var(--fs-primary)" }} />
        {title}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {sections.map((section, i) => (
        <div key={i} className="mb-4">
          <h6 className="fw-semibold mb-2" style={{ fontSize: "0.95rem" }}>
            {section.title}
          </h6>
          <p className="mb-0 text-muted" style={{ fontSize: "0.875rem", lineHeight: 1.7 }}>
            {section.content}
          </p>
        </div>
      ))}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" size="sm" onClick={onHide}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
);

const RegisterFields = ({ register, errors, rules, watch }) => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const passwordValue = watch("password");

  const { ref: passwordRef, ...passwordRest } = register("password", rules.password);

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>First name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter first name"
          isInvalid={!!errors.firstName}
          {...register("firstName", rules.firstName)}
        />
        <Form.Control.Feedback type="invalid">
          {errors.firstName?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Last name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter last name"
          isInvalid={!!errors.lastName}
          {...register("lastName", rules.lastName)}
        />
        <Form.Control.Feedback type="invalid">
          {errors.lastName?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter username"
          isInvalid={!!errors.username}
          autoComplete="nickname"
          {...register("username", rules.username)}
        />
        <Form.Control.Feedback type="invalid">
          {errors.username?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          isInvalid={!!errors.email}
          autoComplete="username"
          {...register("email", rules.email)}
        />
        <Form.Control.Feedback type="invalid">
          {errors.email?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <PasswordInput
          ref={passwordRef}
          placeholder="Enter password"
          isInvalid={!!errors.password}
          autoComplete="new-password"
          onFocus={() => setPasswordTouched(true)}
          {...passwordRest}
        />
        <PasswordRules
          password={passwordValue}
          show={passwordTouched || !!errors.password}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          id="acceptTerms"
          isInvalid={!!errors.acceptTerms}
          {...register("acceptTerms", rules.acceptTerms)}
          label={
            <span style={{ fontSize: "0.85rem" }}>
              I agree to the{" "}
              <a
                href="#"
                role="button"
                onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
              >
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a
                href="#"
                role="button"
                onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}
              >
                Privacy Policy
              </a>
            </span>
          }
          feedback={errors.acceptTerms?.message}
          feedbackType="invalid"
        />
      </Form.Group>

      <PolicyModal
        show={showTerms}
        onHide={() => setShowTerms(false)}
        title="Terms & Conditions"
        icon="fa-solid fa-file-contract"
        sections={TERMS_SECTIONS}
      />

      <PolicyModal
        show={showPrivacy}
        onHide={() => setShowPrivacy(false)}
        title="Privacy Policy"
        icon="fa-solid fa-shield-halved"
        sections={PRIVACY_SECTIONS}
      />
    </>
  );
};

export default RegisterFields;