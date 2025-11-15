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
  created_at?: string;
  editor?: string;
}

const TrackerPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [openItem, setOpenItem] = useState<Article | null>(null);

  const [previewData, setPreviewData] = useState<{
    images: string[];
    index: number;
    articleId: number;
  } | null>(null);

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
    <div className="max-w-5xl mt-4 px-4">
      <h1 className="text-xl font-bold mb-3">트래커 페이지</h1>

      {/* ===== 헤더 ===== */}
      <div className="
        grid grid-cols-[45px_60px_90px_70px_1fr_70px]
        font-semibold text-xs text-gray-600
        border-b pb-1
      ">
        <div className="pl-1">번호</div>
        <div className="pl-1">사진</div>
        <div className="pl-1">날짜</div>
        <div className="pl-1">에디터</div>
        <div className="pl-1">제목</div>
        <div className="pl-1">상태</div>
      </div>

      {/* ===== 리스트 ===== */}
      <div className="flex flex-col text-xs">
        {articles.map((item, index) => {
          const preview =
            item.images && item.images.length > 0
              ? item.images[0]
              : "https://placehold.co/60x60?text=No+Image";

          const dateStr = item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : "-";

          return (
            <div
              key={item.id}
              className="
                grid grid-cols-[45px_60px_90px_70px_1fr_70px]
                border-b last:border-b-0
                hover:bg-gray-50 cursor-pointer
                py-2 content-start
              "
              onClick={() => setOpenItem(item)}
            >
              {/* ===== 번호 ===== */}
              <div className="pl-1">{index + 1}</div>

              {/* ===== 사진 ===== */}
              <img
                src={preview}
                className="w-8 h-8 rounded object-cover cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewData({
                    images: item.images || [],
                    index: 0,
                    articleId: item.id,
                  });
                }}
              />

              {/* ===== 날짜 ===== */}
              <div>{dateStr}</div>

              {/* ===== 에디터 ===== */}
              <div>{item.editor || ""}</div>

              {/* ===== 제목 ===== */}
              <div
                className="font-medium text-gray-900 line-clamp-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenItem(item);
                }}
              >
                {item.title}
              </div>

              {/* ===== 상태 ===== */}
              <div>{item.status}</div>
            </div>
          );
        })}
      </div>

      {/* ===== Detail Modal ===== */}
      <DetailModal
        isOpen={openItem !== null}
        onClose={() => {
          setOpenItem(null);
          loadArticles();
        }}
        item={openItem}
      />

      {/* ===== Image Preview Modal ===== */}
      {previewData && (
        <ImagePreviewModal
          images={previewData.images}
          startIndex={previewData.index}
          articleId={previewData.articleId}
          onUpdate={loadArticles}
          onClose={() => setPreviewData(null)}
        />
      )}
    </div>
  );
};

export default TrackerPage;
