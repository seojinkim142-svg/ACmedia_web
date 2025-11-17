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

      const { error } = await supabase.auth.getSessionFromUrl({
        storeSession: true,
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
