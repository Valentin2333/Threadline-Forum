import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import {FORMSUBMIT_URL} from "./shared/constants"

const ContactUs = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: "", email: "", subject: "", message: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    setServerError("");

    try {
      const res = await fetch(FORMSUBMIT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim(),
          _subject: data.subject.trim(),
          message: data.message.trim(),
          _template: "table",
        }),
      });

      if (!res.ok) throw new Error("Failed to send message.");

      setSent(true);
      reset();
    } catch (e) {
      setServerError(e?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: 640 }}>
      <div className="mb-3">
        <Button
          variant="outline-secondary"
          size="sm"
          className="d-inline-flex align-items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          <span>Back</span>
        </Button>
      </div>

      <Card>
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: 56,
                height: 56,
                borderRadius: "var(--fs-radius)",
                background: "var(--fs-primary-subtle)",
              }}
            >
              <i
                className="fa-solid fa-envelope"
                style={{ color: "var(--fs-primary)", fontSize: 24 }}
              />
            </div>

            <h2 className="fs-page-title mb-1">Contact Us</h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
              Have a question, suggestion, or issue? Fill in the form below and
              we'll get back to you as soon as possible.
            </p>
          </div>

          {sent ? (
            <Alert variant="success" className="text-center py-4">
              <i
                className="fa-solid fa-circle-check me-2"
                style={{ fontSize: 18 }}
              />
              <strong>Message sent!</strong>
              <br />
              <span className="text-muted" style={{ fontSize: "0.875rem" }}>
                Thank you for reaching out. We'll respond within 24-48 hours.
              </span>
              <div className="mt-3">
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => setSent(false)}
                >
                  Send another message
                </Button>
              </div>
            </Alert>
          ) : (
            <>
              {serverError && (
                <Alert variant="danger" className="py-2">
                  {serverError}
                </Alert>
              )}

              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    placeholder="Your name"
                    {...register("name", {
                      required: "Name is required",
                      minLength: { value: 2, message: "Min 2 characters" },
                      maxLength: { value: 100, message: "Max 100 characters" },
                    })}
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="you@example.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email",
                      },
                    })}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    So we can reply to you.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    placeholder="What is this about?"
                    {...register("subject", {
                      required: "Subject is required",
                      minLength: { value: 4, message: "Min 4 characters" },
                      maxLength: { value: 150, message: "Max 150 characters" },
                    })}
                    isInvalid={!!errors.subject}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.subject?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Write your message here..."
                    {...register("message", {
                      required: "Message is required",
                      minLength: { value: 10, message: "Min 10 characters" },
                      maxLength: { value: 5000, message: "Max 5000 characters" },
                    })}
                    isInvalid={!!errors.message}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.message?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => {
                      reset();
                      setServerError("");
                    }}
                    disabled={isSubmitting}
                  >
                    Clear
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <i
                          className="fa-solid fa-paper-plane me-2"
                          style={{ fontSize: 13 }}
                        />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </>
          )}

          <div className="mt-4 text-center text-muted" style={{ fontSize: "0.8125rem" }}>
            <i className="fa-solid fa-clock me-1" style={{ fontSize: 11 }} />
            We typically respond within 24-48 hours.
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ContactUs;
