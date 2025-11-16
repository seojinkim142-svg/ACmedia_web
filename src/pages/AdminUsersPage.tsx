import { useEffect, useState } from "react";

interface UserRow {
  id: string;
  email: string | null;
  role: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // ✔ 최신 Edge Function URL
      const url = `https://rrmftksdyottcnobiqbd.functions.supabase.co/list-users`;

      const res = await fetch(url, {
        method: "GET",  // 🔥 POST → GET으로 변경
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      if (result.error) {
        alert("유저 로드 실패: " + result.error);
        return;
      }

      const formatted = result.users.map((u: any) => ({
        id: u.id,
        email: u.email,
        role: u.role ?? "user",
      }));

      setUsers(formatted);
    } catch (err) {
      alert("오류 발생: " + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-bold mb-4">유저 목록</h1>

      {loading ? (
        <p>불러오는 중...</p>
      ) : (
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="py-2 px-3">ID</th>
              <th className="py-2 px-3">이메일</th>
              <th className="py-2 px-3">권한</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{u.id}</td>
                <td className="py-2 px-3">{u.email}</td>
                <td className="py-2 px-3">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
