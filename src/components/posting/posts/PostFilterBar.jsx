import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Collapse from "react-bootstrap/Collapse";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

const PostFilterBar = ({
  showFilters,
  sortBy,
  setSortBy,
  authorFilter,
  setAuthorFilter,
  scoreFilter,
  setScoreFilter,
  userId,
  onClear,
  onRefresh,
}) => (
  <Collapse in={showFilters}>
    <div className="mb-3">
      <Card>
        <Card.Body className="py-3">
          <Row className="g-2 align-items-end">
            <Col xs={12} sm={6} md={4}>
              <Form.Group>
                <Form.Label className="small text-muted">Sort</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="score">Highest score</option>
                  <option value="comments">Most comments</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Form.Group>
                <Form.Label className="small text-muted">Author</Form.Label>
                <Form.Select
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  disabled={!userId}
                >
                  <option value="all">All</option>
                  <option value="mine">Mine</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Form.Group>
                <Form.Label className="small text-muted">Score</Form.Label>
                <Form.Select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                >
                  <option value="any">Any</option>
                  <option value="gte1">≥ 1</option>
                  <option value="gte10">≥ 10</option>
                  <option value="gte100">≥ 100</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} className="d-flex justify-content-end gap-2 mt-2">
              <Button variant="outline-secondary" onClick={onClear} size="sm">
                Reset
              </Button>
              <Button variant="outline-primary" onClick={onRefresh} size="sm">
                <i
                  className="fa-solid fa-rotate-right me-1"
                  style={{ fontSize: 11 }}
                />
                Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  </Collapse>
);

export default PostFilterBar;
