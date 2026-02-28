import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { getAllCommunities } from "../../api/admin";
import { deleteCommunity } from "../../api/communities";
import { supabase } from "../../api/supabaseClient";
import AvatarFromStorage from "../posting/posts/AvatarFromStorage";
import DeleteConfirmModal from "../shared/DeleteConfirmModal";

const POLL_INTERVAL = 10000;

const AdminCommunities = () => {
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    community: null,
  });
  const [deleting, setDeleting] = useState(false);

  const searchRef = useRef(search);
  const sortRef = useRef(sortBy);
  const pollRef = useRef(null);

  searchRef.current = search;
  sortRef.current = sortBy;

  const load = useCallback(async ({ s, sort, silent = false } = {}) => {
    const searchVal = s ?? searchRef.current;
    const sortVal = sort ?? sortRef.current;
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const data = await getAllCommunities({ search: searchVal, sortBy: sortVal });
      setCommunities(data);
    } catch (e) {
      if (!silent) setError(e?.message || "Failed to load communities.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load({ s: "", sort: "newest" });

    const channel = supabase
      .channel(`admin-communities-realtime-${Math.random().toString(16).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "communities" },
        () => load({ silent: true })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_members" },
        () => load({ silent: true })
      )
      .subscribe();

    pollRef.current = setInterval(() => load({ silent: true }), POLL_INTERVAL);

    return () => {
      supabase.removeChannel(channel);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    load({ sort: val });
  };

  const handleDelete = async () => {
    const community = deleteModal.community;
    if (!community) return;

    setError("");
    setDeleting(true);
    try {
      await deleteCommunity(community.id);
      setCommunities((prev) => prev.filter((c) => c.id !== community.id));
      setDeleteModal({ show: false, community: null });
    } catch (e) {
      setError(e?.message || "Failed to delete community.");
      setDeleteModal({ show: false, community: null });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <Card.Body>
        <Form onSubmit={handleSearch} className="mb-3">
          <Row className="g-2 align-items-end">
            <Col xs={12} md={7}>
              <InputGroup>
                <Form.Control
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or description…"
                />
                <Button type="submit" variant="primary">
                  <i
                    className="fa-solid fa-magnifying-glass me-2"
                    style={{ fontSize: 12 }}
                  />
                  Search
                </Button>
                {search && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setSearch("");
                      load({ s: "" });
                    }}
                  >
                    Clear
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col xs={12} md={5}>
              <Form.Select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="members">Most members</option>
              </Form.Select>
            </Col>
          </Row>
        </Form>

        {error && (
          <Alert variant="danger" className="py-2">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="d-flex align-items-center gap-2 text-muted py-3">
            <Spinner size="sm" />
            <span>Loading communities…</span>
          </div>
        ) : communities.length === 0 ? (
          <div className="text-muted py-3">
            <i className="fa-solid fa-inbox me-2" />
            No communities found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ fontSize: "0.8125rem" }}>Name</th>
                  <th style={{ fontSize: "0.8125rem" }}>Creator</th>
                  <th style={{ fontSize: "0.8125rem" }}>Members</th>
                  <th style={{ fontSize: "0.8125rem" }}>Created</th>
                  <th style={{ fontSize: "0.8125rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {communities.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link
                        to={`/community/${encodeURIComponent(c.name)}`}
                        className="fw-semibold text-decoration-none"
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--fs-primary)",
                        }}
                      >
                        {c.name}
                      </Link>
                      {c.description && (
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {c.description.length > 60
                            ? c.description.substring(0, 60) + "…"
                            : c.description}
                        </div>
                      )}
                    </td>
                    <td>
                      {c.creator ? (
                        <div className="d-flex align-items-center gap-2">
                          <Link
                            to={`/profile/${c.creator.id}`}
                            className="text-decoration-none"
                          >
                            <AvatarFromStorage
                              pathOrUrl={c.creator.avatar_url}
                              size="sm"
                            />
                          </Link>
                          <Link
                            to={`/profile/${c.creator.id}`}
                            className="fs-author-name-link"
                          >
                            {c.creator.username || "Unknown"}
                          </Link>
                        </div>
                      ) : (
                        <span
                          className="text-muted"
                          style={{ fontSize: "0.875rem" }}
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td>
                      <Badge
                        bg="light"
                        text="dark"
                        style={{ fontSize: "0.8125rem" }}
                      >
                        <i
                          className="fa-solid fa-user-group me-1"
                          style={{ fontSize: 10 }}
                        />
                        {c.member_count ?? 0}
                      </Badge>
                    </td>
                    <td>
                      <span className="fs-timestamp">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() =>
                          setDeleteModal({ show: true, community: c })
                        }
                      >
                        <i
                          className="fa-solid fa-trash me-1"
                          style={{ fontSize: 11 }}
                        />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card.Body>

      <DeleteConfirmModal
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, community: null })}
        onDelete={handleDelete}
        deleting={deleting}
        title="Delete community"
        warning={
          deleteModal.community
            ? `Are you sure you want to delete "${deleteModal.community.name}"? All posts will be deleted and all members removed. This action cannot be undone.`
            : ""
        }
      />
    </Card>
  );
};

export default AdminCommunities;