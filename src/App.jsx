import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import AppNavbar from "./components/AppNavbar";
import AuthPage from "./components/AuthPage";
import UserProfile from "./components/UserProfile";
import CreatePostForm from "./components/CreatePostForm";
import FetchPosts from "./components/FetchPosts";

function App() {
  const [refreshPosts, setRefreshPosts] = useState(0);

  const handlePostCreated = () => {
    setRefreshPosts((prev) => prev + 1);
  };

  return (
    <>
      <AppNavbar />

      <Routes>
        <Route path="/" element={<div className="p-4">Welcome</div>} />
        <Route path="/posts" element={
            <div className="p-4">
              <CreatePostForm onPostCreated={handlePostCreated} />
              <FetchPosts refreshTrigger={refreshPosts} />
            </div>
          } 
        />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
      </Routes>
    </>
  );
}

export default App;
