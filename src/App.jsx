import { Routes, Route } from "react-router-dom";
import AppNavigation from "./components/navigation/AppNavigation";
import AuthPage from "./components/auth/shared/AuthPage";
import UserProfile from "./components/userProfile/UserProfile";

function App() {
  return (
    <>
      <AppNavigation />

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
