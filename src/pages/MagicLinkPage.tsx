import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function MagicLinkPage() {
  const [message, setMessage] = useState("인증 중입니다...");
  const navigate = useNavigate();

  useEffect(() => {
    const completeLogin = async () => {
      if (!window.location.hash.includes("access_token")) {
        setMessage("유효하지 않은 로그인 링크입니다.");
        return;
      }

      const search = new URLSearchParams(window.location.hash.replace("#", ""));
      const access_token = search.get("access_token");
      const refresh_token = search.get("refresh_token");

      if (!access_token || !refresh_token) {
        setMessage("링크 토큰을 찾을 수 없습니다.");
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        setMessage("인증 실패: " + error.message);
        return;
      }

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      );

      setMessage("로그인이 완료되었습니다. 잠시 후 이동합니다...");
      setTimeout(() => navigate("/tracker", { replace: true }), 1500);
    };

    void completeLogin();
  }, [navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="border rounded p-8 w-96 shadow-md bg-white text-center">
        <p>{message}</p>
      </div>
    </div>
  );
}
