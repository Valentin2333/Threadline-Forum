import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppNavigation from "./components/navigation/AppNavigation";
import AuthPage from "./components/auth/shared/AuthPage";
import UserProfile from "./components/userProfile/UserProfile";
import PublicProfile from "./components/userProfile/PublicProfile";
import CreatePostForm from "./components/posting/posts/CreatePostForm";
import FetchPosts from "./components/posting/posts/FetchPosts";
import PostDetails from "./components/posting/posts/PostDetails";
import PublicPostsView from "./components/posting/posts/PublicPostsView";
import AdminDashboard from "./components/admin/AdminDashboard";
import useAuthUser from "./components/navigation/hooks/useAuthUser";
import useAdminStatus from "./components/admin/hooks/useAdminStatus";

import HomePage from "./components/home/HomePage";

function App() {
  const user = useAuthUser();
  const { isAdmin } = useAdminStatus(user?.id);
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

          <Route
            path="/profile/:userId"
            element={user ? <PublicProfile /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/admin"
            element={
              user && isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />
            }
          />

          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;