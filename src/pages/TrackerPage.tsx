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
  const [editing, setEditing] = useState<{ id: number; field: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null); // 사진 단일 팝업

  const loadArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("id", { ascending: true });

    if (data) setArticles(data);
  };

  const updateField = async (id: number, field: string, value: any) => {
    await supabase.from("articles").update({ [field]: value }).eq("id", id);
    loadArticles();

    if (openItem?.id === id) {
      setOpenItem((prev) => (prev ? { ...prev, [field]: value } : prev));
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div className="w-full mt-6 px-6">

      {/* 사진 크게보기 팝업 */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-xl"
          />
        </div>
      )}

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
            const preview =
              item.images?.length
                ? item.images[0]
                : "https://placehold.co/120x120?text=No+Image";

            return (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50"
                onDoubleClick={() => setOpenItem(item)}  // ★ 더블클릭 → 팝업
              >
                {/* 번호 */}
                <td className="py-2 px-1 text-sm">{index + 1}</td>

                {/* 사진 단일클릭 → 미리보기 */}
                <td className="py-2 px-1">
                  <img
                    src={preview}
                    className="w-14 h-14 object-cover rounded cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(preview);   // ★ 단일 클릭 → 인라인 사진 팝업
                    }}
                  />
                </td>

                {/* 날짜 inline edit */}
                <td
                  className="py-2 px-1 text-sm cursor-pointer"
                  onClick={() => setEditing({ id: item.id, field: "created_at" })}
                >
                  {editing?.id === item.id && editing?.field === "created_at" ? (
                    <input
                      type="date"
                      className="border rounded px-1"
                      value={item.created_at?.slice(0, 10)}
                      onChange={(e) =>
                        updateField(item.id, "created_at", e.target.value)
                      }
                      onBlur={() => setEditing(null)}
                    />
                  ) : (
                    item.created_at?.slice(0, 10)
                  )}
                </td>

                {/* 에디터 inline edit */}
                <td
                  className="py-2 px-1 text-sm cursor-pointer"
                  onClick={() => setEditing({ id: item.id, field: "editor" })}
                >
                  {editing?.id === item.id && editing?.field === "editor" ? (
                    <input
                      className="border rounded px-1"
                      value={item.editor || ""}
                      onChange={(e) =>
                        updateField(item.id, "editor", e.target.value)
                      }
                      onBlur={() => setEditing(null)}
                    />
                  ) : (
                    item.editor || ""
                  )}
                </td>

                {/* 제목 inline edit */}
                <td
                  className="py-2 px-1 text-sm cursor-pointer"
                  onClick={() => setEditing({ id: item.id, field: "title" })}
                >
                  {editing?.id === item.id && editing?.field === "title" ? (
                    <input
                      className="border rounded px-1 w-full"
                      value={item.title}
                      onChange={(e) =>
                        updateField(item.id, "title", e.target.value)
                      }
                      onBlur={() => setEditing(null)}
                    />
                  ) : (
                    <span className="underline text-blue-600">{item.title}</span>
                  )}
                </td>

                {/* 상태 inline edit */}
                <td
                  className="py-2 px-1 text-sm cursor-pointer"
                  onClick={() => setEditing({ id: item.id, field: "status" })}
                >
                  {editing?.id === item.id && editing?.field === "status" ? (
                    <select
                      className="border rounded px-1"
                      value={item.status}
                      onChange={(e) =>
                        updateField(item.id, "status", e.target.value)
                      }
                      onBlur={() => setEditing(null)}
                    >
                      <option>리뷰</option>
                      <option>작업</option>
                      <option>업로드</option>
                      <option>추천</option>
                      <option>중복</option>
                      <option>보류</option>
                      <option>업로드대기</option>
                    </select>
                  ) : (
                    item.status
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 팝업 */}
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
