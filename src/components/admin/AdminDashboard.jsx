import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import AdminStats from "./AdminStats";
import AdminUsers from "./AdminUsers";
import AdminPosts from "./AdminPosts";
import AdminCommunities from "./AdminCommunities";
import AdminReports from "./AdminReports";

const VALID_TABS = ["users", "communities", "posts", "reports"];

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = VALID_TABS.includes(searchParams.get("tab"))
    ? searchParams.get("tab")
    : "reports";

  const handleSelect = useCallback(
    (key) => {
      setSearchParams({ tab: key }, { replace: true });
    },
    [setSearchParams],
  );

  return (
    <Container className="py-4">
      <h2 className="fs-page-title mb-1">
        <i
          className="fa-solid fa-shield-halved me-2"
          style={{ color: "var(--fs-primary)" }}
        />
        Admin Dashboard
      </h2>

      <AdminStats />

      <Nav
        variant="tabs"
        activeKey={tab}
        onSelect={handleSelect}
        className="mb-3 mt-4"
      >
        <Nav.Item>
          <Nav.Link eventKey="reports">
            <i className="fa-solid fa-flag me-2" style={{ fontSize: 13 }} />
            Reports
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link eventKey="users">
            <i className="fa-solid fa-users me-2" style={{ fontSize: 13 }} />
            Users
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link eventKey="communities">
            <i
              className="fa-solid fa-people-group me-2"
              style={{ fontSize: 13 }}
            />
            Communities
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link eventKey="posts">
            <i
              className="fa-solid fa-newspaper me-2"
              style={{ fontSize: 13 }}
            />
            Posts
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {tab === "reports" && <AdminReports />}
      {tab === "users" && <AdminUsers />}
      {tab === "posts" && <AdminPosts />}
      {tab === "communities" && <AdminCommunities />}
    </Container>
  );
};

export default AdminDashboard;
