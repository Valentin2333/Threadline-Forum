import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import { supabase } from "../../api/supabaseClient";
import { getReports, markReportReviewed, subscribeToReportChanges } from "../../api/reports";

const REASON_BADGES = {
  harassment: { bg: "warning", icon: "fa-solid fa-hand" },
  violence: { bg: "danger", icon: "fa-solid fa-burst" },
  hate: { bg: "dark", icon: "fa-solid fa-ban" },
};

const POLL_INTERVAL = 10000;

const AdminReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pollRef = useRef(null);

  const load = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setError("");
      const data = await getReports({ limit: 100 });
      setReports(data);
    } catch (e) {
      if (!silent) setError(e?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    // Realtime: refresh list on any INSERT or UPDATE on reports table
    const channel = subscribeToReportChanges(() => {
      load({ silent: true });
    });

    // Polling fallback
    pollRef.current = setInterval(() => load({ silent: true }), POLL_INTERVAL);

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [load]);

  const handleOpen = async (report) => {
    if (!report.is_reviewed) {
      try {
        await markReportReviewed(report.id);
        setReports((prev) =>
          prev.map((r) =>
            r.id === report.id ? { ...r, is_reviewed: true } : r
          )
        );
      } catch {
        // still navigate even if marking fails
      }
    }

    if (report.post_id) {
      navigate(`/posts/${report.post_id}`);
    } else if (report.comment_id) {
      const parentPostId = report.comment?.post_id;
      if (parentPostId) {
        navigate(`/posts/${parentPostId}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 text-muted py-3">
        <Spinner size="sm" />
        <span>Loading reports…</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="py-2">
        {error}
      </Alert>
    );
  }

  if (reports.length === 0) {
    return (
      <Alert variant="secondary">
        <i className="fa-solid fa-check-circle me-2" />
        No reports to review.
      </Alert>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover className="align-middle">
        <thead>
          <tr>
            <th style={{ width: 40 }} />
            <th>Type</th>
            <th>Reason</th>
            <th>Reported by</th>
            <th>Date</th>
            <th style={{ width: 130 }} />
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => {
            const reasonInfo = REASON_BADGES[r.reason] || {
              bg: "secondary",
              icon: "fa-solid fa-circle-exclamation",
            };
            return (
              <tr
                key={r.id}
                style={{ opacity: r.is_reviewed ? 0.55 : 1 }}
              >
                <td>
                  {!r.is_reviewed && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: "var(--bs-danger)",
                      }}
                    />
                  )}
                </td>
                <td>
                  {r.post_id ? (
                    <Badge bg="primary" className="text-uppercase" style={{ fontSize: 11 }}>
                      <i className="fa-solid fa-newspaper me-1" style={{ fontSize: 10 }} />
                      Post
                    </Badge>
                  ) : (
                    <Badge bg="info" className="text-uppercase" style={{ fontSize: 11 }}>
                      <i className="fa-regular fa-comment me-1" style={{ fontSize: 10 }} />
                      Comment
                    </Badge>
                  )}
                </td>
                <td>
                  <Badge bg={reasonInfo.bg} style={{ fontSize: 11 }}>
                    <i className={`${reasonInfo.icon} me-1`} style={{ fontSize: 10 }} />
                    {r.reason}
                  </Badge>
                </td>
                <td style={{ fontSize: "0.875rem" }}>
                  {r.reporter?.username || "Unknown"}
                </td>
                <td style={{ fontSize: "0.8125rem" }} className="text-muted">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td>
                  <Button
                    size="sm"
                    variant={r.is_reviewed ? "outline-secondary" : "outline-primary"}
                    onClick={() => handleOpen(r)}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square me-1" style={{ fontSize: 11 }} />
                    {r.is_reviewed ? "View" : "Open"}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminReports;