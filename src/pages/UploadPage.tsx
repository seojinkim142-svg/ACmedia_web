import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import TrackerTable from "../components/tracker/TrackerTable";
import ImageMenu from "../components/tracker/ImageMenu";
import DetailModal from "../components/DetailModal";
import CommentsModal from "../components/tracker/CommentsModal";
import { uploadImage } from "../lib/uploadImages";
import { useNavigate } from "react-router-dom";

interface UploadArticle {
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
  latest_comment?: string;
  bgm?: string;
}

export default function UploadPage() {
  const [articles, setArticles] = useState<UploadArticle[]>([]);
  const [openItem, setOpenItem] = useState<UploadArticle | null>(null);
  const [memoItem, setMemoItem] = useState<UploadArticle | null>(null);
  const [imageMenu, setImageMenu] = useState<{ x: number; y: number; url: string; id: number } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "업로드")
      .order("id", { ascending: true });

    if (error || !data) {
      setArticles([]);
      return;
    }

    const ids = data.map((a) => a.id);
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
      data.map((a) => ({
        ...a,
        latest_comment: latestMap[a.id] ?? "",
      }))
    );
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleUpdated = (updated: UploadArticle) => {
    setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const notifyStatusChange = (field: string, value: string) => {
    if (field === "status" && value !== "업로드") {
      navigate("/tracker");
    }
  };

  const uploadNewImage = async (file: File, articleId: number) => {
    const url = await uploadImage(file);
    const target = articles.find((a) => a.id === articleId);
    const updatedImages = target?.images?.length ? [...target.images, url] : [url];

    await supabase.from("articles").update({ images: updatedImages }).eq("id", articleId);
    loadArticles();
  };

  return (
    <div className="w-full mt-6 px-6" onClick={() => setImageMenu(null)}>
      {previewImage && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} className="max-w-[90vw] max-h-[90vh] rounded" />
        </div>
      )}

      <TrackerTable
        articles={articles}
        onDoubleClick={setOpenItem}
        onInlineUpdate={async (id, field, value) => {
          await supabase.from("articles").update({ [field]: value }).eq("id", id);
          notifyStatusChange(field, value);
          await loadArticles();
        }}
        onImageClick={(e, item) =>
          setImageMenu({
            x: e.clientX,
            y: e.clientY,
            url: item.images?.[0] || "",
            id: item.id,
          })
        }
        onMemoClick={(item) => setMemoItem(item)}
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
