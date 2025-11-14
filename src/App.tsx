import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import TrackerPage from "./pages/TrackerPage";
import FeedPage from "./pages/FeedPage";
import UploadPage from "./pages/UploadPage";
import DatabasePage from "./pages/DatabasePage";
import WritePage from "./pages/WritePage";

export default function App() {
  return (
    <div className="p-6">
      <Navbar />

      <Routes>
        <Route path="/" element={<TrackerPage />} />
        <Route path="/tracker" element={<TrackerPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/database" element={<DatabasePage />} />
        <Route path="/write" element={<WritePage />} />
      </Routes>
    </div>
  );
}
