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
    <div className="max-w-4xl mt-4 px-4">
      <h1 className="text-xl font-bold mb-4">트래커 페이지</h1>

      {/* ========= 헤더 ========= */}
      <div className="grid grid-cols-[80px_120px_80px_1fr_90px] font-semibold text-sm text-gray-600 border-b pb-2">
        <div className="text-left pl-1">사진</div>
        <div className="text-left pl-1">날짜</div>
        <div className="text-left pl-1">에디터</div>
        <div className="text-left pl-1">제목</div>
        <div className="text-left pl-1">상태</div>
      </div>

      {/* ========= 리스트 ========= */}
      <div className="flex flex-col">
        {articles.map((item) => {
          const preview =
            item.images && item.images.length > 0
              ? item.images[0]
              : "https://placehold.co/80x80?text=No+Image";

          const dateStr = item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : "-";

          return (
            <div
              key={item.id}
              className="grid grid-cols-[80px_120px_80px_1fr_90px] items-start gap-3 py-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
              onClick={() => setOpenItem(item)}
            >
              {/* ===== 사진 ===== */}
              <img
                src={preview}
                className="w-14 h-14 rounded-md object-cover self-start cursor-pointer"
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
              <div className="text-sm self-start pt-1 text-left">
                {dateStr}
              </div>

              {/* ===== 에디터 ===== */}
              <div className="text-sm self-start pt-1 text-left">
                {item.editor || ""}
              </div>

              {/* ===== 제목 ===== */}
              <div
                className="text-sm font-medium text-gray-900 self-start pt-1 line-clamp-1 text-left cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenItem(item);
                }}
              >
                {item.title}
              </div>

              {/* ===== 상태 ===== */}
              <div className="text-sm self-start pt-1 text-left">
                {item.status}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========= 본문 모달 ========= */}
      <DetailModal
        isOpen={openItem !== null}
        onClose={() => {
          setOpenItem(null);
          loadArticles();
        }}
        item={openItem}
      />

      {/* ========= 이미지 미리보기 모달 ========= */}
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
