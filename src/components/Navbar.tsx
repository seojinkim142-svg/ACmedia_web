import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const NAV_ITEMS = [
  { to: "/", label: "홈", end: true },
  { to: "/tracker", label: "트래커" },
  { to: "/feed", label: "피드" },
  { to: "/upload", label: "보관함" },
  { to: "/database", label: "데이터베이스" },
  { to: "/write", label: "작성하기" },
  { to: "/admin/users", label: "관리자" },
  { to: "/settings/password", label: "비밀번호 변경" },
];

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
    navigate("/signin");
  };

  const baseClass = "px-3 py-1 rounded";
  const activeClass = "bg-white text-black font-semibold";
  const normalClass = "hover:text-gray-300";

  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-4 flex gap-4 items-center flex-wrap">
      {NAV_ITEMS.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => (isActive ? `${baseClass} ${activeClass}` : `${baseClass} ${normalClass}`)}
        >
          {label}
        </NavLink>
      ))}

      <button
        className="ml-auto px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded text-sm font-semibold"
        onClick={handleLogout}
      >
        로그아웃
      </button>
    </nav>
  );
}
