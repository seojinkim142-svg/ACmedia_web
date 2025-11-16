import { useEffect, useState } from "react";

interface UserRow {
  id: string;
  email: string;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  // 새 유저 생성 입력값
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("viewer");

  const FUNCTION_BASE = import.meta.env.VITE_SUPABASE_URL.replace(
    ".supabase.co",
    ".functions.supabase.co"
  );

  // -------------------------------
  // 유저 목록 불러오기
  // -------------------------------
  const loadUsers = async () => {
    try {
      setLoading(true);

      const url = `${FUNCTION_BASE}/list-users`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();
      if (result.users) {
        // profiles의 role도 함께 가져온 상태라고 가정
        const formatted = result.users.map((u: any) => ({
          id: u.id,
          email: u.email,
          role: u.role ?? "viewer",
        }));
        setUsers(formatted);
      }
    } catch (err) {
      alert("유저 불러오기 오류: " + err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // -------------------------------
  // 유저 생성
  // -------------------------------
  const createUser = async () => {
    if (!newEmail || !newPassword) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    const res = await fetch(`${FUNCTION_BASE}/create-user`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: newEmail,
        password: newPassword,
        role: newRole,
      }),
    });

    const data = await res.json();

    if (data.error) {
      alert("유저 생성 실패: " + JSON.stringify(data.error));
      return;
    }

    alert("유저가 생성되었습니다.");
    setNewEmail("");
    setNewPassword("");
    setNewRole("viewer");
    loadUsers();
  };

  // -------------------------------
  // 역할 변경
  // -------------------------------
  const updateRole = async (userId: string, role: string) => {
    // profiles.role 수정
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ role }),
    });

    if (!res.ok) {
      alert("역할 수정 실패");
      return;
    }

    loadUsers();
  };

  // -------------------------------
  // 비밀번호 재설정
  // -------------------------------
  const resetPassword = async (userId: string) => {
    const newPass = prompt("새 비밀번호를 입력하세요:");
    if (!newPass) return;

    const res = await fetch(`${FUNCTION_BASE}/reset-password`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        new_password: newPass,
      }),
    });

    const data = await res.json();
    if (data.error) {
      alert("비밀번호 변경 실패: " + JSON.stringify(data.error));
      return;
    }

    alert("비밀번호가 변경되었습니다.");
  };

  // -------------------------------
  // 유저 삭제
  // -------------------------------
  const deleteUser = async (userId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const res = await fetch(`${FUNCTION_BASE}/delete-user`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
      }),
    });

    const data = await res.json();

    if (data.error) {
      alert("유저 삭제 실패: " + JSON.stringify(data.error));
      return;
    }

    alert("유저가 삭제되었습니다.");
    loadUsers();
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-4">관리자 - 유저 관리</h1>

      {/* ------------------------- */}
      {/* 새 유저 생성 섹션 */}
      {/* ------------------------- */}
      <div className="border rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">새 유저 생성</h2>

        <div className="flex flex-col gap-3 w-80">
          <input
            className="border rounded p-2"
            placeholder="이메일"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />

          <input
            className="border rounded p-2"
            type="password"
            placeholder="비밀번호"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <select
            className="border rounded p-2"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="admin">관리자</option>
            <option value="editor">에디터</option>
            <option value="viewer">뷰어</option>
          </select>

          <button
            className="bg-green-600 text-white py-2 rounded"
            onClick={createUser}
          >
            유저 생성
          </button>
        </div>
      </div>

      {/* ------------------------- */}
      {/* 유저 목록 */}
      {/* ------------------------- */}
      <h2 className="text-xl font-semibold mb-3">유저 목록</h2>

      {loading ? (
        <p>불러오는 중...</p>
      ) : (
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="py-2 px-3">ID</th>
              <th className="py-2 px-3">이메일</th>
              <th className="py-2 px-3">역할</th>
              <th className="py-2 px-3">비밀번호 변경</th>
              <th className="py-2 px-3">삭제</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="py-2 px-3">{u.id}</td>
                <td className="py-2 px-3">{u.email}</td>

                {/* 역할 수정 */}
                <td className="py-2 px-3">
                  <select
                    className="border rounded p-1"
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                  >
                    <option value="admin">관리자</option>
                    <option value="editor">에디터</option>
                    <option value="viewer">뷰어</option>
                  </select>
                </td>

                {/* 비밀번호 변경 */}
                <td className="py-2 px-3">
                  <button
                    className="text-blue-600 underline"
                    onClick={() => resetPassword(u.id)}
                  >
                    변경
                  </button>
                </td>

                {/* 삭제 */}
                <td className="py-2 px-3">
                  <button
                    className="text-red-600 underline"
                    onClick={() => deleteUser(u.id)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
