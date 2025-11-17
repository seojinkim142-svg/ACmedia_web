import { Routes, Route } from "react-router-dom";
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
  return (
    <div className="w-full min-h-screen">
      <Navbar />

      <Routes>
        {/* 로그인 */}
        <Route path="/signin" element={<LoginPage />} />

        {/* Supabase Auth Callback */}
        <Route path="/auth/callback" element={<MagicLinkPage />} />

        {/* 🔥 Supabase 비밀번호 재설정 이메일 전용 페이지 */}
        <Route path="/password-recovery" element={<PasswordRecoveryPage />} />

        {/* 메인 페이지 */}
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

        {/* 로그인된 사용자의 "설정 → 비밀번호 변경" */}
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
