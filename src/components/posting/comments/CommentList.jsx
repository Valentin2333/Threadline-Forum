import ListGroup from "react-bootstrap/ListGroup";
import CommentItem from "./CommentItem";

const CommentList = ({
  comments,
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
  if (comments.length === 0) {
    return (
      <div className="text-muted" style={{ fontSize: "0.8125rem" }}>
        No comments yet
      </div>
    );
  }

  return (
    <ListGroup variant="flush">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          userId={userId}
          isOwn={isOwn}
          canManage={canManage}
          editingCommentId={editingCommentId}
          editingCommentDraft={editingCommentDraft}
          setEditingCommentDraft={setEditingCommentDraft}
          commentFieldError={commentFieldError}
          setCommentFieldError={setCommentFieldError}
          onStartEdit={onStartEdit}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onDelete={onDelete}
          openMenuForCommentId={openMenuForCommentId}
          onToggleMenu={onToggleMenu}
          onMenuOpening={onMenuOpening}
          onReport={onReport}
        />
      ))}
    </ListGroup>
  );
};

export default CommentList;
