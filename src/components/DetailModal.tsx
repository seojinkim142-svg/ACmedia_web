import { useEffect, useState } from "react";
import ImageSection from "./ImageSection";
import InfoSection from "./InfoSection";
import CommentsSection from "./CommentsSection";
import ImagePreviewModal from "./ImagePreviewModal";

import { supabase } from "../supabaseClient";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
}

const DetailModal = ({ isOpen, onClose, item }: DetailModalProps) => {
  if (!isOpen || !item) return null;

  const [article, setArticle] = useState<any>(item);
  const [comments, setComments] = useState<any[]>([]);

  const [previewData, setPreviewData] = useState<{
    images: string[];
    index: number;
    articleId: number;
  } | null>(null);

  const loadArticleInfo = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("id", item.id)
      .single();

    if (data) setArticle(data);
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", item.id)
      .order("created_at", { ascending: true });

    if (data) setComments(data);
  };

  useEffect(() => {
    if (item?.id) {
      loadArticleInfo();
      loadComments();
    }
  }, [item]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-5000">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{article.title}</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl">
            ×
          </button>
        </div>

        {/* ===== BODY ===== */}
        <div className="p-4 overflow-y-auto space-y-8">

          {/* 요약 */}
          <div>
            <h3 className="font-bold mb-1">한눈에 보기</h3>
            <p>{article.summary}</p>
          </div>

          {/* 본문 */}
          <div>
            <h3 className="font-bold mb-1">본문</h3>
            <p className="whitespace-pre-line">{article.body}</p>
          </div>

          {/* 이미지 섹션 */}
          <ImageSection
            images={article.images || []}
            articleId={article.id}
            onUpdate={loadArticleInfo}
            onPreview={(url) => {
              const idx = article.images.indexOf(url);
              setPreviewData({
                images: article.images,
                index: idx,
                articleId: article.id,
              });
            }}
          />

          {/* 출처/상태 */}
          <InfoSection article={article} onUpdate={loadArticleInfo} />

          {/* 댓글 */}
          <CommentsSection
            comments={comments}
            postId={article.id}
            onUpdate={loadComments}
          />
        </div>
      </div>

      {/* 이미지 프리뷰 */}
      {previewData && (
        <ImagePreviewModal
          images={previewData.images}
          startIndex={previewData.index}
          articleId={previewData.articleId}
          onUpdate={loadArticleInfo}
          onClose={() => setPreviewData(null)}
        />
      )}
    </div>
  );
};

export default DetailModal;
