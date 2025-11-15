import { useEffect, useState } from "react";
import DetailModal from "../components/DetailModal";
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

  // DB에서 articles 불러오기
  const loadArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("id", { ascending: true });

    if (!error && data) {
      setArticles(data);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div className="max-w-3xl mt-4 px-4">
      <h1 className="text-xl font-bold mb-2">트래커 페이지</h1>

      <div className="flex flex-col">
        {articles.map((item, index) => {
          const previewImage =
            item.images && item.images.length > 0
              ? item.images[0]
              : "https://placehold.co/80x80?text=No+Image";

          return (
            <div
              key={item.id}
              onClick={() => setOpenItem(item)}
              className="flex items-center gap-3 py-2 border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {/* 번호 */}
              <div className="text-lg font-semibold text-gray-500 w-8 shrink-0 text-center">
                {index + 1}
              </div>

              {/* 이미지 (작게) */}
              <img
                src={previewImage}
                alt=""
                className="w-14 h-14 rounded-md object-cover shrink-0"
              />

              {/* 텍스트 */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm line-clamp-1">
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

      {/* 상세 모달 */}
      <DetailModal
        isOpen={openItem !== null}
        onClose={() => {
          setOpenItem(null);
          loadArticles(); // 저장 후 새로고침
        }}
        item={openItem}
      />
    </div>
  );
};

export default TrackerPage;
