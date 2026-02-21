import { useEffect, useState } from "react";
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
import { getAllPosts, deleteAnyPost } from "../../api/admin";
import AvatarFromStorage from "../posting/posts/AvatarFromStorage";

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = async ({ s = search, sort = sortBy } = {}) => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllPosts({ search: s, sortBy: sort });
      setPosts(data);
    } catch (e) {
      setError(e?.message || "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ s: "", sort: "newest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    load({ sort: val });
  };

  const handleDelete = async (postId) => {
    const ok = window.confirm("Delete this post? This cannot be undone.");
    if (!ok) return;

    setError("");
    setDeletingId(postId);
    try {
      await deleteAnyPost({ postId });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (e) {
      setError(e?.message || "Failed to delete post.");
    } finally {
      setDeletingId(null);
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
                  placeholder="Search by title or content…"
                />
                <Button type="submit" variant="primary">
                  <i className="fa-solid fa-magnifying-glass me-2" style={{ fontSize: 12 }} />
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
              <Form.Select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="score">Highest score</option>
                <option value="comments">Most comments</option>
              </Form.Select>
            </Col>
          </Row>
        </Form>

        {error && <Alert variant="danger" className="py-2">{error}</Alert>}

        {loading ? (
          <div className="d-flex align-items-center gap-2 text-muted py-3">
            <Spinner size="sm" />
            <span>Loading posts…</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-muted py-3">
            <i className="fa-solid fa-inbox me-2" />
            No posts found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ fontSize: "0.8125rem" }}>Author</th>
                  <th style={{ fontSize: "0.8125rem" }}>Title</th>
                  <th style={{ fontSize: "0.8125rem" }}>Score</th>
                  <th style={{ fontSize: "0.8125rem" }}>Comments</th>
                  <th style={{ fontSize: "0.8125rem" }}>Date</th>
                  <th style={{ fontSize: "0.8125rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Link to={`/profile/${post.author_id}`} className="text-decoration-none">
                          <AvatarFromStorage pathOrUrl={post.post_author?.avatar_url} size="sm" />
                        </Link>
                        <Link to={`/profile/${post.author_id}`} className="fs-author-name-link">
                          {post.post_author?.username || "Unknown"}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <Link
                        to={`/posts/${post.id}`}
                        className="fs-post-title"
                        style={{ fontSize: "0.875rem" }}
                        title={post.title}
                      >
                        {post.title.length > 50 ? post.title.substring(0, 50) + "…" : post.title}
                      </Link>
                    </td>
                    <td>
                      <Badge className="fs-score-badge" style={{ fontSize: "0.6875rem" }}>
                        <i className="fa-solid fa-arrow-up me-1" style={{ fontSize: 9 }} />
                        {post.score ?? 0}
                      </Badge>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.875rem" }}>
                        <i className="fa-regular fa-comment me-1" style={{ fontSize: 11 }} />
                        {post.comment_count ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className="fs-timestamp">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(post.id)}
                        disabled={deletingId === post.id}
                      >
                        {deletingId === post.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <i className="fa-solid fa-trash me-1" style={{ fontSize: 11 }} />
                            Delete
                          </>
                        )}
                      </Button>
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

export default AdminPosts;