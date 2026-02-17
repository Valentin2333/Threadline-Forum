import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNewestPosts, updatePost, deletePost } from "../../api/posts";
import { updateComment, deleteComment } from "../../api/comments";
import CreateComment from "../posting/CreateComment";
import AvatarFromStorage from "./AvatarFromStorage";
import useAuthUser from "../navigation/hooks/useAuthUser";
import PostVotes from "./PostVotes";

import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Container } from "react-bootstrap";
import Collapse from "react-bootstrap/Collapse";

const validatePost = ({ title, content }) => {
  const errs = {};

  const t = (title ?? "").trim();
  const c = (content ?? "").trim();

  if (!t) errs.title = "Title required";
  else if (t.length < 16) errs.title = "Min 16 chars";
  else if (t.length > 64) errs.title = "Max 64 chars";

  if (!c) errs.content = "Content required";
  else if (c.length < 32) errs.content = "Min 32 chars";
  else if (c.length > 8192) errs.content = "Max 8192 chars";

  return errs;
};

const mapDbErrorToFields = (msg = "") => {
  const m = msg.toLowerCase();
  const errs = {};

  if (m.includes("post_title_length"))
    errs.title = "Title must be 16-64 characters.";
  if (m.includes("post_content_length"))
    errs.content = "Content must be 32-8192 characters.";

  if (!errs.title && m.includes("title")) errs.title = "Invalid title.";
  if (!errs.content && m.includes("content")) errs.content = "Invalid content.";

  return errs;
};

const normalize = (s) => (s ?? "").toString().toLowerCase().trim();

