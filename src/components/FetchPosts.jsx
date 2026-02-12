import { useEffect, useState } from "react";
import { getNewestPosts } from "../api/posts";

const FetchPosts = ({ refreshTrigger }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    loadPosts();
  }, [refreshTrigger]);

  async function loadPosts() {
    const data = await getNewestPosts();
    setPosts(data);
  }

  return (
    <div>
      <h2>Latest Posts</h2>

      {posts.map((post) => (
        <div key={post.id} style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
};

export default FetchPosts;
