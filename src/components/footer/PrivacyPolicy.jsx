import { Link, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { PRIVACY_SECTIONS } from "./shared/constants";

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

          {PRIVACY_SECTIONS.map((section, i) => (
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
