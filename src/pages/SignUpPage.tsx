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
      alert("?대찓?쇨낵 鍮꾨?踰덊샇瑜??낅젰?섏꽭??");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pw,
    });

    if (error) {
      alert("?뚯썝媛???ㅽ뙣: " + error.message);
      setLoading(false);
      return;
    }

    // profiles?먮룄 異붽?
    await supabase.from("profiles").insert({
      id: data.user?.id,
      email,
      role: "viewer",
    });

    setLoading(false);
    alert("?뚯썝媛???꾨즺! ?댁젣 濡쒓렇?명븯?몄슂.");
    navigate("/signin");
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="border rounded p-8 w-80 shadow-md flex flex-col gap-3">
        <h1 className="text-xl font-bold mb-3">?뚯썝媛??/h1>

        <input
          className="border rounded p-2"
          placeholder="?대찓??
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border rounded p-2"
          placeholder="鍮꾨?踰덊샇"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />

        <button
          className="bg-green-600 text-white py-2 rounded mt-2"
          onClick={signUp}
          disabled={loading}
        >
          {loading ? "泥섎━ 以?.." : "?뚯썝媛??}
        </button>

        <button
          className="text-sm underline text-gray-600"
          onClick={() => navigate("/signin")}
        >
          濡쒓렇?몄쑝濡??뚯븘媛湲?
        </button>
      </div>
    </div>
  );
}

