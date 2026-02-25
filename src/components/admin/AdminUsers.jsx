import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import InputGroup from "react-bootstrap/InputGroup";
import { searchUsers, setUserBlocked } from "../../api/admin";
import AvatarFromStorage from "../posting/posts/AvatarFromStorage";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const load = async (q = query) => {
    setLoading(true);
    setError("");
    try {
      const data = await searchUsers({ query: q });
      setUsers(data);
    } catch (e) {
      setError(e?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(query);
  };

  const toggleBlock = async (user) => {
    setError("");
    setActionLoading(user.id);
    try {
      const updated = await setUserBlocked({
        userId: user.id,
        blocked: !user.is_blocked,
      });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (e) {
      setError(e?.message || "Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Card>
      <Card.Body>
        <Form onSubmit={handleSearch} className="mb-3">
          <InputGroup>
            <Form.Control
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username, email, or name…"
            />
            <Button type="submit" variant="primary">
              <i
                className="fa-solid fa-magnifying-glass me-2"
                style={{ fontSize: 12 }}
              />
              Search
            </Button>
            {query && (
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setQuery("");
                  load("");
                }}
              >
                Clear
              </Button>
            )}
          </InputGroup>
        </Form>

        {error && (
          <Alert variant="danger" className="py-2">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="d-flex align-items-center gap-2 text-muted py-3">
            <Spinner size="sm" />
            <span>Loading users…</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-muted py-3">
            <i className="fa-solid fa-inbox me-2" />
            No users found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ fontSize: "0.8125rem" }}>User</th>
                  <th style={{ fontSize: "0.8125rem" }}>Email</th>
                  <th style={{ fontSize: "0.8125rem" }}>Phone</th>
                  <th style={{ fontSize: "0.8125rem" }}>Reputation</th>
                  <th style={{ fontSize: "0.8125rem" }}>Status</th>
                  <th style={{ fontSize: "0.8125rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Link
                          to={`/profile/${u.id}`}
                          className="text-decoration-none"
                        >
                          <AvatarFromStorage
                            pathOrUrl={u.avatar_url}
                            size="sm"
                          />
                        </Link>
                        <div>
                          <Link
                            to={`/profile/${u.id}`}
                            className="fs-author-name-link"
                          >
                            {u.username || "—"}
                          </Link>
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {u.first_name} {u.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.875rem" }}>{u.email || "—"}</td>
                    <td style={{ fontSize: "0.875rem" }}>{u.phone || "—"}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          background: "var(--fs-primary-subtle)",
                          color: "var(--fs-primary)",
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                          padding: "0.2em 0.5em",
                          borderRadius: "var(--fs-radius-pill)",
                        }}
                      >
                        <i
                          className="fa-solid fa-star"
                          style={{ fontSize: 9 }}
                        />
                        {u.reputation ?? 0}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        {u.is_admin && (
                          <Badge bg="primary" style={{ fontSize: "0.6875rem" }}>
                            Admin
                          </Badge>
                        )}
                        {u.is_blocked ? (
                          <Badge bg="danger" style={{ fontSize: "0.6875rem" }}>
                            Blocked
                          </Badge>
                        ) : (
                          <Badge bg="success" style={{ fontSize: "0.6875rem" }}>
                            Active
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td>
                      {!u.is_admin && (
                        <Button
                          size="sm"
                          variant={
                            u.is_blocked ? "outline-success" : "outline-danger"
                          }
                          onClick={() => toggleBlock(u)}
                          disabled={actionLoading === u.id}
                        >
                          {actionLoading === u.id ? (
                            <Spinner size="sm" />
                          ) : u.is_blocked ? (
                            <>
                              <i
                                className="fa-solid fa-unlock me-1"
                                style={{ fontSize: 11 }}
                              />
                              Unblock
                            </>
                          ) : (
                            <>
                              <i
                                className="fa-solid fa-ban me-1"
                                style={{ fontSize: 11 }}
                              />
                              Block
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AdminUsers;
