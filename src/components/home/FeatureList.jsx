import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";

const FEATURES = [
  {
    title: "Create and browse posts",
    desc: "Share ideas with a title + content and see the newest posts first.",
    badge: "Posts",
    icon: "fa-solid fa-pen",
  },
  {
    title: "Upvote or downvote posts",
    desc: "Upvote or downvote posts that you like or dislike.",
    badge: "Posts",
    icon: "fa-solid fa-thumbs-up",
  },
  {
    title: "Comment threads",
    desc: "Discuss posts with replies that include author information and timestamps.",
    badge: "Comments",
    icon: "fa-solid fa-comments",
  },
  {
    title: "Profiles + profile pictures",
    desc: "Customize your profile and upload an avatar to storage.",
    badge: "Profile",
    icon: "fa-solid fa-image",
  },
  {
    title: "Account management",
    desc: "Update your profile data and delete your account when needed.",
    badge: "Settings",
    icon: "fa-solid fa-gear",
  },
  {
    title: "Authentication",
    desc: "Secure signup/login with Supabase Auth and session-aware navigation.",
    badge: "Auth",
    icon: "fa-solid fa-lock",
  },
];

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
                <div
                  className="fw-semibold"
                  style={{ fontSize: "0.875rem" }}
                >
                  {f.title}
                </div>
                <div
                  className="text-muted"
                  style={{ fontSize: "0.8125rem" }}
                >
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
