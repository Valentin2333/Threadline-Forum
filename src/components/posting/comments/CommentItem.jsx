import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import AvatarFromStorage from "../posts/AvatarFromStorage";
import ContentActionMenu from "../../shared/ContentActionMenu";

const CommentItem = ({
  comment,
  userId,
  isOwn,
  canManage,
  editingCommentId,
  editingCommentDraft,
  setEditingCommentDraft,
  commentFieldError,
  setCommentFieldError,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  openMenuForCommentId,
  onToggleMenu,
  onMenuOpening,
  onReport,
}) => {
  const showCommentMenu = Boolean(userId);

  return (
    <ListGroup.Item className="px-0">
      <div className="d-flex align-items-start justify-content-between gap-2">
        <div className="d-flex align-items-start gap-2" style={{ minWidth: 0 }}>
          <Link
            to={`/profile/${comment.author_id}`}
            className="text-decoration-none"
          >
            <AvatarFromStorage pathOrUrl={comment.comment_author?.avatar_url} />
          </Link>
          <div style={{ minWidth: 0 }}>
            <Link
              to={`/profile/${comment.author_id}`}
              className="fs-author-name-link d-block text-truncate"
              title={comment.comment_author?.username || "Unknown user"}
            >
              {comment.comment_author?.username || "Unknown user"}
            </Link>

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
                  <Button size="sm" onClick={() => onSaveEdit(comment.id)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={onCancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="mt-1"
                style={{
                  color: "var(--fs-text-secondary)",
                  fontSize: "0.9375rem",
                }}
              >
                {comment.content}
              </div>
            )}

            <div className="fs-timestamp mt-1">
              {new Date(comment.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {showCommentMenu && (
          <ContentActionMenu
            show={openMenuForCommentId === comment.id}
            onToggle={(nextShow) => {
              if (nextShow) onMenuOpening?.();
              onToggleMenu(nextShow ? comment.id : null);
            }}
            showEdit={isOwn(comment.author_id)}
            showDelete={canManage(comment.author_id)}
            showReport={!isOwn(comment.author_id)}
            onEdit={() => onStartEdit(comment)}
            onDelete={() => onDelete(comment.id)}
            onReport={() => {
              onToggleMenu(null);
              onReport?.(comment.id);
            }}
          />
        )}
      </div>
    </ListGroup.Item>
  );
};

export default CommentItem;