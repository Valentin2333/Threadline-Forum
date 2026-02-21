import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Collapse from "react-bootstrap/Collapse";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

const PostSearchBar = ({ showSearch, searchQuery, setSearchQuery }) => (
  <Collapse in={showSearch}>
    <div className="mb-3">
      <Card>
        <Card.Body className="py-3">
          <Row className="g-2 align-items-end">
            <Col xs={12} md={10}>
              <Form.Group>
                <Form.Label className="small text-muted">Search</Form.Label>
                <Form.Control
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, content, author…"
                  autoFocus
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={2} className="d-flex justify-content-end">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setSearchQuery("")}
                disabled={!searchQuery}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  </Collapse>
);

export default PostSearchBar;
