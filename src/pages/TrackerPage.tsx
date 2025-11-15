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
  editor?: string;
  content_source?: string;
  images: string[] | null;
  created_at?: string;
}

export default function TrackerPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [openItem, setOpenItem] = useState<Article | null>(null);

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
    <div className="w-full mt-6 px-6">

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="py-2 px-1 text-sm w-10">번호</th>
            <th className="py-2 px-1 text-sm w-20">사진</th>
            <th className="py-2 px-1 text-sm w-24">날짜</th>
            <th className="py-2 px-1 text-sm w-24">에디터</th>
            <th className="py-2 px-1 text-sm">제목</th>
            <th className="py-2 px-1 text-sm w-20">상태</th>
          </tr>
        </thead>

        <tbody>
          {articles.map((item, index) => {
            const previewImage =
              item.images?.length
                ? item.images[0]
                : "https://placehold.co/120x120?text=No+Image";

            return (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => setOpenItem(item)}   // ★ 팝업
              >
                {/* 번호 */}
                <td className="py-2 px-1 text-sm">{index + 1}</td>

                {/* 사진 */}
                <td className="py-2 px-1">
                  <img
                    src={previewImage}
                    className="w-14 h-14 object-cover rounded"
                    onClick={(e) => { e.stopPropagation(); setOpenItem(item); }}
                  />
                </td>

                {/* 날짜 */}
                <td className="py-2 px-1 text-sm">
                  {item.created_at?.slice(0, 10)}
                </td>

                {/* 에디터 */}
                <td className="py-2 px-1 text-sm">{item.editor || ""}</td>

                {/* 제목 */}
                <td
                  className="py-2 px-1 text-sm underline text-blue-600"
                  onClick={(e) => { e.stopPropagation(); setOpenItem(item); }}
                >
                  {item.title}
                </td>

                {/* 상태 */}
                <td className="py-2 px-1 text-sm">{item.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

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
