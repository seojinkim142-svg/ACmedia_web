import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface UserRow {
  id: string;
  email: string | null;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      alert("유저 로드 실패: " + error.message);
      setLoading(false);
      return;
    }

    const formatted: UserRow[] = data.users.map((u) => ({
      id: u.id,
      email: u.email ?? null,   // ★ undefined → null 변환
      role: u.role ?? "user",
    }));

    setUsers(formatted);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-bold mb-6">유저 목록</h1>

      {loading ? (
        <div className="text-gray-600">불러오는 중...</div>
      ) : (
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="py-2 px-2 w-20">ID</th>
              <th className="py-2 px-2 w-60">유저 이메일</th>
              <th className="py-2 px-2 w-40">권한</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-2 text-sm">{u.id.slice(0, 8)}...</td>

                <td className="py-2 px-2 text-sm">{u.email}</td>

                <td className="py-2 px-2">
                  <select
                    className="border rounded px-2 py-1"
                    defaultValue={u.role}
                    onChange={async (e) => {
                      const newRole = e.target.value;

                      const { error } = await supabase.auth.admin.updateUserById(
                        u.id,
                        { role: newRole }
                      );

                      if (error) {
                        alert("권한 변경 실패: " + error.message);
                        return;
                      }

                      alert("권한 변경 완료");
                      loadUsers();
                    }}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
