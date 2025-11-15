import { useEffect, useState } from "react";
import DetailModal from "../components/DetailModal";
import { supabase } from "../supabaseClient";

interface Article {
  id: number;
  title: string;
  summary: string;
  body: string;
  editor: string;
  source: string;
  content_source: string;
  status: string;
  images: string[] | null;
  created_at: string;
}

export default function TrackerPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [openItem, setOpenItem] = useState<Article | null>(null);

  const loadArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("id", { ascending: true });

    if (!error && data) setArticles(data);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div className="w-full px-6">
      <h1 className="text-xl font-bold mb-4">트래커 페이지</h1>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-2 w-10 text-left">번호</th>
            <th className="p-2 w-20 text-left">사진</th>
            <th className="p-2 w-32 text-left">날짜</th>
            <th className="p-2 w-20 text-left">에디터</th>
            <th className="p-2 text-left">제목</th>
            <th className="p-2 w-20 text-left">상태</th>
          </tr>
        </thead>

        <tbody>
          {articles.map((item, index) => {
            const preview =
              item.images && item.images.length > 0
                ? item.images[0]
                : "https://placehold.co/120x120?text=No+Image";

            return (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => setOpenItem(item)}
              >
                <td className="p-2">{index + 1}</td>

                <td className="p-2">
                  <img
                    src={preview}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>

                <td className="p-2">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>

                <td className="p-2">{item.editor || ""}</td>

                <td className="p-2">{item.title}</td>

                <td className="p-2">{item.status}</td>
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
