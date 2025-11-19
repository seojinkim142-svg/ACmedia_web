import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ResetPassword() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  const handleChangePassword = async () => {
    if (!userEmail) {
      setStatus("세션 정보를 찾지 못했습니다. 다시 로그인해 주세요.");
      return;
    }

    if (!currentPw || !newPw || !confirmPw) {
      setStatus("모든 필드를 입력하세요.");
      return;
    }

    if (newPw.length < 8) {
      setStatus("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (newPw !== confirmPw) {
      setStatus("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPw,
      });

      if (verifyError) {
        throw new Error("현재 비밀번호가 올바르지 않습니다.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPw,
      });

      if (updateError) {
        throw updateError;
      }

      setStatus("비밀번호가 성공적으로 변경되었습니다.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다.";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="border rounded p-8 w-96 shadow-md flex flex-col gap-4 bg-white">
        <h1 className="text-xl font-bold">비밀번호 변경</h1>
        <p className="text-sm text-gray-500">
          현재 비밀번호를 확인한 뒤 새 비밀번호로 교체합니다.
        </p>

        <input
          className="border rounded p-2"
          type="password"
          placeholder="현재 비밀번호"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
        />

        <input
          className="border rounded p-2"
          type="password"
          placeholder="새 비밀번호 (8자 이상)"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
        />

        <input
          className="border rounded p-2"
          type="password"
          placeholder="새 비밀번호 확인"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white py-2 rounded mt-2 disabled:opacity-60"
          onClick={handleChangePassword}
          disabled={loading}
        >
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>

        {status && <p className="text-sm text-red-600">{status}</p>}
      </div>
    </div>
  );
}

