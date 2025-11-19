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

  // Navbar를 숨겨야 하는 경로 목록
  const hideNavbarRoutes = [
    "/signin",
    "/auth/callback",
    "/password-recovery",
  ];

  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="w-full min-h-screen">
      {showNavbar && <Navbar />}

      <Routes>
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/auth/callback" element={<MagicLinkPage />} />
        {/* 비로그인 상태에서 접근 가능한 PW 재설정용 페이지 */}
        <Route path="/password-recovery" element={<PasswordRecoveryPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/tracker" replace />} />
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/database" element={<DatabasePage />} />
          <Route path="/write" element={<WritePage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          {/* 로그인된 사용자 비밀번호 변경 페이지 */}
          <Route path="/settings/password" element={<ResetPassword />} />
        </Route>
      </Routes>
    </div>
  );
}
