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

  return (
    <div className="w-full mt-4 px-4 flex justify-start">
      <div className="w-full max-w-[900px]">

        <h1 className="text-lg font-bold mb-2">트래커 페이지</h1>

        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-1 w-10 text-left">번호</th>
              <th className="p-1 w-16 text-left">사진</th>
              <th className="p-1 w-28 text-left">날짜</th>
              <th className="p-1 w-20 text-left">에디터</th>
              <th className="p-1 text-left">제목</th>
              <th className="p-1 w-16 text-left">상태</th>
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
                  style={{ height: "32px" }}
                  onClick={() => setOpenItem(item)}
                >
                  <td className="p-1 text-center">{index + 1}</td>

                  <td className="p-1">
                    <img
                      src={previewImage}
                      className="w-10 h-10 object-cover rounded"
                    />
                  </td>

                  <td className="p-1">{item.created_at?.slice(0, 10)}</td>
                  <td className="p-1">{item.editor || ""}</td>
                  <td className="p-1">{item.title}</td>
                  <td className="p-1">{item.status}</td>
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
    </div>
  );
};

export default TrackerPage;
