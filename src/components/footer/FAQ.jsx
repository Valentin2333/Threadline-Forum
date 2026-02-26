import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import { FAQ_ITEMS } from "./shared/constants";

const FAQ = () => {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState(null);

  return (
    <Container className="py-4">
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
              className="fa-solid fa-circle-question me-2"
              style={{ color: "var(--fs-primary)" }}
            />
            Frequently Asked Questions
          </h2>
          <p className="text-muted mb-4" style={{ fontSize: "0.875rem" }}>
            Quick answers to the most common questions about Threadline.
          </p>

          <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
            {FAQ_ITEMS.map((item, index) => (
              <Accordion.Item eventKey={String(index)} key={index} className="fs-faq-item">
                <Accordion.Header>{item.question}</Accordion.Header>
                <Accordion.Body
                  className="text-muted"
                  style={{ fontSize: "0.9rem", lineHeight: 1.7 }}
                >
                  {item.answer}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>

          <div className="mt-4 text-muted" style={{ fontSize: "0.8125rem" }}>
            <i className="fa-solid fa-envelope me-1" style={{ fontSize: 11 }} />
            Still have questions?{" "}
            <Link to="/contact" className="fw-semibold">
              Contact us
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FAQ;
