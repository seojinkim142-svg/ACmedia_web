import { useEffect, useMemo, useState } from "react";
import DetailModal from "../components/DetailModal";
import CommentsModal from "../components/tracker/CommentsModal";
import { supabase } from "../supabaseClient";
import { STORAGE_STATUSES } from "../constants/statuses";

interface Article {
  id: number;
  title: string;
  status: string;
  editor?: string;
  source?: string;
  content_source?: string;
  created_at?: string;
  latest_comment?: string;
}

const STORAGE_STATUS_FILTER = `(${STORAGE_STATUSES.map((status) => `"${status}"`).join(",")})`;

export default function TrackerPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openItem, setOpenItem] = useState<Article | null>(null);
  const [memoItem, setMemoItem] = useState<Article | null>(null);

  const [filterTitle, setFilterTitle] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterEditor, setFilterEditor] = useState("");

  const loadArticles = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("articles")
      .select("id,title,status,editor,source,content_source,created_at")
      .not("status", "in", STORAGE_STATUS_FILTER)
      .order("created_at", { ascending: false });

    if (fetchError || !data) {
      setArticles([]);
      setError(fetchError?.message ?? "데이터를 불러오지 못했습니다.");
      setLoading(false);
      return;
    }

    const ids = data.map((a) => a.id);
    const latestMap: Record<number, string> = {};

    if (ids.length > 0) {
      const { data: comments } = await supabase
        .from("comments")
        .select("post_id, content, created_at")
        .in("post_id", ids)
        .order("created_at", { ascending: false });

      comments?.forEach((row) => {
        if (latestMap[row.post_id] === undefined) {
          latestMap[row.post_id] = row.content ?? "";
        }
      });
    }

    setArticles(
      data.map((a) => ({
        ...a,
        latest_comment: latestMap[a.id] ?? "",
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => a.status && set.add(a.status));
    return Array.from(set);
  }, [articles]);

  const editorOptions = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => a.editor && set.add(a.editor));
    return Array.from(set);
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const titlePass = filterTitle ? (a.title ?? "").toLowerCase().includes(filterTitle.toLowerCase()) : true;
      const statusPass = filterStatus ? a.status === filterStatus : true;
      const editorPass = filterEditor ? a.editor === filterEditor : true;
      return titlePass && statusPass && editorPass;
    });
  }, [articles, filterTitle, filterStatus, filterEditor]);

  const statusSummary = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((a) => map.set(a.status || "미정", (map.get(a.status || "미정") ?? 0) + 1));
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="w-full px-6 py-8 space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-gray-500">ACMEDIA</p>
          <h1 className="text-3xl font-bold text-gray-900">트래커</h1>
          <p className="text-sm text-gray-500">기사 진행 상황을 한눈에 확인하세요.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
            onClick={loadArticles}
            disabled={loading}
          >
            {loading ? "불러오는 중..." : "새로고침"}
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="전체" value={filtered.length} />
        {statusSummary.map(([label, count]) => (
          <SummaryCard key={label} label={label} value={count} />
        ))}
      </section>

      <section className="bg-white border rounded-2xl shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap gap-3">
          <input
            className="border rounded px-3 py-2 text-sm flex-1 min-w-[180px]"
            placeholder="제목 검색"
            value={filterTitle}
            onChange={(e) => setFilterTitle(e.target.value)}
          />
          <select
            className="border rounded px-3 py-2 text-sm min-w-[140px]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">전체 상태</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="border rounded px-3 py-2 text-sm min-w-[140px]"
            value={filterEditor}
            onChange={(e) => setFilterEditor(e.target.value)}
          >
            <option value="">전체 편집자</option>
            {editorOptions.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <button
            className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
            onClick={() => {
              setFilterTitle("");
              setFilterStatus("");
              setFilterEditor("");
            }}
          >
            초기화
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <colgroup>
              <col style={{ width: "72px" }} />
              <col />
              <col style={{ width: "120px" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "160px" }} />
              <col style={{ width: "80px" }} />
            </colgroup>
            <thead className="bg-gray-100 text-sm border-b">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">제목</th>
                <th className="px-3 py-2">상태</th>
                <th className="px-3 py-2">편집자</th>
                <th className="px-3 py-2">출처</th>
                <th className="px-3 py-2">메모</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                    데이터를 불러오는 중입니다...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                    조건에 맞는 기사가 없습니다.
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-600">{item.id}</td>
                    <td
                      className="px-3 py-2 font-medium cursor-pointer text-blue-600 hover:underline"
                      onClick={() => setOpenItem(item)}
                    >
                      {item.title || "제목 없음"}
                    </td>
                    <td className="px-3 py-2">{item.status || "-"}</td>
                    <td className="px-3 py-2">{item.editor || "-"}</td>
                    <td className="px-3 py-2 text-gray-600">{item.content_source || item.source || "-"}</td>
                    <td className="px-3 py-2">
                      <button
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
                        onClick={() => setMemoItem(item)}
                      >
                        보기
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      <DetailModal
        isOpen={openItem !== null}
        item={openItem}
        onClose={() => {
          setOpenItem(null);
          loadArticles();
        }}
        onUpdated={() => loadArticles()}
      />

      {memoItem && (
        <CommentsModal
          item={memoItem}
          onClose={() => setMemoItem(null)}
          onUpdated={loadArticles}
        />
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
