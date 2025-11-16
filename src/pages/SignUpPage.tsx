import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    if (!email || !pw) {
      alert("이메일과 비밀번호를 입력하세요.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pw,
    });

    if (error) {
      alert("회원가입 실패: " + error.message);
      setLoading(false);
      return;
    }

    // profiles에도 추가
    await supabase.from("profiles").insert({
      id: data.user?.id,
      email,
      role: "viewer",
    });

    setLoading(false);
    alert("회원가입 완료! 이제 로그인하세요.");
    navigate("/signin");
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="border rounded p-8 w-80 shadow-md flex flex-col gap-3">
        <h1 className="text-xl font-bold mb-3">회원가입</h1>

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
          className="bg-green-600 text-white py-2 rounded mt-2"
          onClick={signUp}
          disabled={loading}
        >
          {loading ? "처리 중..." : "회원가입"}
        </button>

        <button
          className="text-sm underline text-gray-600"
          onClick={() => navigate("/signin")}
        >
          로그인으로 돌아가기
        </button>
      </div>
    </div>
  );
}
