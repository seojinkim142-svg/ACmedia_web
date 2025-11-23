import { useEffect, useMemo, useRef, useState } from "react";
import DetailModal from "../components/DetailModal";
import CommentsModal from "../components/tracker/CommentsModal";
import TrackerTable from "../components/tracker/TrackerTable";
import { supabase } from "../supabaseClient";
import { STORAGE_STATUSES } from "../constants/statuses";
import { uploadImage } from "../lib/uploadImages";
import type { TrackerArticle } from "../types/tracker";

const STORAGE_STATUS_FILTER = `(${STORAGE_STATUSES.map((status) => `"${status}"`).join(",")})`;
const DETAIL_STORAGE_KEY = "tracker:last-open-detail-id";
const MEMO_STORAGE_KEY = "tracker:last-open-memo-id";
const STATUS_SUMMARY_LEFT = ["리뷰", "추천", "본문 작성", "본문 완료"] as const;
const STATUS_SUMMARY_RIGHT = ["이미지 생성", "이미지 완료", "업로드 예정", ""] as const;
const STATUS_OPTIONS = [
  "리뷰",
  "추천",
  "본문 작성",
  "본문 완료",
  "이미지 생성",
  "이미지 완료",
  "업로드 예정",
  "보류",
  "중복",
];

export default function TrackerPage() {
  const [articles, setArticles] = useState<TrackerArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openItem, setOpenItem] = useState<TrackerArticle | null>(null);
  const [memoItem, setMemoItem] = useState<TrackerArticle | null>(null);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterEditor, setFilterEditor] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [previewState, setPreviewState] = useState<{ item: TrackerArticle; index: number } | null>(null);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [imageMenu, setImageMenu] = useState<{ x: number; y: number; item: TrackerArticle } | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [exporting, setExporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentPreviewUrl = previewState?.item.images?.[previewState.index] ?? null;

  const loadArticles = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("articles")
      .select("id,title,summary,body,status,editor,source,content_source,created_at,images")
      .not("status", "in", STORAGE_STATUS_FILTER)
      .order("id", { ascending: true });

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
        id: a.id,
        title: a.title,
        summary: a.summary ?? "", 
        body: a.body ?? "",
        source: a.source ?? "",
        status: a.status,
        editor: a.editor ?? "",
        content_source: a.content_source ?? "",
        created_at: a.created_at,
        images: a.images ?? [],
        latest_comment: latestMap[a.id] ?? "",
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    loadArticles();
  }, []);

    const editorOptions = useMemo(() => ["지민", "아라", "지은"], []);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const titlePass = filterTitle ? (a.title ?? "").toLowerCase().includes(filterTitle.toLowerCase()) : true;
      const statusPass = filterStatus ? a.status === filterStatus : true;
      const editorPass = filterEditor ? a.editor === filterEditor : true;
      const dateStr = (a.created_at ?? "").slice(0, 10);
      const fromPass = filterDateFrom ? dateStr >= filterDateFrom : true;
      const toPass = filterDateTo ? dateStr <= filterDateTo : true;
      const datePass = fromPass && toPass;
      return titlePass && statusPass && editorPass && datePass;
    });
  }, [articles, filterDateFrom, filterDateTo, filterEditor, filterStatus, filterTitle]);

  const statusSummary = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((a) => map.set(a.status || "미정", (map.get(a.status || "미정") ?? 0) + 1));
    return Array.from(map.entries());
  }, [filtered]);

  const statusCount = useMemo(() => {
    const map = new Map(statusSummary);
    return (label: string) => map.get(label) ?? 0;
  }, [statusSummary]);

  const updateField = async (id: number, field: string, value: string) => {
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
    try {
      const payload: Record<string, string> = { [field]: value };
      const { error: updateError } = await supabase.from("articles").update(payload).eq("id", id);
      if (updateError) throw updateError;
      
      await loadArticles();
    } catch (e) {
      console.error(e);
      alert("저장에 실패했습니다. 다시 시도해 주세요.");

      await loadArticles();
    }
  };

  const closePreview = () => setPreviewState(null);

  const downloadPreview = async () => {
    if (!currentPreviewUrl || !previewState) return;
    try {
      const res = await fetch(currentPreviewUrl);
      if (!res.ok) throw new Error("이미지를 불러올 수 없습니다.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `article-${previewState.item.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("다운로드 중 오류가 발생했습니다: " + (err as Error).message);
    }
  };

  const readImageSize = (file: File) => {
    return new Promise<{ width: number; height: number }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadPreview = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (!files.length || !previewState) return;
    setUploadingPreview(true);
    try {
      const uploaded: string[] = [];

      for (const file of files) {
        const { width, height } = await readImageSize(file);
        if (width !== 1080 || height !== 1350) {
          alert(`??? ??? 1080x1350?? ?? ???. ??: ${width}x${height}`);
          continue;
        }
        const url = await uploadImage(file);
        if (url) {
          uploaded.push(url);
        }
      }

      if (!uploaded.length) {
        alert("???? ??????. ?? ??? ???.");
        return;
      }

      const updatedImages = [...(previewState.item.images ?? [])];
      const replaceIndex = previewState.index ?? 0;

      if (updatedImages.length === 0) {
        updatedImages.push(...uploaded);
      } else {
        updatedImages[replaceIndex] = uploaded[0];
        if (uploaded.length > 1) {
          updatedImages.push(...uploaded.slice(1));
        }
      }

      const { error } = await supabase.from("articles").update({ images: updatedImages }).eq("id", previewState.item.id);
      if (error) throw error;
      await loadArticles();
      setPreviewState((prev) => (prev ? { ...prev, item: { ...prev.item, images: updatedImages } } : prev));
      alert("???? ??????.");
    } catch (err) {
      alert("??? ?? ? ??? ??????: " + (err as Error).message);
    } finally {
      setUploadingPreview(false);
      event.target.value = "";
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "";
    if (value.includes("T")) return value.split("T")[0];
    if (value.length >= 10) return value.slice(0, 10);
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString().split("T")[0];
  };

  const exportArticles = async () => {
    try {
      setExporting(true);
      let query = supabase
        .from("articles")
        .select("id,title,summary,body,source,status,editor,content_source,created_at")
        .not("status", "in", STORAGE_STATUS_FILTER)
        .order("id", { ascending: true });

      if (selectedIds.length > 0) {
        query = query.in("id", selectedIds);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const headers = ["ID", "제목", "요약", "본문", "출처", "상태", "편집자", "콘텐츠 출처", "작성일"];
      const rows = (data ?? []).map((row) =>
        [
          row.id ?? "",
          row.title ?? "",
          row.summary ?? "",
          row.body ?? "",
          row.source ?? "",
          row.status ?? "",
          row.editor ?? "",
          row.content_source ?? "",
          formatDate(row.created_at),
        ]
          .map((value) => {
            const str = String(value).replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(",")
      );

      const csvBody = [headers.join(","), ...rows].join("\r\n");
      const csv = "\uFEFF" + csvBody; // BOM for Excel
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const today = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `tracker-articles-${today}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("엑셀 내보내기에 실패했습니다: " + (err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full px-6 py-8 space-y-8">
      {previewState && (
        <div
          className="fixed inset-0 z-12000 bg-black/70 flex items-center justify-center px-4"
          onClick={closePreview}
        >
          <div
            className="relative w-full max-w-[840px] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-10 right-0 px-4 py-2 rounded bg-black/60 text-white text-sm hover:bg-black/70"
              onClick={closePreview}
            >
              닫기
            </button>

            <div className="relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={currentPreviewUrl ?? "https://placehold.co/1080x1350?text=No+Image"}
                alt="미리보기"
                className="w-full max-h-[80vh] object-contain bg-black"
              />

              <div className="absolute inset-y-0 left-3 flex items-center">
                <button
                  className="p-2 bg-white/85 rounded-full shadow disabled:opacity-40"
                  onClick={() =>
                    setPreviewState((prev) => {
                      if (!prev) return prev;
                      const imgs = prev.item.images ?? [];
                      if (imgs.length <= 1) return prev;
                      const nextIndex = (prev.index - 1 + imgs.length) % imgs.length;
                      return { ...prev, index: nextIndex };
                    })
                  }
                  disabled={!previewState.item.images?.length || (previewState.item.images?.length ?? 0) <= 1}
                  aria-label="이전 이미지"
                >
                  ‹
                </button>
              </div>

              <div className="absolute inset-y-0 right-3 flex items-center">
                <button
                  className="p-2 bg-white/85 rounded-full shadow disabled:opacity-40"
                  onClick={() =>
                    setPreviewState((prev) => {
                      if (!prev) return prev;
                      const imgs = prev.item.images ?? [];
                      if (imgs.length <= 1) return prev;
                      const nextIndex = (prev.index + 1) % imgs.length;
                      return { ...prev, index: nextIndex };
                    })
                  }
                  disabled={!previewState.item.images?.length || (previewState.item.images?.length ?? 0) <= 1}
                  aria-label="다음 이미지"
                >
                  ›
                </button>
              </div>

              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent text-white p-4">
                <p className="text-xs font-semibold opacity-80">AC Media</p>
                <p className="text-lg font-bold line-clamp-2">{previewState.item.title || "제목 없음"}</p>
              </div>
            </div>

            <div className="text-white text-sm">
              {(previewState.item.images?.length ?? 0) > 0
                ? `${previewState.index + 1} / ${previewState.item.images?.length ?? 0}`
                : "이미지가 없습니다"}
            </div>

            <div className="flex gap-3">
              <button
                className="px-4 py-2 rounded bg-white text-gray-900 shadow disabled:opacity-50"
                onClick={downloadPreview}
                disabled={!currentPreviewUrl}
              >
                현재 이미지 다운로드
              </button>
              <button
                className="px-4 py-2 rounded bg-white text-gray-900 shadow disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPreview}
              >
                {uploadingPreview ? "업로드 중..." : "업로드"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleUploadPreview}
              />
            </div>
          </div>
        </div>
      )}

      {imageMenu && (
        <div
          className="fixed inset-0 z-11000"
          onClick={() => setImageMenu(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            className="absolute bg-white shadow-lg rounded-lg border p-3 space-y-2 text-gray-800"
            style={{ top: imageMenu.y, left: imageMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="block w-full text-left hover:bg-gray-100 px-2 py-1 rounded"
              onClick={() => {
                setPreviewState({ item: imageMenu.item, index: 0 });
                setImageMenu(null);
              }}
            >
              이미지 보기
            </button>
            <button
              className="block w-full text-left hover:bg-gray-100 px-2 py-1 rounded disabled:text-gray-400"
              disabled={!imageMenu.item.images?.length}
              onClick={() => {
                setPreviewState({ item: imageMenu.item, index: 0 });
                setImageMenu(null);
                setTimeout(() => downloadPreview(), 0);
              }}
            >
              다운로드
            </button>
            <button
              className="block w-full text-left hover:bg-gray-100 px-2 py-1 rounded"
              onClick={() => {
                setPreviewState({ item: imageMenu.item, index: 0 });
                setImageMenu(null);
                setTimeout(() => fileInputRef.current?.click(), 0);
              }}
            >
              업로드
            </button>
          </div>
        </div>
      )}

      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-gray-500">ACMEDIA</p>
          <h1 className="text-3xl font-bold text-gray-900">트래커</h1>
          <p className="text-sm text-gray-500">기사 진행 현황을 한눈에 확인하세요.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
            onClick={loadArticles}
            disabled={loading}
          >
            {loading ? "불러오는 중..." : "새로고침"}
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
            onClick={exportArticles}
            disabled={exporting}
          >
            {exporting ? "내보내는 중..." : "선택 데이터 Excel 내보내기"}
          </button>
        </div>
      </header>

      <section className="bg-white border rounded-2xl shadow-sm p-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 gap-2">
          {STATUS_SUMMARY_LEFT.map((label, idx) => {
            const rightLabel = STATUS_SUMMARY_RIGHT[idx];
            return (
              <div key={label} className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border">
                  <span className="text-gray-700">{label}</span>
                  <span className="font-semibold text-gray-900">{statusCount(label)}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border">
                  <span className="text-gray-700">{rightLabel || " "}</span>
                  <span className="font-semibold text-gray-900">
                    {rightLabel ? statusCount(rightLabel) : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white border rounded-2xl shadow-sm p-4 space-y-4">
        <TrackerTable
          articles={filtered}
          onTitleClick={(item) => {
            setOpenItem(item);
            localStorage.setItem(DETAIL_STORAGE_KEY, String(item.id));
          }}
          onInlineUpdate={updateField}
          onImageClick={(e, item) => {
            e.stopPropagation();
            setImageMenu({ x: e.clientX + 8, y: e.clientY + 8, item });
          }}
          onMemoClick={(item) => {
            setMemoItem(item);
            localStorage.setItem(MEMO_STORAGE_KEY, String(item.id));
          }}
          onSelectedChange={setSelectedIds}
          filterTitle={filterTitle}
          filterStatus={filterStatus}
          filterEditor={filterEditor}
          filterDateFrom={filterDateFrom}
          filterDateTo={filterDateTo}
          onFilterTitleChange={setFilterTitle}
          onFilterStatusChange={setFilterStatus}
          onFilterEditorChange={setFilterEditor}
          onFilterDateFromChange={setFilterDateFrom}
          onFilterDateToChange={setFilterDateTo}
          onResetFilters={() => {
            setFilterTitle("");
            setFilterStatus("");
            setFilterEditor("");
            setFilterDateFrom("");
            setFilterDateTo("");
          }}
          statusOptions={STATUS_OPTIONS}
          editorOptions={editorOptions}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      <DetailModal
        isOpen={openItem !== null}
        item={openItem}
        onClose={() => {
          setOpenItem(null);
          localStorage.removeItem(DETAIL_STORAGE_KEY);
          loadArticles();
        }}
        onUpdated={() => loadArticles()}
      />

      {memoItem && (
        <CommentsModal
          item={memoItem}
          onClose={() => setMemoItem(null)}
          onAfterClose={() => localStorage.removeItem(MEMO_STORAGE_KEY)}
          onUpdated={loadArticles}
        />
      )}
    </div>
  );
}