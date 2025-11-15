import { useEffect, useState } from "react";
import ImageSection from "./ImageSection";
import InfoSection from "./InfoSection";
import { supabase } from "../supabaseClient";

interface DetailProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
}

export default function DetailModal({ isOpen, onClose, item }: DetailProps) {
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
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl max-h-[95vh] overflow-y-auto p-6 relative">

        {/* ➤ 닫기 버튼 (원래 위치: 우측 상단) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl text-gray-600 hover:text-black"
        >
          ×
        </button>

        {/* ➤ 제목 */}
        <h2 className="text-xl font-semibold mb-4">{article.title}</h2>

        {/* ➤ 요약 */}
        <label className="font-semibold mb-1 block">요약</label>
        <textarea
          className="w-full border rounded p-2 mb-4"
          rows={3}
          value={article.summary || ""}
          readOnly
        />

        {/* ➤ 본문 */}
        <label className="font-semibold mb-1 block">본문</label>
        <textarea
          className="w-full border rounded p-2 mb-4"
          rows={8}
          value={article.body || ""}
          readOnly
        />

        {/* ➤ 이미지 슬라이더 + 썸네일 + 다운로드/삭제 */}
        <ImageSection
          images={article.images || []}
          articleId={article.id}
          onUpdate={loadArticle}
        />

        {/* ➤ 에디터/출처/상태 등 세팅 */}
        <InfoSection article={article} onUpdate={loadArticle} />

      </div>
    </div>
  );
}
