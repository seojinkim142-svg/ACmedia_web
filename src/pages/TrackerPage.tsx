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
  editor?: string; // editor 기본값 없음 ("")
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
    <div className="max-w-4xl mt-4 px-4">
      <h1 className="text-xl font-bold mb-4">트래커 페이지</h1>

      {/* ===== 헤더 ===== */}
      <div className="grid grid-cols-[70px_110px_80px_1fr_80px] font-semibold text-sm text-gray-600 border-b pb-2 mb-1">
        <div className="text-center">사진</div>
        <div className="text-center">날짜</div>
        <div className="text-center">에디터</div>
        <div className="text-left pl-1">제목</div>
        <div className="text-center">상태</div>
      </div>

      {/* ===== 리스트 ===== */}
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
              className="grid grid-cols-[70px_110px_80px_1fr_80px] items-center gap-3 py-2 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
              onClick={() => setOpenItem(item)}
            >
              {/* 사진 (이미지 미리보기) */}
              <img
                src={preview}
                className="w-12 h-12 rounded-md object-cover mx-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(preview);
                }}
              />

              {/* 날짜 */}
              <div className="text-center text-sm">{dateStr}</div>

              {/* 에디터 (기본값 없음) */}
              <div className="text-center text-sm">
                {item.editor || ""}
              </div>

              {/* 제목 (본문 팝업) */}
              <div
                className="text-sm font-medium text-gray-900 line-clamp-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenItem(item);
                }}
              >
                {item.title}
              </div>

              {/* 상태 */}
              <div className="text-center text-sm">{item.status}</div>
            </div>
          );
        })}
      </div>

      {/* ===== 본문 모달 ===== */}
      <DetailModal
        isOpen={openItem !== null}
        onClose={() => {
          setOpenItem(null);
          loadArticles();
        }}
        item={openItem}
      />

      {/* ===== 이미지 미리보기 모달 ===== */}
      <ImagePreviewModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};

export default TrackerPage;
