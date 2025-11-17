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
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <div className="w-full min-h-screen">
      <Navbar />

      <Routes>
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/auth/callback" element={<MagicLinkPage />} />

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
      </Routes>
    </div>
  );
}

