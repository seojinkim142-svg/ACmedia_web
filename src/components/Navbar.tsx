import { NavLink, useLocation, useNavigate } from "react-router-dom";
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

  const NavLinkClass = (path: string) =>
    `px-3 py-1 rounded ${
      isActive(path) ? "bg-white text-black font-semibold" : "hover:text-gray-300"
    }`;

  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-4 flex gap-4 items-center flex-wrap">
      <NavLink to="/tracker" className={NavLinkClass("/tracker")}>
        트래커
      </NavLink>
      <NavLink to="/feed" className={NavLinkClass("/feed")}>
        피드
      </NavLink>
      <NavLink to="/upload" className={NavLinkClass("/upload")}>
        업로드
      </NavLink>
      <NavLink to="/database" className={NavLinkClass("/database")}>
        데이터베이스
      </NavLink>
      <NavLink to="/write" className={NavLinkClass("/write")}>
        작성기
      </NavLink>
      <NavLink to="/admin/users" className={NavLinkClass("/admin/users")}>
        관리자
      </NavLink>
      <NavLink to="/settings/password" className={NavLinkClass("/settings/password")}>
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
