import { Link, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content:
      "When you register we collect your email address, username, and optional profile details such as " +
      "your first name, last name, phone number, and avatar image. We also collect content you create " +
      "(posts, comments, votes) and basic usage data needed to operate the platform.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "Your information is used to provide and improve the Threadline service: authenticating your account, " +
      "displaying your profile and content to other users, calculating reputation scores, and sending " +
      "service-related notifications. We do not sell your personal data to third parties.",
  },
  {
    title: "3. Data Storage & Security",
    content:
      "Your data is stored securely via Supabase infrastructure with row-level security policies. " +
      "Passwords are hashed and never stored in plain text. While we take reasonable measures to protect " +
      "your information, no method of electronic transmission or storage is 100% secure.",
  },
  {
    title: "4. Cookies & Local Storage",
    content:
      "Threadline uses session tokens stored in your browser to keep you logged in. " +
      "We do not use third-party tracking cookies or analytics services that profile your behaviour across other websites.",
  },
  {
    title: "5. Your Rights",
    content:
      "You may view, edit, or delete your profile information at any time from the Your Profile page. " +
      "You may also permanently delete your account, which will remove your profile data. " +
      "To request a full data export or erasure, contact us at the email below.",
  },
  {
    title: "6. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. Any changes will be reflected on this page " +
      "with an updated revision date. Continued use of Threadline after changes are posted constitutes acceptance of the revised policy.",
  },
];

const PrivacyPolicy = () => {
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
              className="fa-solid fa-shield-halved me-2"
              style={{ color: "var(--fs-primary)" }}
            />
            Privacy Policy
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
            Privacy concerns?{" "}
            <Link to="/contact" className="fw-semibold">
              Contact us
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PrivacyPolicy;
