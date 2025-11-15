import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import DetailModal from "../components/DetailModal";

interface Article {
  id: number;
  title: string;
  summary: string;
  body: string;
  images: string[] | null;
  status: string;
  created_at?: string;
}

export default function TrackerPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Article | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const loadArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("id", { ascending: true });

    if (data) {
      setArticles(data);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const openModal = (item: Article) => {
    setSelected(item);
    setIsOpen(true);
  };

  return (
    <div className="w-full px-6 py-6 flex flex-col items-start">

      {/* 테이블 */}
      <table className="border-collapse text-sm">
        <thead>
          <tr className="bg-gray-200 border-b">
            <th className="border px-4 py-2">번호</th>
            <th className="border px-4 py-2">사진</th>
            <th className="border px-4 py-2">날짜</th>
            <th className="border px-4 py-2">제목</th>
            <th className="border px-4 py-2">상태</th>
          </tr>
        </thead>

        <tbody>
          {articles.map((a, idx) => (
            <tr
              key={a.id}
              className="border cursor-pointer hover:bg-gray-100"
              onClick={() => openModal(a)}
            >
              {/* 번호 */}
              <td className="border px-4 py-2">{idx + 1}</td>

              {/* 사진 */}
              <td className="border px-4 py-2">
                <img
                  src={
                    a.images && a.images.length > 0
                      ? a.images[0]
                      : "https://placehold.co/120x120?text=No+Image"
                  }
                  className="w-14 h-14 object-cover rounded border"
                />
              </td>

              {/* 날짜 */}
              <td className="border px-4 py-2">
                {a.created_at
                  ? new Date(a.created_at).toLocaleDateString()
                  : "-"}
              </td>

              {/* 제목 */}
              <td className="border px-4 py-2">
                {a.title}
              </td>

              {/* 상태 */}
              <td className="border px-4 py-2">{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 상세 팝업 */}
      <DetailModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        item={selected}
      />
    </div>
  );
}
