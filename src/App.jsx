import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppNavigation from "./components/navigation/AppNavigation";
import AuthPage from "./components/auth/shared/AuthPage";
import UserProfile from "./components/userProfile/UserProfile";
import CreatePostForm from "./components/posting/CreatePostForm";
import FetchPosts from "./components/posting/FetchPosts";
import PostDetails from "./components/posting/PostDetails";
import PublicPostsView from "./components/posting/PublicPostsView";
import useAuthUser from "./components/navigation/hooks/useAuthUser";

import HomePage from "./components/home/HomePage";

function App() {
  const user = useAuthUser();
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
              user ? (
                <div className="py-3">
                  <CreatePostForm onPostCreated={handlePostCreated} />
                  <FetchPosts refreshTrigger={refreshPosts} />
                </div>
              ) : (
                <PublicPostsView />
              )
            }
          />

          <Route
            path="/posts/:postId"
            element={user ? <PostDetails /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/profile"
            element={user ? <UserProfile /> : <Navigate to="/login" replace />}
          />

          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;