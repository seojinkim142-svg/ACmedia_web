import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function Navbar() {
  const location = useLocation();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setEmail(data.user.email);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/signin";
  };

  // 로그인 페이지(/signin, /signup)에서는 Navbar 숨김
  if (location.pathname === "/signin" || location.pathname === "/signup") {
    return null;
  }

  return (
    <nav className="w-full bg-gray-800 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-6 font-semibold">
        <Link to="/" className="hover:text-gray-300">
          Home
        </Link>

        <Link to="/tracker" className="hover:text-gray-300">
          Tracker
        </Link>

        <Link to="/feed" className="hover:text-gray-300">
          Feed
        </Link>

        <Link to="/upload" className="hover:text-gray-300">
          Upload
        </Link>

        <Link to="/database" className="hover:text-gray-300">
          Database
        </Link>

        <Link to="/admin-users" className="hover:text-gray-300">
          Admin
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {email && <span className="text-sm opacity-80">{email}</span>}
        <button
          onClick={logout}
          className="px-3 py-1 bg-indigo-500 rounded hover:bg-indigo-600 text-sm"
        >
          로그아웃
        </button>
      </div>
    </nav>
  );
}
