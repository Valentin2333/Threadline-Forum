import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";

const FAQ_ITEMS = [
  {
    question: "How do I create a community?",
    answer:
      "Once you're logged in, head to the Communities page and click the \"Create Community\" button. " +
      "Choose a unique name (it will be prefixed with f/), add an optional description, and you're all set. " +
      "As the creator you can manage members and delete the community at any time.",
  },
  {
    question: "How does the voting system work?",
    answer:
      "Every post can be upvoted or downvoted by members of the community it belongs to. " +
      "Upvotes add +1 to the post's score and the author's reputation, while downvotes subtract 1 from both. " +
      "You can remove your vote at any time by clicking the same button again. You must be a member of the community to vote.",
  },
  {
    question: "Can I edit or delete my posts and comments?",
    answer:
      "Yes. Click the three-dot menu (⋮) on any post or comment you've created to see Edit and Delete options. " +
      "Admins and community creators can also delete content within their communities to keep discussions on track.",
  },
  {
    question: "How do I change my profile picture?",
    answer:
      "Go to Your Profile and click the camera icon or \"Change avatar\" button below your current picture. " +
      "Select an image file (max 2 MB) and it will be uploaded automatically. " +
      "Your new avatar will appear across all your posts and comments.",
  },
  {
    question: "What happens if I leave or get removed from a community?",
    answer:
      "If you leave a community, you will no longer see its posts in your feed and you won't be able to " +
      "create new posts, comment, or vote in that community. Your existing posts and comments will remain visible. " +
      "Community creators cannot leave their own community — they can delete it instead.",
  },
];

const FAQ = () => {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState(null);

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
