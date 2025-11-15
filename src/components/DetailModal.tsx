import { useEffect, useState } from "react";
import ImageSection from "./ImageSection";
import InfoSection from "./InfoSection";
import CommentsSection from "./CommentsSection";
import { supabase } from "../supabaseClient";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
}

export default function DetailModal({ isOpen, onClose, item }: DetailModalProps) {
  const [article, setArticle] = useState<any>(item);
  const [comments, setComments] = useState<any[]>([]);

  const loadArticleInfo = async () => {
    if (!item?.id) return;

    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("id", item.id)
      .single();

    if (data) setArticle(data);
  };

  const loadComments = async () => {
    if (!item?.id) return;

    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", item.id)
      .order("created_at", { ascending: true });

    if (data) setComments(data);
  };

  useEffect(() => {
    if (item?.id) {
      setArticle(item);
      loadArticleInfo();
      loadComments();
    }
  }, [item]);

  /** 팝업 자체가 열려있는지만 판단 */
  if (!isOpen) return null;
  if (!article) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-start z-50 overflow-hidden">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto mt-10">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{article?.title}</h2>
          <button onClick={onClose} className="text-2xl text-gray-600">×</button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-10">

          {/* 1) 제목 + 요약 + 본문 + 에디터 + 출처 + 상태 */}
          <InfoSection article={article} onUpdate={loadArticleInfo} />

          {/* 2) 이미지 (슬라이더 + 다운로드 + 삭제 + 썸네일 + 업로드) */}
          <ImageSection
            images={article.images || []}
            articleId={article.id}
            onUpdate={loadArticleInfo}
          />

          {/* 3) 댓글 */}
          <CommentsSection
            comments={comments}
            postId={article.id}
            onUpdate={loadComments}
          />
        </div>
      </div>
    </div>
  );
}
