import { useEffect, useState } from "react";
import DetailModal from "../components/DetailModal";
import ImagePreviewModal from "../components/ImagePreviewModal";
import { supabase } from "../supabaseClient";

interface Article {
  id: number;
  title: string;
  summary: string;
  body: string;
  source: string;
  status: string;
  images: string[] | null;
}

const TrackerPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [openItem, setOpenItem] = useState<Article | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("id", { ascending: true });

    if (data) setArticles(data);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div className="max-w-3xl mt-4 px-4">
      <h1 className="text-xl font-bold mb-2">트래커 페이지</h1>

      <div className="flex flex-col">
        {articles.map((item, index) => {
          const preview =
            item.images && item.images.length > 0
              ? item.images[0]
              : "https://placehold.co/80x80?text=No+Image";

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 py-2 border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setOpenItem(item)}
            >
              <div className="text-lg font-semibold text-gray-500 w-8 shrink-0 text-center">
                {index + 1}
              </div>

              {/* 썸네일 클릭 → 이미지 미리보기 */}
              <img
                src={preview}
                className="w-14 h-14 rounded-md object-cover shrink-0 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(preview);
                }}
              />

              {/* 제목 클릭 → DetailModal */}
              <div className="flex-1 min-w-0">
                <div
                  className="font-medium text-gray-900 text-sm line-clamp-1 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenItem(item);
                  }}
                >
                  {item.title}
                </div>

                <div className="text-gray-500 text-xs line-clamp-1">
                  {item.summary}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 본문 모달 */}
      <DetailModal
        isOpen={openItem !== null}
        onClose={() => {
          setOpenItem(null);
          loadArticles();
        }}
        item={openItem}
      />

      {/* 이미지 프리뷰 모달 */}
      <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
};

export default TrackerPage;
