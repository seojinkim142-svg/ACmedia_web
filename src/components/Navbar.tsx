import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-4 flex gap-6">
      <Link
        to="/tracker"
        className={`px-3 py-1 rounded ${
          isActive("/tracker")
            ? "bg-white text-black font-semibold"
            : "hover:text-gray-300"
        }`}
      >
        트래커
      </Link>

      <Link
        to="/feed"
        className={`px-3 py-1 rounded ${
          isActive("/feed")
            ? "bg-white text-black font-semibold"
            : "hover:text-gray-300"
        }`}
      >
        피드
      </Link>

      <Link
        to="/upload"
        className={`px-3 py-1 rounded ${
          isActive("/upload")
            ? "bg-white text-black font-semibold"
            : "hover:text-gray-300"
        }`}
      >
        업로드
      </Link>

      <Link
        to="/database"
        className={`px-3 py-1 rounded ${
          isActive("/database")
            ? "bg-white text-black font-semibold"
            : "hover:text-gray-300"
        }`}
      >
        데이터베이스
      </Link>

      <Link
        to="/write"
        className={`px-3 py-1 rounded ${
          isActive("/write")
            ? "bg-white text-black font-semibold"
            : "hover:text-gray-300"
        }`}
      >
        글쓰기
      </Link>

      {/* 관리자 메뉴 */}
      <Link
        to="/admin/users"
        className={`px-3 py-1 rounded ${
          isActive("/admin/users")
            ? "bg-white text-black font-semibold"
            : "hover:text-gray-300"
        }`}
      >
        관리자
      </Link>

      <Link
        to="/settings/password"
        className={`px-3 py-1 rounded ${
          isActive("/settings/password")
            ? "bg-white text-black font-semibold"
            : "hover:text-gray-300"
        }`}
      >
        비밀번호 변경
      </Link>
    </nav>
  );
}
