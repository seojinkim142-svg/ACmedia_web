import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface UserRow {
  id: string;
  email: string;
  role: string;
  displayName: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const FUNCTION_BASE = SUPABASE_URL.replace(
  ".supabase.co",
  ".functions.supabase.co"
);

const DISPLAY_NAMES = ["지민", "지안", "아라", "서진"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("viewer");
  const [creatingUser, setCreatingUser] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,role")
        .order("email", { ascending: true });

      if (error) throw error;

      setUsers(
        (data ?? []).map((row, index) => ({
          id: row.id,
          email: row.email ?? "",
          role: row.role ?? "viewer",
          displayName: DISPLAY_NAMES[index % DISPLAY_NAMES.length],
        }))
      );
    } catch (err) {
      alert("등록된 사용자를 불러오지 못했습니다: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async () => {
    if (!newEmail || !newPassword) {
      alert("직원 이메일과 임시 비밀번호를 입력하세요.");
      return;
    }

    setCreatingUser(true);
    try {
      const res = await fetch(`${FUNCTION_BASE}/create_user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newEmail.trim().toLowerCase(),
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert("사용자 생성 실패: " + JSON.stringify(data.error));
        return;
      }

      alert("사용자가 생성되었습니다. 설정한 임시 비밀번호를 직원에게 전달하세요.");
      setNewEmail("");
      setNewPassword("");
      setNewRole("viewer");
      loadUsers();
    } catch (err) {
      alert("사용자 생성 실패: " + err);
    } finally {
      setCreatingUser(false);
    }
  };

  const updateRole = async (userId: string, role: string) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ role }),
    });

    if (!res.ok) {
      alert("권한을 업데이트하지 못했습니다.");
      return;
    }

    loadUsers();
  };

  const resetPassword = async (userId: string) => {
    const newPass = prompt("새 비밀번호를 입력하세요.");
    if (!newPass) return;

    const res = await fetch(`${FUNCTION_BASE}/reset-password`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
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

    alert("비밀번호를 변경했습니다.");
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const res = await fetch(`${FUNCTION_BASE}/delete_user`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
      }),
    });

    const data = await res.json();

    if (data.error) {
      alert("사용자 삭제 실패: " + JSON.stringify(data.error));
      return;
    }

    alert("사용자를 삭제했습니다.");
    loadUsers();
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-4">관리자 - 직원 계정 관리</h1>

      <div className="border rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">직원 계정 생성</h2>
        <p className="text-sm text-gray-500 mb-4">
          이메일과 임시 비밀번호를 지정해 계정을 만든 뒤, 해당 정보를 직원에게 전달하세요.
        </p>

        <div className="flex flex-col gap-3 w-96">
          <input
            className="border rounded p-2"
            placeholder="직원 이메일"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />

          <input
            className="border rounded p-2"
            placeholder="임시 비밀번호"
            type="text"
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
            className="bg-green-600 text-white py-2 rounded disabled:opacity-60"
            onClick={createUser}
            disabled={creatingUser}
          >
            {creatingUser ? "계정 생성 중..." : "계정 만들기"}
          </button>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">등록된 사용자</h2>

      {loading ? (
        <p>불러오는 중...</p>
      ) : (
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="py-2 px-3">이메일</th>
              <th className="py-2 px-3">이름</th>
              <th className="py-2 px-3">권한</th>
              <th className="py-2 px-3">비밀번호 초기화</th>
              <th className="py-2 px-3">삭제</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="py-2 px-3">{u.email}</td>
                <td className="py-2 px-3">{u.displayName}</td>
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
                <td className="py-2 px-3">
                  <button
                    className="text-blue-600 underline"
                    onClick={() => resetPassword(u.id)}
                  >
                    변경
                  </button>
                </td>
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


