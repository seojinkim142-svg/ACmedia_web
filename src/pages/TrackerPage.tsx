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
    <div className="max-w-4xl mx-auto mt-6 px-4">
      <h1 className="text-xl font-bold mb-3">트래커 페이지</h1>

      {/* 헤더 */}
      <div className="grid grid-cols-[50px_80px_120px_1fr_100px] text-xs font-bold border-b py-2">
        <div>#</div>
        <div>사진</div>
        <div>날짜</div>
        <div>제목</div>
        <div>상태</div>
      </div>

      {articles.map((item, index) => {
        const img =
          item.images?.length > 0 ? item.images[0] : "https://placehold.co/60x60";

        const created = item.created_at
          ? new Date(item.created_at).toLocaleDateString()
          : "-";

        return (
          <div
            key={item.id}
            className="grid grid-cols-[50px_80px_120px_1fr_100px] text-xs border-b py-2 items-center hover:bg-gray-50 cursor-pointer"
            onClick={() => setOpenItem(item)}
          >
            <div>{index + 1}</div>

            <img
              src={img}
              className="w-12 h-12 object-cover rounded"
              onClick={(e) => {
                e.stopPropagation();
                setOpenItem({ ...item, previewIndex: 0 });
              }}
            />

            <div>{created}</div>

            <div className="truncate">{item.title}</div>

            <div>{item.status}</div>
          </div>
        );
      })}

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
