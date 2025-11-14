import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-4 flex gap-6">
      <Link to="/tracker">트래커</Link>
      <Link to="/feed">피드</Link>
      <Link to="/upload">업로드/보류/중복</Link>
      <Link to="/database">데이터베이스</Link>
      <Link to="/write">글쓰기</Link>
    </nav>
  );
}
