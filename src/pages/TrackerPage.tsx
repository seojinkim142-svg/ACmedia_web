import { useEffect, useState } from "react";
import DetailModal from "../components/DetailModal";
import { supabase } from "../supabaseClient";
import { uploadImage } from "../lib/uploadImages";

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 사진 메뉴 (위치 + url + article id)
  const [imageMenu, setImageMenu] = useState<{
    x: number;
    y: number;
    url: string;
    id: number;
  } | null>(null);

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

    // DetailModal 동기화
    if (openItem?.id === id) {
      setOpenItem((prev) => (prev ? { ...prev, [field]: value } : prev));
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div
      className="w-full mt-6 px-6"
      onClick={() => setImageMenu(null)} // 바깥 클릭 시 메뉴 닫기
    >
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

      {/* 사진 메뉴 팝업 */}
      {imageMenu && (
        <div
          className="fixed bg-white border shadow-lg rounded z-50"
          style={{ top: imageMenu.y, left: imageMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => {
              setPreviewImage(imageMenu.url);
              setImageMenu(null);
            }}
          >
            미리보기
          </button>

          <button
            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => {
              const link = document.createElement("a");
              link.href = imageMenu.url;
              link.download = `image-${Date.now()}.png`;
              link.click();
              setImageMenu(null);
            }}
          >
            다운로드
          </button>

          <label className="block w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer">
            업로드
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={async (e) => {
                if (!e.target.files?.[0]) return;
                const url = await uploadImage(e.target.files[0]);

                const target = articles.find((a) => a.id === imageMenu.id);
                const updatedImages = target?.images?.length
                  ? [...target.images, url]
                  : [url];

                await supabase
                  .from("articles")
                  .update({ images: updatedImages })
                  .eq("id", imageMenu.id);

                loadArticles();
                setImageMenu(null);
              }}
            />
          </label>
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
                onDoubleClick={() => setOpenItem(item)} // ★ 더블클릭 → 팝업
              >
                {/* 번호 */}
                <td className="py-2 px-1 text-sm">{index + 1}</td>

                {/* 사진 */}
                <td className="py-2 px-1">
                  <img
                    src={preview}
                    className="w-14 h-14 object-cover rounded cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageMenu({
                        x: e.clientX,
                        y: e.clientY,
                        url: preview,
                        id: item.id,
                      });
                    }}
                  />
                </td>

                {/* 날짜 inline edit */}
                <td
                  className="py-2 px-1 text-sm cursor-pointer"
                  onClick={() =>
                    setEditing({ id: item.id, field: "created_at" })
                  }
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
