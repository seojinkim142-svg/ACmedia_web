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

  // ★ 팝업 여부는 isOpen만 체크해야 정상 작동
  if (!isOpen) return null;

  if (!article) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-start z-50 overflow-auto">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-hidden mt-10">

        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{article.title}</h2>
          <button onClick={onClose} className="text-2xl text-gray-600">×</button>
        </div>

        <div className="p-4 space-y-8 overflow-y-auto">

          <ImageSection
            images={article.images || []}
            articleId={article.id}
            onUpdate={loadArticleInfo}
          />

          <InfoSection article={article} onUpdate={loadArticleInfo} />

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
