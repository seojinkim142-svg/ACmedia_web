import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import TrackerPage from "./pages/TrackerPage";
import FeedPage from "./pages/FeedPage";
import UploadPage from "./pages/UploadPage";
import DatabasePage from "./pages/DatabasePage";
import WritePage from "./pages/WritePage";

// ★ 관리자 페이지 추가
import AdminUsersPage from "./pages/AdminUsersPage";

export default function App() {
  return (
    <div className="w-full min-h-screen">
      <Navbar />

      <Routes>
        <Route path="/" element={<TrackerPage />} />
        <Route path="/tracker" element={<TrackerPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/database" element={<DatabasePage />} />
        <Route path="/write" element={<WritePage />} />

        {/* ★ 관리자 페이지 경로 추가 */}
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Routes>
    </div>
  );
}
