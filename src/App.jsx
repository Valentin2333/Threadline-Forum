import { Routes, Route } from "react-router-dom";
import AppNavbar from "./components/AppNavbar";
import AuthPage from "./components/AuthPage";
import UserProfile from "./components/UserProfile";

function App() {
  return (
    <>
      <AppNavbar />

      <Routes>
        <Route path="/" element={<div className="p-4">Welcome</div>} />
        <Route path="/posts" element={<div className="p-4">Posts page</div>} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
      </Routes>
    </>
  );
}

export default App;
