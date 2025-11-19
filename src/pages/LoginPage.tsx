import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signIn = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      alert("이메일과 비밀번호를 모두 입력하세요.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      // 1) 기본 로그인 시도
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (signInError) throw signInError;

      const user = signInData.user;

      // 2) 로그인 후 해당 프로필이 존재하는지 확인 (권한 검증)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile) {
        setStatus("승인된 계정만 로그인할 수 있습니다.");
        return;
      }

      // 3) 정상 로그인 후 트래커로 이동
      navigate("/tracker");
    } catch (err) {
      setStatus(`로그인 실패: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="border rounded p-8 w-96 shadow-md flex flex-col gap-4 bg-white">
        <h1 className="text-xl font-bold">팀 계정 로그인</h1>
        <p className="text-sm text-gray-500">
          관리자에게 발급받은 이메일과 비밀번호로 로그인하세요.
        </p>

        <input
          className="border rounded p-2"
          placeholder="회사 이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border rounded p-2"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white py-2 rounded mt-2 disabled:opacity-60"
          onClick={signIn}
          disabled={loading}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>

        {status && <p className="text-sm text-red-600">{status}</p>}
      </div>
    </div>
  );
}
