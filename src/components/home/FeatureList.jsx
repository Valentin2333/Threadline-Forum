import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";
import { FEATURES } from "./shared/constants";

const FeatureList = () => (
  <Card className="h-100">
    <Card.Header className="bg-dark text-light d-flex align-items-center gap-2">
      <i className="fa-solid fa-bolt" style={{ fontSize: 14 }} />
      Core features
    </Card.Header>

    <ListGroup variant="flush">
      {FEATURES.map((f, i) => (
        <ListGroup.Item key={i} className="fs-feature-item">
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div className="d-flex gap-3 align-items-start">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--fs-radius-sm)",
                  background: "var(--fs-primary-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <i
                  className={f.icon}
                  style={{ color: "var(--fs-primary)", fontSize: 13 }}
                />
              </div>
              <div>
                <div className="fw-semibold" style={{ fontSize: "0.875rem" }}>
                  {f.title}
                </div>
                <div className="text-muted" style={{ fontSize: "0.8125rem" }}>
                  {f.desc}
                </div>
              </div>
            </div>
            <Badge bg="light" text="dark">
              {f.badge}
            </Badge>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  </Card>
);

export default FeatureList;
