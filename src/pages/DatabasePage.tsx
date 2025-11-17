import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import CommentsModal from "../components/tracker/CommentsModal";

interface DatabaseRow {
  id: number;
  title: string;
  status: string;
  editor?: string;
  source?: string;
  content_source?: string;
  created_at?: string;
  comments_count: number;
}

export default function DatabasePage() {
  const [rows, setRows] = useState<DatabaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [memoItem, setMemoItem] = useState<{ id: number; title?: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("id,title,status,editor,source,content_source,created_at,comments(count)")
      .order("created_at", { ascending: false });

    if (error || !data) {
      setRows([]);
      setLoading(false);
      return;
    }

    const formatted: DatabaseRow[] = data.map((item: any) => ({
      id: item.id,
      title: item.title ?? "",
      status: item.status ?? "",
      editor: item.editor ?? "",
      source: item.source ?? "",
      content_source: item.content_source ?? "",
      created_at: item.created_at ?? "",
      comments_count: item.comments?.[0]?.count ?? 0,
    }));

    setRows(formatted);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">데이터베이스</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={loadData}
        >
          새로고침
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        전체 기사 목록을 한 번에 확인할 수 있는 페이지입니다. 댓글 수를 포함한 주요 필드를 한눈에 확인하고, 필요한 경우 댓글 히스토리를 열람할 수 있습니다.
      </p>

      {loading ? (
        <p>불러오는 중...</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2 w-[280px]">제목</th>
                <th className="px-3 py-2">상태</th>
                <th className="px-3 py-2">에디터</th>
                <th className="px-3 py-2">출처</th>
                <th className="px-3 py-2">콘텐츠 출처</th>
                <th className="px-3 py-2">작성일</th>
                <th className="px-3 py-2 text-center">댓글 수</th>
                <th className="px-3 py-2">댓글</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">{row.id}</td>
                  <td className="px-3 py-2 truncate max-w-[300px]">{row.title}</td>
                  <td className="px-3 py-2">{row.status}</td>
                  <td className="px-3 py-2">{row.editor}</td>
                  <td className="px-3 py-2">{row.source}</td>
                  <td className="px-3 py-2 truncate max-w-[220px]">{row.content_source}</td>
                  <td className="px-3 py-2">{row.created_at?.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-center">{row.comments_count}</td>
                  <td className="px-3 py-2">
                    <button
                      className="px-3 py-1 text-sm bg-gray-200 rounded"
                      onClick={() => setMemoItem({ id: row.id, title: row.title })}
                    >
                      히스토리
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {memoItem && (
        <CommentsModal
          item={memoItem}
          onClose={() => setMemoItem(null)}
          onUpdated={loadData}
        />
      )}
    </div>
  );
}
