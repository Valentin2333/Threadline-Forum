import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="fs-footer mt-auto">
      <Container>
        <Row className="g-4 py-4">
          <Col xs={12} md={4}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i
                className="fa-solid fa-comments"
                style={{ color: "var(--fs-primary-light)", fontSize: 18 }}
              />
              <span className="fw-bold" style={{ fontSize: "1.125rem" }}>
                Threadline
              </span>
            </div>
            <p className="mb-0 fs-footer-muted" style={{ fontSize: "0.8125rem" }}>
              A community space - join communities, post ideas, discuss in
              comments, vote, and build your profile.
            </p>
          </Col>

          <Col xs={6} md={4}>
            <h6 className="fs-footer-heading">Resources</h6>
            <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
              <li>
                <Link to="/faq" className="fs-footer-link">
                  <i className="fa-solid fa-circle-question me-2" style={{ fontSize: 11 }} />
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="fs-footer-link">
                  <i className="fa-solid fa-file-contract me-2" style={{ fontSize: 11 }} />
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="fs-footer-link">
                  <i className="fa-solid fa-shield-halved me-2" style={{ fontSize: 11 }} />
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </Col>

          <Col xs={6} md={4}>
            <h6 className="fs-footer-heading">Contact Us</h6>
            <Link to="/contact" className="fs-footer-link">
              <i className="fa-solid fa-envelope me-2" style={{ fontSize: 11 }} />
              Email Us
            </Link>
          </Col>
        </Row>

        <div className="fs-footer-bottom py-3">
          <span className="fs-footer-muted" style={{ fontSize: "0.8rem" }}>
            © {year} Threadline. All rights reserved.
          </span>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
