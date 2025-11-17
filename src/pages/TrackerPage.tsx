import { useEffect, useState } from "react";
import DetailModal from "../components/DetailModal";
import { supabase } from "../supabaseClient";
import { uploadImage } from "../lib/uploadImages";
import TrackerTable from "../components/tracker/TrackerTable";
import ImageMenu from "../components/tracker/ImageMenu";
import CommentsModal from "../components/tracker/CommentsModal";

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
  latest_comment?: string; // ??異붽???
}

export default function TrackerPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [openItem, setOpenItem] = useState<Article | null>(null);
  const [memoItem, setMemoItem] = useState<Article | null>(null);
  const [exporting, setExporting] = useState(false);

  const [imageMenu, setImageMenu] = useState<{
    x: number;
    y: number;
    url: string;
    id: number;
  } | null>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ?끸쁾?끸쁾??
  // ?꾩쟾 ?덉젙 踰꾩쟾 loadArticles
  // Supabase 議곗씤 ?놁씠 媛곴컖 理쒖떊 ?볤? 遺덈윭?ㅺ린
  // ?끸쁾?끸쁾??
  const loadArticles = async () => {
    const { data: art, error } = await supabase
      .from("articles")
      .select("*")
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
    setArticles(prev =>
      prev.map(a => (a.id === updated.id ? updated : a))
    );
  };

  const uploadNewImage = async (file: File, articleId: number) => {
    const url = await uploadImage(file);

    const target = articles.find((a) => a.id === articleId);
    const updatedImages = target?.images?.length
      ? [...target.images, url]
      : [url];

    await supabase
      .from("articles")
      .update({ images: updatedImages })
      .eq("id", articleId);

    loadArticles();
  };

  const exportArticles = async () => {
    try {
      setExporting(true);
      const { data, error } = await supabase
        .from("articles")
        .select(
          "id,title,summary,body,source,status,editor,content_source,bgm,created_at"
        )
        .order("id", { ascending: true });

      if (error) throw error;

      const headers = [
        "ID",
        "?쒕ぉ",
        "?붿빟",
        "蹂몃Ц",
        "異쒖쿂",
        "?곹깭",
        "?몄쭛??,
        "肄섑뀗痢?異쒖쿂",
        "BGM",
        "?묒꽦??,
      ];

      const rows = (data ?? []).map((row) => {
        return [
          row.id ?? "",
          row.title ?? "",
          row.summary ?? "",
          row.body ?? "",
          row.source ?? "",
          row.status ?? "",
          row.editor ?? "",
          row.content_source ?? "",
          row.bgm ?? "",
          row.created_at ?? "",
        ]
          .map((value) => {
            const str = String(value).replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(",");
      });

      const csvBody = [headers.join(","), ...rows].join("\r\n");
      const csv = "\uFEFF" + csvBody;
      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

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
      alert("?곗씠???대낫?닿린 ?ㅽ뙣: " + (err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="w-full mt-6 px-6"
      onClick={() => setImageMenu(null)}
    >
      <div className="w-full flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
          onClick={(e) => {
            e.stopPropagation();
            exportArticles();
          }}
          disabled={exporting}
        >
          {exporting ? "?대낫?대뒗 以?.." : "?곗씠??Excel ?대낫?닿린"}
        </button>
      </div>
      {/* ?대?吏 ?ш쾶 誘몃━蹂닿린 */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            className="max-w-[90vw] max-h-[90vh] rounded"
          />
        </div>
      )}

      <TrackerTable
        articles={articles}
        onDoubleClick={setOpenItem}
        onInlineUpdate={(id, field, value) =>
          supabase
            .from("articles")
            .update({ [field]: value })
            .eq("id", id)
            .then(() => loadArticles())
        }
        onImageClick={(e, item) =>
          setImageMenu({
            x: e.clientX,
            y: e.clientY,
            url: item.images?.[0] || "",
            id: item.id,
          })
        }
        onMemoClick={(item) => setMemoItem(item)} // ??硫붾え ?대┃ ?몃뱾??
      />

      <ImageMenu
        menu={imageMenu}
        onPreview={(url) => setPreviewImage(url)}
        onDownload={(url) => {
          const link = document.createElement("a");
          link.href = url;
          link.download = `image-${Date.now()}.png`;
          link.click();
        }}
        onUpload={uploadNewImage}
        onClose={() => setImageMenu(null)}
      />

      {/* ?곸꽭 ?몄쭛 紐⑤떖 */}
      <DetailModal
        isOpen={openItem !== null}
        onClose={() => { setOpenItem(null); loadArticles(); }}
        item={openItem}
        onUpdated={handleUpdated}
      />

      {/* ??硫붾え / ?볤? 紐⑤떖 */}
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

