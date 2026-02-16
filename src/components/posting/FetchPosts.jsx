import { useEffect, useState } from "react";
import { getNewestPosts } from "../../api/posts";
import CreateComment from "../posting/CreateComment";
import AvatarFromStorage from "./AvatarFromStorage";


const FetchPosts = ({ refreshTrigger }) => {
  const [posts, setPosts] = useState([]);
  const [openCommentForPostId, setOpenCommentForPostId] = useState(null);

  const loadPosts = async () => {
    try {
      const data = await getNewestPosts();
      setPosts(data ?? []);
    } catch (err) {
      console.error("Failed loading posts:", err.message);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [refreshTrigger]);

  const toggleCommentForm = (postId) => {
    setOpenCommentForPostId((current) => (current === postId ? null : postId));
  };

  return (
    <div>
      <h2>Latest Posts</h2>

      {posts.length === 0 && <p>No posts yet</p>}

      {posts.map((post) => (
        <div
          key={post.id}
          style={{
            border: "1px solid gray",
            margin: 10,
            padding: 10,
            borderRadius: 6,
          }}
        >
          <h3>{post.title}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <AvatarFromStorage pathOrUrl={post.post_author?.avatar_url} />
            <b>{post.post_author?.username || "Unknown user"}</b>
          </div>

          <p>{post.content}</p>

          {/* Add comment button */}
          <button onClick={() => toggleCommentForm(post.id)}>
            {openCommentForPostId === post.id ? "Close" : "Add comment"}
          </button>

          {/* Comment form (toggles) */}
          {openCommentForPostId === post.id && (
            <CreateComment
              postId={post.id}
              onCommentCreated={loadPosts}
              onCancel={() => setOpenCommentForPostId(null)}
            />
          )}

          {/* Comments list */}
          <div style={{ marginTop: 15 }}>
            <h4>Comments</h4>

            {(post.comments ?? []).length === 0 && (
              <p style={{ color: "#777" }}>No comments yet</p>
            )}

            {(post.comments ?? [])
              .slice()
              .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
              .map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    marginLeft: 20,
                    borderLeft: "3px solid #ccc",
                    paddingLeft: 10,
                    marginBottom: 10,
                  }}
                >
                  {/* AUTHOR */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <AvatarFromStorage pathOrUrl={comment.comment_author?.avatar_url} />
                    <b>{comment.comment_author?.username || "Unknown user"}</b>
                  </div>

                  {/* COMMENT TEXT */}
                  <div>{comment.content}</div>

                  {/* DATE */}
                  <small style={{ color: "#888" }}>
                    {new Date(comment.created_at).toLocaleString()}
                  </small>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FetchPosts;
