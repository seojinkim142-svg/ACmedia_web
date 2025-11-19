import { useEffect, useState } from "react";
import DetailModal from "../components/DetailModal";
import { supabase } from "../supabaseClient";
import { uploadImage } from "../lib/uploadImages";
import TrackerTable from "../components/tracker/TrackerTable";
import ImageMenu from "../components/tracker/ImageMenu";
import CommentsModal from "../components/tracker/CommentsModal";
import { STORAGE_STATUSES } from "../constants/statuses";

interface Article {
  id: number;
  title: string;
  summary: string;
  body: string;
  source: string;
  status: string;
  editor?: string;
  content_source?: string;
  images: string[] | null;
  created_at?: string;
  bgm?: string;
  latest_comment?: string;
}

const EDITOR_OPTIONS = ["지민", "지안", "아라", "서진"];

const STORAGE_STATUS_FILTER = `(${STORAGE_STATUSES.map((status) => `"${status}"`).join(",")})`;

const formatDate = (value?: string | null) => {
  if (!value) return "";
  if (value.includes("T")) return value.split("T")[0];
  if (value.length >= 10) return value.slice(0, 10);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString().split("T")[0];
};

export default function TrackerPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [openItem, setOpenItem] = useState<Article | null>(null);
  const [memoItem, setMemoItem] = useState<Article | null>(null);
  const [exporting, setExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [imageMenu, setImageMenu] = useState<{ x: number; y: number; images: string[]; id: number } | null>(null);
  const [previewState, setPreviewState] = useState<{ images: string[]; index: number } | null>(null);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterEditor, setFilterEditor] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const loadArticles = async () => {
    const { data: art, error } = await supabase
      .from("articles")
      .select("*")
      .not("status", "in", STORAGE_STATUS_FILTER)
      .order("id", { ascending: true });

    if (error || !art) {
      setArticles([]);
      return;
    }

    const ids = art.map((a) => a.id);
    const latestMap: Record<number, string> = {};

    if (ids.length > 0) {
      const { data: latest } = await supabase
        .from("comments")
        .select("post_id, content, created_at")
        .in("post_id", ids)
        .order("created_at", { ascending: false });

      latest?.forEach((row: { post_id: number; content: string }) => {
        if (latestMap[row.post_id] === undefined) {
          latestMap[row.post_id] = row.content ?? "";
        }
      });
    }

    setArticles(
      art.map((a) => ({
        ...a,
        latest_comment: latestMap[a.id] ?? "",
      }))
    );
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleUpdated = (updated: Article) => {
    setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const uploadNewImage = async (file: File, articleId: number) => {
    const url = await uploadImage(file);
    const target = articles.find((a) => a.id === articleId);
    const updatedImages = target?.images?.length ? [...target.images, url] : [url];

    await supabase.from("articles").update({ images: updatedImages }).eq("id", articleId);
    loadArticles();
  };

  const exportArticles = async () => {
    try {
      setExporting(true);
      let query = supabase
        .from("articles")
        .select("id,title,summary,body,source,status,editor,content_source,bgm,created_at")
        .order("id", { ascending: true });

      if (selectedIds.length > 0) {
        query = query.in("id", selectedIds);
      }

      const { data, error } = await query;

      if (error) throw error;

      const headers = [
        "ID",
        "제목",
        "요약",
        "본문",
        "출처",
        "상태",
        "에디터",
        "콘텐츠 출처",
        "BGM",
        "작성일",
      ];

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
          row.bgm ?? "",
          formatDate(row.created_at),
        ]
          .map((value) => {
            const str = String(value).replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(",")
      );

      const csvBody = [headers.join(","), ...rows].join("\r\n");
      const csv = "\uFEFF" + csvBody;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const today = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `articles-${today}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("데이터 내보내기 실패: " + (err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const currentPreviewImage =
    previewState && previewState.images.length > 0
      ? previewState.images[previewState.index]
      : previewState
      ? "https://placehold.co/108x135?text=No+Image"
      : null;

  const statusOptions = Array.from(new Set(articles.map((a) => a.status).filter(Boolean))).sort();

  const filteredArticles = articles.filter((article) => {
    if (filterTitle.trim()) {
      const keyword = filterTitle.trim().toLowerCase();
      const titleText = (article.title ?? "").toLowerCase();
      if (!titleText.includes(keyword)) return false;
    }
    if (filterEditor && article.editor !== filterEditor) {
      return false;
    }
    if (filterStatus && article.status !== filterStatus) {
      return false;
    }
    if (filterDate) {
      const createdDate = article.created_at ? new Date(article.created_at) : null;
      const target = new Date(filterDate);
      target.setHours(0, 0, 0, 0);
      if (!createdDate) return false;
      const createdDay = new Date(createdDate);
      createdDay.setHours(0, 0, 0, 0);
      if (createdDay.getTime() !== target.getTime()) {
        return false;
      }
    }
    return true;
  });

  const resetFilters = () => {
    setFilterTitle("");
    setFilterEditor("");
    setFilterStatus("");
    setFilterDate("");
  };

  const movePreviewIndex = (delta: number) => {
    setPreviewState((prev) => {
      if (!prev || prev.images.length === 0) return prev;
      const nextIndex = (prev.index + delta + prev.images.length) % prev.images.length;
      return { ...prev, index: nextIndex };
    });
  };

  return (
    <div className="w-full mt-6 px-6" onClick={() => setImageMenu(null)}>
      <div className="w-full flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
          onClick={(e) => {
            e.stopPropagation();
            exportArticles();
          }}
          disabled={exporting}
        >
          {exporting ? "내보내는 중..." : "데이터 Excel 내보내기"}
        </button>
      </div>

      {previewState && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
          onClick={() => setPreviewState(null)}
        >
          <div
            className="relative flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center gap-4">
              <button
                className="p-2 bg-white/80 rounded-full disabled:opacity-40"
                onClick={() => movePreviewIndex(-1)}
                disabled={!previewState.images.length || previewState.images.length === 1}
              >
                &lt;
              </button>
              <img
                src={currentPreviewImage ?? "https://placehold.co/108x135?text=No+Image"}
                className="max-w-[80vw] max-h-[80vh] rounded shadow-lg object-contain"
              />
              <button
                className="p-2 bg-white/80 rounded-full disabled:opacity-40"
                onClick={() => movePreviewIndex(1)}
                disabled={!previewState.images.length || previewState.images.length === 1}
              >
                &gt;
              </button>
            </div>
            <div className="text-white text-sm">
              {previewState.images.length > 0
                ? `${previewState.index + 1} / ${previewState.images.length}`
                : "이미지가 없습니다"}
            </div>
            <button
              className="px-4 py-2 bg-white rounded shadow disabled:opacity-50"
              onClick={() => {
                if (!currentPreviewImage) return;
                const link = document.createElement("a");
                link.href = currentPreviewImage;
                link.download = `image-${Date.now()}.png`;
                link.click();
              }}
              disabled={!currentPreviewImage}
            >
              현재 이미지 다운로드
            </button>
            <button
              className="absolute top-0 right-0 px-3 py-1 text-sm bg-black/60 text-white rounded"
              onClick={() => setPreviewState(null)}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      <TrackerTable
        articles={filteredArticles}
        onDoubleClick={setOpenItem}
        onInlineUpdate={async (id, field, value) => {
          await supabase
            .from("articles")
            .update({ [field]: value })
            .eq("id", id);
          await loadArticles();
        }}
        onImageClick={(e, item) =>
          setImageMenu({
            x: e.clientX,
            y: e.clientY,
            images: item.images ?? [],
            id: item.id,
          })
        }
        onMemoClick={(item) => setMemoItem(item)}
        onSelectedChange={setSelectedIds}
        filterTitle={filterTitle}
        filterStatus={filterStatus}
        filterEditor={filterEditor}
        filterDate={filterDate}
        onFilterTitleChange={setFilterTitle}
        onFilterStatusChange={setFilterStatus}
        onFilterEditorChange={setFilterEditor}
        onFilterDateChange={setFilterDate}
        onResetFilters={resetFilters}
        statusOptions={statusOptions}
        editorOptions={EDITOR_OPTIONS}
      />

      <ImageMenu
        menu={imageMenu}
        onPreview={(images, startIndex = 0) => {
          if (images.length === 0) {
            setPreviewState({ images: [], index: 0 });
          } else {
            const validIndex =
              images.length === 0 ? 0 : Math.max(0, Math.min(startIndex, images.length - 1));
            setPreviewState({ images, index: validIndex });
          }
        }}
        onDownload={async (url) => {
          if (!url) {
            alert("다운로드할 이미지가 없습니다.");
            return;
          }
          try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to download");
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = `image-${Date.now()}.png`;
            link.click();
            URL.revokeObjectURL(objectUrl);
          } catch (error) {
            console.error(error);
            alert("이미지 다운로드에 실패했습니다.");
          }
        }}
        onUpload={uploadNewImage}
        onClose={() => setImageMenu(null)}
      />

      <DetailModal
        isOpen={openItem !== null}
        onClose={() => {
          setOpenItem(null);
          loadArticles();
        }}
        item={openItem}
        onUpdated={handleUpdated}
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

