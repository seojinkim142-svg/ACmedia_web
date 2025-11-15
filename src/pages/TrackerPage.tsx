import { useEffect, useState } from "react";
import DetailModal from "../components/DetailModal";
import { supabase } from "../supabaseClient";

const DEFAULT_IMAGE = "https://placehold.co/120x120?text=No+Image";

interface Article {
  id: number;
  title: string;
  summary: string;
  body: string;
  source: string;
  status: string;
  editor: string | null;
  content_source: string | null;
  images: string[] | null;
  created_at: string;
}

const TrackerPage = () => {
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
    <div className="w-full px-4 mt-4">
      <h1 className="text-xl font-bold mb-3">트래커 페이지</h1>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-gray-100 text-left">
            <th className="w-10 p-2">번호</th>
            <th className="w-20 p-2">사진</th>
            <th className="w-32 p-2">날짜</th>
            <th className="w-24 p-2">에디터</th>
            <th className="p-2">제목</th>
            <th className="w-20 p-2">상태</th>
          </tr>
        </thead>

        <tbody>
          {articles.map((item, index) => {
            const previewImage =
              item.images && item.images.length > 0
                ? item.images[0]
                : DEFAULT_IMAGE;

            return (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => setOpenItem(item)}
              >
                <td className="p-2 text-center">{index + 1}</td>

                <td className="p-2">
                  <img
                    src={previewImage}
                    className="w-14 h-14 object-cover rounded"
                  />
                </td>

                <td className="p-2">{item.created_at?.slice(0, 10)}</td>
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
};

export default TrackerPage;
