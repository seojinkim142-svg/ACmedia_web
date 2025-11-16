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
  latest_comment?: string; // ★ 추가됨
}

export default function TrackerPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [openItem, setOpenItem] = useState<Article | null>(null);
  const [memoItem, setMemoItem] = useState<Article | null>(null);

  const [imageMenu, setImageMenu] = useState<{
    x: number;
    y: number;
    url: string;
    id: number;
  } | null>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 최신 댓글 포함해서 articles 불러오기
  const loadArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select(
        `
        *,
        comments:comments(content, created_at)
      `
      )
      .order("id", { ascending: true });

    if (!data) return;

    // comments 중 가장 최신 댓글 추출
    const mapped = data.map((a: any) => {
      let latest = "";
      if (a.comments && a.comments.length > 0) {
        const sorted = [...a.comments].sort(
          (x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime()
        );
        latest = sorted[0].content;
      }
      return { ...a, latest_comment: latest };
    });

    setArticles(mapped);
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

  return (
    <div
      className="w-full mt-6 px-6"
      onClick={() => setImageMenu(null)}
    >
      {/* 이미지 미리보기 */}
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
          supabase.from("articles").update({ [field]: value }).eq("id", id).then(loadArticles)
        }
        onImageClick={(e, item) =>
          setImageMenu({
            x: e.clientX,
            y: e.clientY,
            url: item.images?.[0] || "",
            id: item.id,
          })
        }
        onMemoClick={(item) => setMemoItem(item)} // ★ 메모 열기
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
        onClose={() => { setOpenItem(null); loadArticles(); }}
        item={openItem}
        onUpdated={handleUpdated}
      />

      {/* ★ 메모 모달 */}
      {memoItem && (
        <CommentsModal
          item={memoItem}
          onClose={() => setMemoItem(null)}
        />
      )}
    </div>
  );
}
