import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import CommentsModal from "../components/tracker/CommentsModal";
import { useNavigate } from "react-router-dom";

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
  const [expandedTitles, setExpandedTitles] = useState<Record<string, boolean>>({});
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

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

  const titleGroups = useMemo(() => {
    const map = new Map<string, DatabaseRow[]>();
    rows.forEach((row) => {
      const key = row.title || "(제목 없음)";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows]);

  const dateGroups = useMemo(() => {
    const map = new Map<string, DatabaseRow[]>();
    rows.forEach((row) => {
      const key = row.created_at?.slice(0, 10) || "(날짜 없음)";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [rows]);

  const goToArticlePage = (row: DatabaseRow) => {
    const target = row.status === "업로드" ? "/upload" : "/tracker";
    navigate(target, { state: { focusId: row.id } });
  };

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">데이터베이스</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={loadData}>
          새로고침
        </button>
      </div>

      <p className="text-sm text-gray-500">
        트래커와 업로드 페이지의 모든 기사를 한 번에 모아 보는 공간입니다. 제목이나 날짜를 기준으로 펼쳐서 원하는 기사를 찾고, 해당 페이지로 바로 이동할 수 있습니다.
      </p>

      {loading ? (
        <p>불러오는 중...</p>
      ) : (
        <>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">제목별 보기</h2>
            {titleGroups.map(([title, items]) => (
              <div key={title} className="border rounded">
                <button
                  className="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-gray-50"
                  onClick={() =>
                    setExpandedTitles((prev) => ({ ...prev, [title]: !prev[title] }))
                  }
                >
                  <span>{title}</span>
                  <span className="text-sm text-gray-500">{items.length}건</span>
                </button>
                {expandedTitles[title] && (
                  <div className="divide-y">
                    {items.map((row) => (
                      <div key={row.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="font-semibold">{row.status}</p>
                          <p className="text-sm text-gray-600">
                            에디터: {row.editor || "-"} / 작성일: {row.created_at?.slice(0, 10) || "-"}
                          </p>
                          <p className="text-sm text-gray-500">
                            콘텐츠 출처: {row.content_source || "-"} / 댓글 {row.comments_count}개
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                            onClick={() => goToArticlePage(row)}
                          >
                            페이지 이동
                          </button>
                          <button
                            className="px-3 py-1 text-sm bg-gray-200 rounded"
                            onClick={() => setMemoItem({ id: row.id, title: row.title })}
                          >
                            댓글
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">날짜별 보기</h2>
            {dateGroups.map(([date, items]) => (
              <div key={date} className="border rounded">
                <button
                  className="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-gray-50"
                  onClick={() =>
                    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }))
                  }
                >
                  <span>{date}</span>
                  <span className="text-sm text-gray-500">{items.length}건</span>
                </button>
                {expandedDates[date] && (
                  <div className="divide-y">
                    {items.map((row) => (
                      <div key={row.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="font-semibold truncate max-w-[360px]">{row.title}</p>
                          <p className="text-sm text-gray-600">
                            상태: {row.status} / 에디터: {row.editor || "-"}
                          </p>
                          <p className="text-sm text-gray-500">
                            콘텐츠 출처: {row.content_source || "-"} / 댓글 {row.comments_count}개
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                            onClick={() => goToArticlePage(row)}
                          >
                            페이지 이동
                          </button>
                          <button
                            className="px-3 py-1 text-sm bg-gray-200 rounded"
                            onClick={() => setMemoItem({ id: row.id, title: row.title })}
                          >
                            댓글
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        </>
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
