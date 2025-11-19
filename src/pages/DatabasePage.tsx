import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CommentsModal from "../components/tracker/CommentsModal";
import { supabase } from "../supabaseClient";
import { isStorageStatus } from "../constants/statuses";

interface DatabaseRow {
  id: number;
  title: string;
  status: string;
  editor?: string;
  source?: string;
  content_source?: string;
  created_at?: string;
  comments_count: number;
  bgm?: string | null;
}

type ViewMode =
  | "title"
  | "date"
  | "editor"
  | "source"
  | "status"
  | "comments"
  | "bgm";

const EMPTY_TITLE = "(제목 없음)";
const EMPTY_DATE = "(날짜 없음)";
const EMPTY_EDITOR = "(편집자 없음)";
const EMPTY_SOURCE = "(출처 없음)";
const EMPTY_STATUS = "(상태 없음)";

const VIEW_MENU: { id: ViewMode; label: string; description: string }[] = [
  { id: "title", label: "제목별 보기", description: "동일 제목의 기사 묶음" },
  { id: "date", label: "날짜별 보기", description: "작성일 기준 최신순" },
  { id: "editor", label: "편집자별 보기", description: "담당 편집자별 정리" },
  { id: "source", label: "출처별 보기", description: "콘텐츠 출처/원문별 분류" },
  { id: "status", label: "상태별 보기", description: "진행 상태별 기사" },
  { id: "comments", label: "댓글 많은 순", description: "댓글 수 기준 내림차순" },
  { id: "bgm", label: "BGM 설정된 글", description: "BGM 필드가 있는 게시물" },
];

