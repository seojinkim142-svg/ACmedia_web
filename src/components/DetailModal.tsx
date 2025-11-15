import { useEffect, useState } from "react";
import ImageSection from "./ImageSection";
import InfoSection from "./InfoSection";
import { supabase } from "../supabaseClient";

export default function DetailModal({ isOpen, onClose, item }: any) {
  if (!isOpen || !item) return null;

  const [article, setArticle] = useState<any>(item);

  const loadArticle = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("id", item.id)
      .single();

    if (data) setArticle(data);
  };

  useEffect(() => {
    if (item?.id) loadArticle();
  }, [item]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl max-h-[95vh] overflow-y-auto p-6">

        {/* 제목 */}
        <h2 className="text-xl font-semibold mb-4">{article.title}</h2>

        {/* 요약 */}
        <textarea
          className="w-full border rounded p-2 mb-4"
          rows={3}
          value={article.summary || ""}
          readOnly
        />

        {/* 본문 */}
        <textarea
          className="w-full border rounded p-2 mb-4"
          rows={8}
          value={article.body || ""}
          readOnly
        />

        {/* 이미지 섹션 */}
        <ImageSection
          images={article.images || []}
          articleId={article.id}
          onUpdate={loadArticle}
        />

        {/* 정보 입력 파트 */}
        <InfoSection article={article} onUpdate={loadArticle} />

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 bg-gray-600 text-white rounded"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
