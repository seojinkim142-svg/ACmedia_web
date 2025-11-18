import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/tracker" && (location.pathname === "/" || location.pathname === "")) {
      return true;
    }
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  const linkClass = (path: string) =>
    `px-3 py-1 rounded ${
      isActive(path) ? "bg-white text-black font-semibold" : "hover:text-gray-300"
    }`;

  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-4 flex gap-4 items-center flex-wrap">
      <Link to="/tracker" className={linkClass("/tracker")}>
        트래커
      </Link>
      <Link to="/feed" className={linkClass("/feed")}>
        피드
      </Link>
      <Link to="/upload" className={linkClass("/upload")}>
        업로드
      </Link>
      <Link to="/database" className={linkClass("/database")}>
        데이터베이스
      </Link>
      <Link to="/write" className={linkClass("/write")}>
        작성기
      </Link>
      <Link to="/admin/users" className={linkClass("/admin/users")}>
        관리자
      </Link>
      <Link to="/settings/password" className={linkClass("/settings/password")}>
        비밀번호 변경
      </Link>
      <button
        className="ml-auto px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded text-sm font-semibold"
        onClick={handleLogout}
      >
        로그아웃
      </button>
    </nav>
  );
}
