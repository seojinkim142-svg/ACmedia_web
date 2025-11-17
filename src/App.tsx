import { Routes, Route, useLocation } from "react-router-dom";
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

  // Navbar를 보여주지 않을 경로 목록
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

        {/* 🔥 PW 재설정 이메일용 라우트 (로그인 필요 없음) */}
        <Route path="/password-recovery" element={<PasswordRecoveryPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <TrackerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tracker"
          element={
            <ProtectedRoute>
              <TrackerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/database"
          element={
            <ProtectedRoute>
              <DatabasePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/write"
          element={
            <ProtectedRoute>
              <WritePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        {/* 로그인된 유저용 비밀번호 변경 페이지 */}
        <Route
          path="/settings/password"
          element={
            <ProtectedRoute>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
