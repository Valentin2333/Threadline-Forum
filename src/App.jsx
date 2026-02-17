import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import AppNavigation from "./components/navigation/AppNavigation";
import AuthPage from "./components/auth/shared/AuthPage";
import UserProfile from "./components/userProfile/UserProfile";
import CreatePostForm from "./components/posting/CreatePostForm";
import FetchPosts from "./components/posting/FetchPosts";
import PostDetails from "./components/posting/PostDetails";

import HomePage from "./components/home/HomePage";

function App() {
  const [refreshPosts, setRefreshPosts] = useState(0);

  const handlePostCreated = () => {
    setRefreshPosts((prev) => prev + 1);
  };

  return (
    <>
      <AppNavigation />

      <div className="fs-animate-in">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/posts"
            element={
              <div className="py-3">
                <CreatePostForm onPostCreated={handlePostCreated} />
                <FetchPosts refreshTrigger={refreshPosts} />
              </div>
            }
          />

          <Route path="/posts/:postId" element={<PostDetails />} />

          <Route path="/profile" element={<UserProfile />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
