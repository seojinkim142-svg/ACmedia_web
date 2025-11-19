import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // "/" 로 들어오면 자동으로 "/tracker" 활성 표시되도록 강제 처리
  const effectivePath = location.pathname === "/" ? "/tracker" : location.pathname;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("로그아웃 오류:", err);
    }
    navigate("/signin");
  };

  const baseClass = "px-3 py-1 rounded";
  const activeClass = "bg-white text-black font-semibold";
  const normalClass = "hover:text-gray-300";

  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-4 flex gap-4 items-center flex-wrap">
      <NavLink
        to="/tracker"
        className={effectivePath === "/tracker" ? `${baseClass} ${activeClass}` : `${baseClass} ${normalClass}`}
      >
        트래커
      </NavLink>

      <NavLink
        to="/feed"
        className={effectivePath === "/feed" ? `${baseClass} ${activeClass}` : `${baseClass} ${normalClass}`}
      >
        피드
      </NavLink>

      <NavLink
        to="/upload"
        className={effectivePath === "/upload" ? `${baseClass} ${activeClass}` : `${baseClass} ${normalClass}`}
      >
        업로드
      </NavLink>

      <NavLink
        to="/database"
        className={effectivePath === "/database" ? `${baseClass} ${activeClass}` : `${baseClass} ${normalClass}`}
      >
        데이터베이스
      </NavLink>

      <NavLink
        to="/write"
        className={effectivePath === "/write" ? `${baseClass} ${activeClass}` : `${baseClass} ${normalClass}`}
      >
        작성하기
      </NavLink>

      <NavLink
        to="/admin/users"
        className={effectivePath === "/admin/users" ? `${baseClass} ${activeClass}` : `${baseClass} ${normalClass}`}
      >
        관리자
      </NavLink>

      <NavLink
        to="/settings/password"
        className={effectivePath === "/settings/password" ? `${baseClass} ${activeClass}` : `${baseClass} ${normalClass}`}
      >
        비밀번호 변경
      </NavLink>

      <button
        className="ml-auto px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded text-sm font-semibold"
        onClick={handleLogout}
      >
        로그아웃
      </button>
    </nav>
  );
}

