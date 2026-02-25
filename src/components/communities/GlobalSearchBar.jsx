import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { globalSearch } from "../../api/communities";

import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";

const GlobalSearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ communities: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = query.trim();
    if (!q || q.length < 2) {
      setResults({ communities: [], posts: [] });
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await globalSearch(q);
        setResults(data);
        setShowDropdown(true);
      } catch {
        setResults({ communities: [], posts: [] });
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (type, item) => {
    setShowDropdown(false);
    setQuery("");
    if (type === "community") {
      navigate(`/community/${encodeURIComponent(item.name)}`);
    } else {
      navigate(`/posts/${item.id}`);
    }
  };

  const totalResults = results.communities.length + results.posts.length;

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", maxWidth: 500, width: "100%" }}
    >
      <InputGroup>
        <InputGroup.Text>
          {loading ? (
            <Spinner size="sm" style={{ width: 14, height: 14 }} />
          ) : (
            <i
              className="fa-solid fa-magnifying-glass"
              style={{ fontSize: 13 }}
            />
          )}
        </InputGroup.Text>
        <Form.Control
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (totalResults > 0) setShowDropdown(true);
          }}
          placeholder="Search communities and posts…"
          style={{ fontSize: "0.875rem" }}
        />
      </InputGroup>

      {showDropdown && totalResults > 0 && (
        <ListGroup
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1050,
            maxHeight: 400,
            overflowY: "auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            borderRadius: "0 0 var(--fs-radius-sm) var(--fs-radius-sm)",
          }}
        >
          {results.communities.length > 0 && (
            <>
              <ListGroup.Item
                className="py-1 px-3"
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "var(--fs-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Communities
              </ListGroup.Item>
              {results.communities.map((c) => (
                <ListGroup.Item
                  key={`c-${c.id}`}
                  action
                  onClick={() => handleSelect("community", c)}
                  className="d-flex align-items-center justify-content-between py-2"
                >
                  <div>
                    <i
                      className="fa-solid fa-users me-2"
                      style={{ fontSize: 11, color: "var(--fs-primary)" }}
                    />
                    <span
                      className="fw-semibold"
                      style={{ fontSize: "0.875rem" }}
                    >
                      {c.name}
                    </span>
                  </div>
                  <Badge bg="light" text="dark" style={{ fontSize: "0.7rem" }}>
                    {c.member_count} members
                  </Badge>
                </ListGroup.Item>
              ))}
            </>
          )}

          {results.posts.length > 0 && (
            <>
              <ListGroup.Item
                className="py-1 px-3"
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "var(--fs-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Posts
              </ListGroup.Item>
              {results.posts.map((p) => (
                <ListGroup.Item
                  key={`p-${p.id}`}
                  action
                  onClick={() => handleSelect("post", p)}
                  className="py-2"
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div style={{ minWidth: 0 }}>
                      <i
                        className="fa-solid fa-file-lines me-2"
                        style={{ fontSize: 11, color: "var(--fs-text-muted)" }}
                      />
                      <span style={{ fontSize: "0.875rem" }}>
                        {p.title?.length > 60
                          ? p.title.substring(0, 60) + "…"
                          : p.title}
                      </span>
                      {p.community?.name && (
                        <span
                          className="text-muted ms-2"
                          style={{ fontSize: "0.75rem" }}
                        >
                          in {p.community.name}
                        </span>
                      )}
                    </div>
                    <Badge
                      bg="secondary"
                      style={{ fontSize: "0.65rem", whiteSpace: "nowrap" }}
                    >
                      <i
                        className="fa-solid fa-arrow-up me-1"
                        style={{ fontSize: 8 }}
                      />
                      {p.score ?? 0}
                    </Badge>
                  </div>
                </ListGroup.Item>
              ))}
            </>
          )}
        </ListGroup>
      )}
    </div>
  );
};

export default GlobalSearchBar;
