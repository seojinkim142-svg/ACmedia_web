import { useEffect, useState } from "react";
import DetailModal from "../components/DetailModal";
import { supabase } from "../supabaseClient";

export default function TrackerPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [openItem, setOpenItem] = useState<any | null>(null);

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
    <div className="max-w-5xl mx-auto mt-6 px-4">
      <h1 className="text-xl font-bold mb-3">트래커 페이지</h1>

      {/* 엑셀 헤더 */}
      <div className="
        grid 
        grid-cols-[45px_70px_120px_1fr_100px] 
        text-[11px] font-bold 
        border-b border-gray-300 
        h-8
        items-center
        bg-gray-100
      ">
        <div className="pl-2">#</div>
        <div>사진</div>
        <div>날짜</div>
        <div className="pl-1">제목</div>
        <div>상태</div>
      </div>

      {/* 엑셀 스타일 Rows */}
      {articles.map((item, index) => {
        const img =
          item.images?.length > 0 ? item.images[0] : "https://placehold.co/60x60";

        const created = item.created_at
          ? new Date(item.created_at).toLocaleDateString()
          : "-";

        return (
          <div
            key={item.id}
            className="
              grid 
              grid-cols-[45px_70px_120px_1fr_100px] 
              text-[11px] 
              border-b border-gray-200 
              h-[34px] 
              items-center
              hover:bg-gray-50
              cursor-pointer
            "
            onClick={() => setOpenItem(item)}
          >
            {/* 번호 */}
            <div className="pl-2">{index + 1}</div>

            {/* 이미지 */}
            <div className="flex items-center justify-center">
              <img
                src={img}
                className="w-10 h-10 object-cover rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenItem({ ...item, previewIndex: 0 });
                }}
              />
            </div>

            {/* 날짜 */}
            <div>{created}</div>

            {/* 제목 */}
            <div className="pl-1 truncate">{item.title}</div>

            {/* 상태 */}
            <div>{item.status}</div>
          </div>
        );
      })}

      {/* 상세 팝업 */}
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
