import { Routes, Route, Navigate } from "react-router-dom";
import AppNavigation from "./components/navigation/AppNavigation";
import AuthPage from "./components/auth/shared/AuthPage";
import UserProfile from "./components/userProfile/UserProfile";
import PublicProfile from "./components/userProfile/PublicProfile";
import Feed from "./components/posting/posts/Feed";
import PostDetails from "./components/posting/posts/PostDetails";
import PublicPostsView from "./components/posting/posts/PublicPostsView";
import AdminDashboard from "./components/admin/AdminDashboard";
import CommunityList from "./components/communities/CommunityList";
import CommunityPage from "./components/communities/CommunityPage";
import MyCommunities from "./components/communities/MyCommunities";
import useAuthUser from "./hooks/useAuthUser";
import useAdminStatus from "./components/admin/hooks/useAdminStatus";

import HomePage from "./components/home/HomePage";
import Footer from "./components/footer/Footer";
import FAQ from "./components/footer/FAQ";
import TermsAndConditions from "./components/footer/TermsAndConditions";
import PrivacyPolicy from "./components/footer/PrivacyPolicy";
import ContactUs from "./components/footer/ContactUs";

import Spinner from "react-bootstrap/Spinner";

function App() {
  const { user, loadingUser } = useAuthUser();
  const { isAdmin, loading: loadingAdmin } = useAdminStatus(user?.id);

  if (loadingUser) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <AppNavigation />
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
          <Spinner
            animation="border"
            role="status"
            style={{ color: "var(--fs-primary)" }}
          >
            <span className="visually-hidden">Loading…</span>
          </Spinner>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavigation />

      <div className="fs-animate-in flex-grow-1">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/feed"
            element={
              user ? (
                <div className="py-3">
                  <Feed />
                </div>
              ) : (
                <PublicPostsView />
              )
            }
          />

          <Route path="/posts" element={<Navigate to="/feed" replace />} />

          <Route
            path="/posts/:postId"
            element={user ? <PostDetails /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/communities"
            element={
              user ? <CommunityList /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/my-communities"
            element={
              user ? <MyCommunities /> : <Navigate to="/login" replace />
            }
          />
          
          <Route
            path="/community/:communityName"
            element={
              user ? <CommunityPage /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/profile"
            element={user ? <UserProfile /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/profile/:userId"
            element={
              user ? <PublicProfile /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/admin"
            element={
              loadingAdmin ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <Spinner
                    animation="border"
                    style={{ color: "var(--fs-primary)" }}
                  />
                </div>
              ) : user && isAdmin ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
