import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";

import TrackerPage from "./pages/TrackerPage";
import FeedPage from "./pages/FeedPage";
import UploadPage from "./pages/UploadPage";
import DatabasePage from "./pages/DatabasePage";
import WritePage from "./pages/WritePage";
import AdminUsersPage from "./pages/AdminUsersPage";
import LoginPage from "./pages/LoginPage";
import MagicLinkPage from "./pages/MagicLinkPage";
import ResetPassword from "./pages/ResetPassword";
import PasswordRecoveryPage from "./pages/PasswordRecoveryPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const location = useLocation();

  const hideNavbarRoutes = ["/signin", "/auth/callback", "/password-recovery"];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="w-full min-h-screen">
      {showNavbar && <Navbar />}

      <Routes location={location} key={location.pathname}>
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/auth/callback" element={<MagicLinkPage />} />
        <Route path="/password-recovery" element={<PasswordRecoveryPage />} />

        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Navigate to="/tracker" replace />} />
          <Route path="tracker" element={<TrackerPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="database" element={<DatabasePage />} />
          <Route path="write" element={<WritePage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
          <Route path="settings/password" element={<ResetPassword />} />
        </Route>
      </Routes>
    </div>
  );
}