export default function DatabasePage() {
  const [rows, setRows] = useState<DatabaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [memoItem, setMemoItem] = useState<{ id: number; title?: string } | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [activeView, setActiveView] = useState<ViewMode>("title");
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("id,title,status,editor,source,content_source,created_at,bgm")
      .order("created_at", { ascending: false });

    if (error || !data) {
      setRows([]);
      setLoading(false);
      return;
    }

    const ids = data.map((item) => item.id);
    const commentCounts: Record<number, number> = {};

    if (ids.length > 0) {
      const { data: commentRows } = await supabase
        .from("comments")
        .select("post_id")
        .in("post_id", ids);

      commentRows?.forEach(({ post_id }) => {
        commentCounts[post_id] = (commentCounts[post_id] ?? 0) + 1;
      });
    }

    const formatted: DatabaseRow[] = data.map((item) => ({
      id: item.id,
      title: item.title ?? "",
      status: item.status ?? "",
      editor: item.editor ?? "",
      source: item.source ?? "",
      content_source: item.content_source ?? "",
      created_at: item.created_at ?? "",
      comments_count: commentCounts[item.id] ?? 0,
      bgm: item.bgm ?? "",
    }));

    setRows(formatted);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const buildGroups = (
    getter: (row: DatabaseRow) => string,
    order: "asc" | "desc" = "asc",
  ) => {
    const map = new Map<string, DatabaseRow[]>();
    rows.forEach((row) => {
      const key = getter(row);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    });
    const entries = Array.from(map.entries());
    entries.sort((a, b) =>
      order === "asc" ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0]),
    );
    return entries;
  };

  const titleGroups = useMemo(
    () => buildGroups((row) => row.title || EMPTY_TITLE, "asc"),
    [rows],
  );
  const dateGroups = useMemo(
    () => buildGroups((row) => row.created_at?.slice(0, 10) || EMPTY_DATE, "desc"),
    [rows],
  );
  const editorGroups = useMemo(
    () => buildGroups((row) => row.editor || EMPTY_EDITOR, "asc"),
    [rows],
  );
  const sourceGroups = useMemo(
    () => buildGroups((row) => row.content_source || row.source || EMPTY_SOURCE, "asc"),
    [rows],
  );
  const statusGroups = useMemo(
    () => buildGroups((row) => row.status || EMPTY_STATUS, "asc"),
    [rows],
  );

  const commentsSorted = useMemo(
    () => [...rows].sort((a, b) => b.comments_count - a.comments_count),
    [rows],
  );
  const bgmRows = useMemo(
    () => rows.filter((row) => Boolean(row.bgm && row.bgm.trim())),
    [rows],
  );

  const goToArticlePage = (row: DatabaseRow) => {
    const target = isStorageStatus(row.status) ? "/upload" : "/tracker";
    navigate(target, { state: { focusId: row.id } });
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderRowCard = (row: DatabaseRow, extra?: ReactNode) => (
    <div
      key={row.id}
      className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
    >
      <div>
        <p className="font-semibold text-gray-900 truncate max-w-[360px]">
          {row.title || EMPTY_TITLE}
        </p>
        <p className="text-sm text-gray-600">
          상태: {row.status || "-"} / 편집자: {row.editor || "-"}
        </p>
        <p className="text-xs text-gray-500">
          작성일: {row.created_at?.slice(0, 10) || "-"} / 댓글 {row.comments_count}
        </p>
        <p className="text-xs text-gray-500">
          출처: {row.content_source || row.source || "-"}
        </p>
        {extra}
      </div>
      <div className="flex gap-2 shrink-0">
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
          메모
        </button>
      </div>
    </div>
  );

  const renderGroupList = (
    groups: [string, DatabaseRow[]][],
    emptyText: string,
    viewKey: ViewMode,
  ) => {
    if (groups.length === 0) {
      return <p className="text-sm text-gray-500 px-4 py-6">{emptyText}</p>;
    }

    return groups.map(([label, items]) => {
      const key = `${viewKey}-${label}`;
      const opened = expandedGroups[key];
      return (
        <div key={key} className="border rounded">
          <button
            className="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-gray-50"
            onClick={() => toggleGroup(key)}
          >
            <span className="font-semibold truncate max-w-[260px]">{label}</span>
            <span className="text-sm text-gray-500">{items.length}건</span>
          </button>
          {opened && (
            <div className="divide-y bg-gray-50/60">
              {items.map((row) => renderRowCard(row))}
            </div>
          )}
        </div>
      );
    });
  };

  const renderContent = () => {
    if (loading) return <p>불러오는 중...</p>;

    switch (activeView) {
      case "title":
        return renderGroupList(titleGroups, "표시할 제목이 없습니다.", "title");
      case "date":
        return renderGroupList(dateGroups, "표시할 날짜가 없습니다.", "date");
      case "editor":
        return renderGroupList(editorGroups, "편집자 정보가 없습니다.", "editor");
      case "source":
        return renderGroupList(sourceGroups, "출처 정보가 없습니다.", "source");
      case "status":
        return renderGroupList(statusGroups, "상태 정보가 없습니다.", "status");
      case "comments": {
        if (!commentsSorted.length) {
          return <p className="text-sm text-gray-500">등록된 기사가 없습니다.</p>;
        }
        return (
          <div className="space-y-3">
            {commentsSorted.map((row, index) =>
              renderRowCard(
                row,
                <p className="text-xs text-gray-500 mt-1">
                  순위 {index + 1} · 댓글 {row.comments_count}건
                </p>,
              ),
            )}
          </div>
        );
      }
      case "bgm": {
        if (!bgmRows.length) {
          return <p className="text-sm text-gray-500">BGM이 설정된 글이 없습니다.</p>;
        }
        return (
          <div className="space-y-3">
            {bgmRows.map((row) =>
              renderRowCard(
                row,
                <p className="text-xs text-gray-500 mt-1">BGM: {row.bgm}</p>,
              ),
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="w-full p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">데이터베이스</h1>
          <p className="text-sm text-gray-500 mt-1">
            트래커/보관함 페이지의 기사 정보를 분류 기준에 따라 빠르게 찾아보세요.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={loadData}>
          새로고침
        </button>
      </div>

      <div className="mt-6 flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 w-full">
          <div className="border rounded-lg bg-white">
            {VIEW_MENU.map((view) => (
              <button
                key={view.id}
                className={`w-full text-left px-4 py-3 border-b last:border-none ${
                  activeView === view.id
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setActiveView(view.id)}
              >
                <p>{view.label}</p>
                <p className="text-xs text-gray-500">{view.description}</p>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1">
          <div className="border rounded-lg bg-white p-4 space-y-4 min-h-[420px]">
            {renderContent()}
          </div>
        </main>
      </div>

      {memoItem && (
        <CommentsModal item={memoItem} onClose={() => setMemoItem(null)} onUpdated={loadData} />
      )}
    </div>
  );
}
