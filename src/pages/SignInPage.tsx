import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    if (!email || !pw) {
      alert("이메일과 비밀번호를 입력하세요.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pw,
    });

    setLoading(false);

    if (error) {
      alert("로그인 실패: " + error.message);
      return;
    }

    navigate("/tracker");
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="border rounded p-8 w-80 shadow-md flex flex-col gap-3">
        <h1 className="text-xl font-bold mb-3">로그인</h1>

        <input
          className="border rounded p-2"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border rounded p-2"
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white py-2 rounded mt-2"
          onClick={signIn}
          disabled={loading}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>

        <button
          className="text-sm underline text-gray-600"
          onClick={() => navigate("/signup")}
        >
          회원가입
        </button>
      </div>
    </div>
  );
}
