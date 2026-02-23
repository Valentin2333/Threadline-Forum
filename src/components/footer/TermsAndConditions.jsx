import { Link, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using Threadline you agree to be bound by these Terms and Conditions. " +
      "If you do not agree with any part of these terms, you must not use the platform.",
  },
  {
    title: "2. User Accounts",
    content:
      "You must register for an account to create communities, publish posts, comment, and vote. " +
      "You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account. " +
      "Threadline reserves the right to suspend or terminate accounts that violate these terms.",
  },
  {
    title: "3. User Content",
    content:
      "You retain ownership of any content you post on Threadline. By submitting content you grant Threadline " +
      "a non-exclusive, royalty-free licence to display and distribute that content within the platform. " +
      "You agree not to post content that is unlawful, defamatory, hateful, or infringes on the rights of others.",
  },
  {
    title: "4. Community Guidelines",
    content:
      "Community creators are responsible for moderating their communities. " +
      "Threadline administrators may remove content or communities that violate these terms or that are reported for abuse. " +
      "Repeated violations may result in a permanent account block.",
  },
  {
    title: "5. Limitation of Liability",
    content:
      "Threadline is provided on an \"as is\" and \"as available\" basis. We do not guarantee uninterrupted or error-free " +
      "operation of the platform. To the fullest extent permitted by law, Threadline shall not be liable for any indirect, " +
      "incidental, or consequential damages arising from your use of the service.",
  },
  {
    title: "6. Changes to Terms",
    content:
      "We may update these Terms and Conditions from time to time. Continued use of the platform after changes " +
      "are published constitutes acceptance of the revised terms. We encourage you to review this page periodically.",
  },
];

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <Container className="py-4" style={{ maxWidth: 800 }}>
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
          <h2 className="fs-page-title mb-1">
            <i
              className="fa-solid fa-file-contract me-2"
              style={{ color: "var(--fs-primary)" }}
            />
            Terms & Conditions
          </h2>
          <p className="text-muted mb-4" style={{ fontSize: "0.8125rem" }}>
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>

          {SECTIONS.map((section, i) => (
            <div key={i} className="mb-4">
              <h5
                className="fw-semibold mb-2"
                style={{ fontSize: "1rem", color: "var(--fs-text)" }}
              >
                {section.title}
              </h5>
              <p
                className="mb-0 text-muted"
                style={{ fontSize: "0.9rem", lineHeight: 1.7 }}
              >
                {section.content}
              </p>
            </div>
          ))}

          <div className="text-muted" style={{ fontSize: "0.8125rem" }}>
            <i className="fa-solid fa-envelope me-1" style={{ fontSize: 11 }} />
            Questions about these terms?{" "}
            <Link to="/contact" className="fw-semibold">
              Contact us
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TermsAndConditions;
