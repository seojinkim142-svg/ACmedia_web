import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function PasswordRecoveryPage() {
  const navigate = useNavigate();
  const [sessionReady, setSessionReady] = useState(false);
  const [status, setStatus] = useState("링크를 확인하는 중입니다...");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const absorbRecoveryToken = async () => {
      if (!window.location.hash.includes("type=recovery")) {
        setStatus("유효하지 않은 비밀번호 재설정 링크입니다.");
        setSessionReady(false);
        return;
      }

      const { error } = await supabase.auth.getSessionFromUrl({
        storeSession: true,
      });

      if (error) {
        setStatus("링크 처리 중 오류가 발생했습니다: " + error.message);
        setSessionReady(false);
        return;
      }

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      );

      setStatus("새 비밀번호를 입력하세요.");
      setSessionReady(true);
    };

    void absorbRecoveryToken();
  }, []);

  const handleUpdatePassword = async () => {
    if (!sessionReady) return;

    if (!newPassword || !confirmPassword) {
      setStatus("새 비밀번호와 확인을 모두 입력하세요.");
      return;
    }

    if (newPassword.length < 8) {
      setStatus("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setUpdating(true);
    setStatus("");

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setStatus("비밀번호를 변경하지 못했습니다: " + error.message);
      setUpdating(false);
      return;
    }

    setStatus("비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.");
    setNewPassword("");
    setConfirmPassword("");
    setUpdating(false);
    setTimeout(() => navigate("/signin", { replace: true }), 1500);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="border rounded p-8 w-96 shadow-md flex flex-col gap-4 bg-white">
        <h1 className="text-xl font-bold">비밀번호 재설정</h1>
        <p className="text-sm text-gray-500">{status}</p>

        {sessionReady && (
          <>
            <input
              className="border rounded p-2"
              type="password"
              placeholder="새 비밀번호 (8자 이상)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              className="border rounded p-2"
              type="password"
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              className="bg-blue-600 text-white py-2 rounded disabled:opacity-60"
              onClick={handleUpdatePassword}
              disabled={updating}
            >
              {updating ? "변경 중..." : "비밀번호 변경"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