const FetchPosts = ({ refreshTrigger }) => {
  const navigate = useNavigate();
  const user = useAuthUser();

  const [posts, setPosts] = useState([]);
  const [expandedCommentsByPostId, setExpandedCommentsByPostId] = useState({});

  // "3 dots" menu state
  const [openMenuForPostId, setOpenMenuForPostId] = useState(null);
  const [openMenuForCommentId, setOpenMenuForCommentId] = useState(null);

  // Editing state
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostDraft, setEditingPostDraft] = useState({
    title: "",
    content: "",
  });
  const [postFieldErrors, setPostFieldErrors] = useState({
    title: "",
    content: "",
  });

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentDraft, setEditingCommentDraft] = useState("");
  const [commentFieldError, setCommentFieldError] = useState("");

  const [serverError, setServerError] = useState("");

  // ✅ Sort / Filter / Search controls
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | score | comments
  const [searchQuery, setSearchQuery] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all"); // all | mine
  const [scoreFilter, setScoreFilter] = useState("any"); // any | gte1 | gte5 | gte10

  // ✅ toggles: separate buttons for search + filters/sort
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const userId = useMemo(() => user?.id ?? null, [user]);
  const isOwn = (authorId) =>
    Boolean(userId && authorId && userId === authorId);

  const loadPosts = async () => {
    try {
      const data = await getNewestPosts();
      setPosts(data ?? []);
    } catch (err) {
      console.error("Failed loading posts:", err.message);
      setServerError(err?.message || "Failed loading posts.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    loadPosts();
  }, [refreshTrigger]);

  const startEditPost = (post) => {
    setServerError("");
    setPostFieldErrors({ title: "", content: "" });
    setOpenMenuForPostId(null);

    setEditingPostId(post.id);
    setEditingPostDraft({
      title: post.title ?? "",
      content: post.content ?? "",
    });
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditingPostDraft({ title: "", content: "" });
    setPostFieldErrors({ title: "", content: "" });
    setServerError("");
  };

  const saveEditPost = async (postId) => {
    setServerError("");

    const errs = validatePost(editingPostDraft);
    setPostFieldErrors({
      title: errs.title || "",
      content: errs.content || "",
    });

    if (Object.keys(errs).length > 0) return;

    try {
      await updatePost({
        postId,
        title: editingPostDraft.title.trim(),
        content: editingPostDraft.content.trim(),
      });

      cancelEditPost();
      await loadPosts();
    } catch (e) {
      const msg = e?.message || "Failed to update post.";

      const dbErrs = mapDbErrorToFields(msg);
      if (dbErrs.title || dbErrs.content) {
        setPostFieldErrors({
          title: dbErrs.title || "",
          content: dbErrs.content || "",
        });
      } else {
        setServerError(msg);
      }
    }
  };

  const confirmAndDeletePost = async (postId) => {
    setOpenMenuForPostId(null);
    setServerError("");

    const ok = window.confirm("Delete this post? This cannot be undone.");
    if (!ok) return;

    try {
      await deletePost({ postId });

      if (editingPostId === postId) cancelEditPost();

      await loadPosts();
    } catch (e) {
      setServerError(e?.message || "Failed to delete post.");
    }
  };

  const startEditComment = (comment) => {
    setServerError("");
    setCommentFieldError("");
    setOpenMenuForCommentId(null);

    setEditingCommentId(comment.id);
    setEditingCommentDraft(comment.content ?? "");
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentDraft("");
    setCommentFieldError("");
    setServerError("");
  };

  const saveEditComment = async (commentId) => {
    setServerError("");

    const trimmed = (editingCommentDraft ?? "").trim();
    if (!trimmed) {
      setCommentFieldError("Content required");
      return;
    }

    try {
      await updateComment({ commentId, content: trimmed });

      cancelEditComment();
      await loadPosts();
    } catch (e) {
      setServerError(e?.message || "Failed to update comment.");
    }
  };

  const confirmAndDeleteComment = async (commentId) => {
    setOpenMenuForCommentId(null);
    setServerError("");

    const ok = window.confirm("Delete this comment? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteComment({ commentId });

      if (editingCommentId === commentId) cancelEditComment();

      await loadPosts();
    } catch (e) {
      setServerError(e?.message || "Failed to delete comment.");
    }
  };

  const displayedPosts = useMemo(() => {
    const q = normalize(searchQuery);

    let list = (posts ?? []).slice();

    if (authorFilter === "mine") {
      list = list.filter((p) => Boolean(userId && p.author_id === userId));
    }

    if (scoreFilter !== "any") {
      const score = (p) => Number(p?.score ?? 0);
      const threshold =
        scoreFilter === "gte1"
          ? 1
          : scoreFilter === "gte10"
            ? 10
            : scoreFilter === "gte100"
              ? 100
              : 0;
      list = list.filter((p) => score(p) >= threshold);
    }

    if (q) {
      list = list.filter((p) => {
        const title = normalize(p.title);
        const content = normalize(p.content);
        const author = normalize(p.post_author?.username);
        return title.includes(q) || content.includes(q) || author.includes(q);
      });
    }

    const createdAt = (p) => new Date(p?.created_at ?? 0).getTime();
    const score = (p) => Number(p?.score ?? 0);
    const commentsCount = (p) => (p.comments ?? []).length;

    list.sort((a, b) => {
      if (sortBy === "newest") return createdAt(b) - createdAt(a);
      if (sortBy === "oldest") return createdAt(a) - createdAt(b);
      if (sortBy === "score") {
        const d = score(b) - score(a);
        return d !== 0 ? d : createdAt(b) - createdAt(a);
      }
      if (sortBy === "comments") {
        const d = commentsCount(b) - commentsCount(a);
        return d !== 0 ? d : createdAt(b) - createdAt(a);
      }
      return createdAt(b) - createdAt(a);
    });

    return list;
  }, [posts, searchQuery, sortBy, authorFilter, scoreFilter, userId]);

  const clearControls = () => {
    setSortBy("newest");
    setSearchQuery("");
    setAuthorFilter("all");
    setScoreFilter("any");
  };

  const hasActiveSearch = !!searchQuery.trim();
  const hasActiveFilters =
    sortBy !== "newest" || authorFilter !== "all" || scoreFilter !== "any";

  return (
    <Container className="py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="mb-0">Posts</h2>

        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant={showSearch || hasActiveSearch ? "primary" : "outline-primary"}
            onClick={() => setShowSearch((v) => !v)}
          >
            <i className="fa-solid fa-magnifying-glass me-2" />
            Search
          </Button>

          <Button
            size="sm"
            variant={
              showFilters || hasActiveFilters
                ? "primary"
                : "outline-primary"
            }
            onClick={() => setShowFilters((v) => !v)}
          >
            <i className="fa-solid fa-sliders me-2" />
            Filter & Sort
          </Button>
        </div>
      </div>

      {/* ✅ Search panel (separate) */}
      <Collapse in={showSearch}>
        <div className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
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

      {/* ✅ Filters/sort panel (separate) */}
      <Collapse in={showFilters}>
        <div className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
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
                  <Button
                    variant="outline-secondary"
                    onClick={clearControls}
                    size="sm"
                  >
                    Reset
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={loadPosts}
                    size="sm"
                  >
                    Refresh
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      </Collapse>

      {serverError && (
        <Alert variant="danger" className="py-2">
          {serverError}
        </Alert>
      )}

      {displayedPosts.length === 0 && (
        <Alert variant="secondary">No posts match your filters.</Alert>
      )}

      {displayedPosts.map((post) => {
        const ownPost = isOwn(post.author_id);

        const sortedComments = (post.comments ?? [])
          .slice()
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        const isExpanded = !!expandedCommentsByPostId[post.id];
        const visibleComments =
          sortedComments.length > 2 && !isExpanded
            ? sortedComments.slice(0, 2)
            : sortedComments;

        return (
          <Card key={post.id} className="mb-3 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2">
                    <AvatarFromStorage
                      pathOrUrl={post.post_author?.avatar_url}
                    />
                    <div>
                      <div className="fw-semibold">
                        {post.post_author?.username || "Unknown user"}
                      </div>
                      <div className="text-muted small">
                        {new Date(post.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {ownPost && (
                  <Dropdown
                    align="end"
                    show={openMenuForPostId === post.id}
                    onToggle={(nextShow) => {
                      if (nextShow) setOpenMenuForCommentId(null);
                      setOpenMenuForPostId(nextShow ? post.id : null);
                    }}
                  >
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      size="sm"
                      bsPrefix="btn"
                    >
                      <i
                        className="fa-solid fa-angle-down"
                        style={{
                          transition: "transform 0.25s ease",
                          transform:
                            openMenuForPostId === post.id
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                        }}
                      />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => startEditPost(post)}>
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="text-danger"
                        onClick={() => confirmAndDeletePost(post.id)}
                      >
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>

              <div className="mt-2">
                <Button
                  variant="link"
                  className="p-0 text-decoration-none"
                  onClick={() => navigate(`/posts/${post.id}`)}
                  title="Open post details"
                >
                  <span className="h5 mb-0 text-decoration-underline">
                    {post.title}
                  </span>
                </Button>
              </div>

              {editingPostId === post.id ? (
                <div className="mt-3">
                  <Form.Group className="mb-2">
                    <Form.Label className="small text-muted">Title</Form.Label>
                    <Form.Control
                      value={editingPostDraft.title}
                      onChange={(e) => {
                        setEditingPostDraft((d) => ({
                          ...d,
                          title: e.target.value,
                        }));
                        setPostFieldErrors((fe) => ({ ...fe, title: "" }));
                      }}
                      placeholder="Title"
                      isInvalid={!!postFieldErrors.title}
                    />
                    <Form.Control.Feedback type="invalid">
                      {postFieldErrors.title}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label className="small text-muted">
                      Content
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={editingPostDraft.content}
                      onChange={(e) => {
                        setEditingPostDraft((d) => ({
                          ...d,
                          content: e.target.value,
                        }));
                        setPostFieldErrors((fe) => ({ ...fe, content: "" }));
                      }}
                      placeholder="Content"
                      isInvalid={!!postFieldErrors.content}
                    />
                    <Form.Control.Feedback type="invalid">
                      {postFieldErrors.content}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button size="sm" onClick={() => saveEditPost(post.id)}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={cancelEditPost}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 mb-0">{post.content}</p>
              )}

              <div className="mt-3">
                <PostVotes postId={post.id} onVoted={loadPosts} />
              </div>

              <div className="mt-2 d-flex align-items-center justify-content-between">
                <Badge bg="secondary">Score: {Number(post.score ?? 0)}</Badge>
                <span className="text-muted small">
                  {post.comments?.length ?? 0} comments
                </span>
              </div>

              <div className="mt-3">
                <CreateComment postId={post.id} onCommentCreated={loadPosts} />
              </div>

              <div className="mt-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h4 className="h6 mb-0">Comments</h4>

                  {sortedComments.length > 2 && (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() =>
                        setExpandedCommentsByPostId((m) => ({
                          ...m,
                          [post.id]: !isExpanded,
                        }))
                      }
                    >
                      {isExpanded
                        ? "Hide"
                        : `Show all (${sortedComments.length})`}
                    </Button>
                  )}
                </div>

                {sortedComments.length === 0 && (
                  <div className="text-muted small">No comments yet</div>
                )}

                <ListGroup variant="flush">
                  {visibleComments.map((comment) => {
                    const ownComment = isOwn(comment.author_id);

                    return (
                      <ListGroup.Item key={comment.id} className="px-0">
                        <div className="d-flex align-items-start justify-content-between gap-2">
                          <div className="d-flex align-items-start gap-2">
                            <AvatarFromStorage
                              pathOrUrl={comment.comment_author?.avatar_url}
                            />
                            <div>
                              <div className="fw-semibold">
                                {comment.comment_author?.username ||
                                  "Unknown user"}
                              </div>

                              {editingCommentId === comment.id ? (
                                <div className="mt-2">
                                  <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={editingCommentDraft}
                                    onChange={(e) => {
                                      setEditingCommentDraft(e.target.value);
                                      setCommentFieldError("");
                                    }}
                                    placeholder="Edit comment"
                                    isInvalid={!!commentFieldError}
                                  />
                                  {commentFieldError && (
                                    <div className="text-danger small mt-1">
                                      {commentFieldError}
                                    </div>
                                  )}
                                  <div className="d-flex gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        saveEditComment(comment.id)
                                      }
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline-secondary"
                                      onClick={cancelEditComment}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-1">{comment.content}</div>
                              )}

                              <div className="text-muted small mt-1">
                                {new Date(comment.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {ownComment && (
                            <Dropdown
                              align="end"
                              show={openMenuForCommentId === comment.id}
                              onToggle={(nextShow) => {
                                if (nextShow) setOpenMenuForPostId(null);
                                setOpenMenuForCommentId(
                                  nextShow ? comment.id : null
                                );
                              }}
                            >
                              <Dropdown.Toggle
                                variant="outline-secondary"
                                size="sm"
                                bsPrefix="btn"
                              >
                                <i
                                  className="fa-solid fa-angle-down"
                                  style={{
                                    transition: "transform 0.25s ease",
                                    transform:
                                      openMenuForCommentId === comment.id
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                  }}
                                />
                              </Dropdown.Toggle>

                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() => startEditComment(comment)}
                                >
                                  Edit
                                </Dropdown.Item>
                                <Dropdown.Item
                                  className="text-danger"
                                  onClick={() =>
                                    confirmAndDeleteComment(comment.id)
                                  }
                                >
                                  Delete
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          )}
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </Container>
  );
};

export default FetchPosts;
