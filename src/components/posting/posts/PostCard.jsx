import { Link, useNavigate } from "react-router-dom";

import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Dropdown from "react-bootstrap/Dropdown";

import AvatarFromStorage from "./AvatarFromStorage";
import PostEditForm from "./PostEditForm";
import PostVotes from "./PostVotes";
import CreateComment from "../comments/CreateComment";
import CommentList from "../comments/CommentList";

const PostCard = ({
  post,
  isOwn,
  canManage,
  isMember = false,
  // post editing
  editingPostId,
  editingPostDraft,
  setEditingPostDraft,
  postFieldErrors,
  setPostFieldErrors,
  onStartEditPost,
  onSaveEditPost,
  onCancelEditPost,
  // post actions
  onDeletePost,
  onVoted,
  // comment editing
  editingCommentId,
  editingCommentDraft,
  setEditingCommentDraft,
  commentFieldError,
  setCommentFieldError,
  onStartEditComment,
  onSaveEditComment,
  onCancelEditComment,
  onDeleteComment,
  openMenuForCommentId,
  onToggleCommentMenu,
  // post menu
  openMenuForPostId,
  onTogglePostMenu,
  onCloseCommentMenu,
  // comments expand
  isExpanded,
  onToggleExpand,
}) => {
  const navigate = useNavigate();
  const showPostMenu = canManage(post.author_id);

  const sortedComments = (post.comments ?? [])
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const visibleComments =
    sortedComments.length > 2 && !isExpanded
      ? sortedComments.slice(0, 2)
      : sortedComments;

  return (
    <Card className="mb-3 fs-post-card">
      <Card.Body className="p-4">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2">
              <Link
                to={`/profile/${post.author_id}`}
                className="text-decoration-none"
              >
                <AvatarFromStorage pathOrUrl={post.post_author?.avatar_url} />
              </Link>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <Link
                    to={`/profile/${post.author_id}`}
                    className="fs-author-name-link"
                  >
                    {post.post_author?.username || "Unknown user"}
                  </Link>
                  {post.community?.name && (
                    <Link
                      to={`/community/${encodeURIComponent(post.community.name)}`}
                      className="text-decoration-none"
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--fs-primary)",
                      }}
                    >
                      <i
                        className="fa-solid fa-users me-1"
                        style={{ fontSize: 9 }}
                      />
                      {post.community.name}
                    </Link>
                  )}
                </div>
                <div className="fs-timestamp">
                  {new Date(post.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {showPostMenu && (
            <Dropdown
              align="end"
              show={openMenuForPostId === post.id}
              onToggle={(nextShow) => {
                if (nextShow) onCloseCommentMenu();
                onTogglePostMenu(nextShow ? post.id : null);
              }}
            >
              <Dropdown.Toggle
                variant="outline-secondary"
                size="sm"
                bsPrefix="btn"
                className="fs-menu-toggle"
              >
                <i
                  className="fa-solid fa-ellipsis-vertical"
                  style={{ fontSize: 13 }}
                />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {isOwn(post.author_id) && (
                  <Dropdown.Item onClick={() => onStartEditPost(post)}>
                    <i
                      className="fa-solid fa-pen me-2"
                      style={{ fontSize: 12 }}
                    />
                    Edit
                  </Dropdown.Item>
                )}
                <Dropdown.Item
                  className="text-danger"
                  onClick={() => onDeletePost(post.id)}
                >
                  <i
                    className="fa-solid fa-trash me-2"
                    style={{ fontSize: 12 }}
                  />
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>

        <div className="mt-3">
          <Button
            variant="link"
            className="p-0 fs-post-title"
            onClick={() => navigate(`/posts/${post.id}`)}
            title="Open post details"
          >
            <span className="h5 mb-0">{post.title}</span>
          </Button>
        </div>

        {editingPostId === post.id ? (
          <PostEditForm
            draft={editingPostDraft}
            setDraft={setEditingPostDraft}
            fieldErrors={postFieldErrors}
            setFieldErrors={setPostFieldErrors}
            onSave={() => onSaveEditPost(post.id)}
            onCancel={onCancelEditPost}
          />
        ) : (
          <p
            className="mt-2 mb-0"
            style={{ color: "var(--fs-text-secondary)", lineHeight: 1.6 }}
          >
            {post.content}
          </p>
        )}

        <div className="mt-3">
          <PostVotes postId={post.id} onVoted={onVoted} isMember={isMember} />
        </div>

        <div className="mt-3 d-flex align-items-center justify-content-between">
          <Badge className="fs-score-badge">
            <i className="fa-solid fa-arrow-up me-1" style={{ fontSize: 10 }} />
            {Number(post.score ?? 0)} points
          </Badge>
          <span className="text-muted" style={{ fontSize: "0.8125rem" }}>
            <i className="fa-regular fa-comment me-1" />
            {post.comments?.length ?? 0} comments
          </span>
        </div>

        <div className="mt-3">
          <CreateComment
            postId={post.id}
            onCommentCreated={onVoted}
            isMember={isMember}
          />
        </div>

        <div className="mt-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h4
              className="h6 mb-0"
              style={{ color: "var(--fs-text-secondary)" }}
            >
              <i
                className="fa-regular fa-comments me-2"
                style={{ fontSize: 14 }}
              />
              Comments
            </h4>

            {sortedComments.length > 2 && (
              <Button
                size="sm"
                variant="outline-primary"
                onClick={onToggleExpand}
              >
                {isExpanded ? "Hide" : `Show all (${sortedComments.length})`}
              </Button>
            )}
          </div>

          <CommentList
            comments={visibleComments}
            isOwn={isOwn}
            canManage={canManage}
            editingCommentId={editingCommentId}
            editingCommentDraft={editingCommentDraft}
            setEditingCommentDraft={setEditingCommentDraft}
            commentFieldError={commentFieldError}
            setCommentFieldError={setCommentFieldError}
            onStartEdit={onStartEditComment}
            onSaveEdit={onSaveEditComment}
            onCancelEdit={onCancelEditComment}
            onDelete={onDeleteComment}
            openMenuForCommentId={openMenuForCommentId}
            onToggleMenu={onToggleCommentMenu}
            onMenuOpening={() => onTogglePostMenu(null)}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default PostCard;
