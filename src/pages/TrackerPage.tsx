import { useEffect, useState } from "react";
import DetailModal from "../components/DetailModal";
import { supabase } from "../supabaseClient";
import { uploadImage } from "../lib/uploadImages";
import TrackerTable from "../components/tracker/TrackerTable";
import ImageMenu from "../components/tracker/ImageMenu";

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
}

export default function TrackerPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [openItem, setOpenItem] = useState<Article | null>(null);

  // 이미지 메뉴
  const [imageMenu, setImageMenu] = useState<{
    x: number;
    y: number;
    url: string;
    id: number;
  } | null>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("id", { ascending: true });

    if (data) setArticles(data);
  };

  const updateField = async (id: number, field: string, value: any) => {
    await supabase.from("articles").update({ [field]: value }).eq("id", id);
    loadArticles();

    if (openItem?.id === id) {
      setOpenItem((prev) => (prev ? { ...prev, [field]: value } : prev));
    }
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

  useEffect(() => {
    loadArticles();
  }, []);

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

      {/* 테이블 */}
      <TrackerTable
        articles={articles}
        onDoubleClick={setOpenItem}
        onInlineUpdate={updateField}
        onImageClick={(e, item) =>
          setImageMenu({
            x: e.clientX,
            y: e.clientY,
            url: item.images?.[0] || "",
            id: item.id,
          })
        }
      />

      {/* 이미지 메뉴 */}
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

      {/* 팝업 */}
      <DetailModal
        isOpen={openItem !== null}
        onClose={() => {
          setOpenItem(null);
          loadArticles();
        }}
        item={openItem}
      />
    </div>
  );
}
