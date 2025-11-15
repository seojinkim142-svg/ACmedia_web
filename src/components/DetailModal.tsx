import { useEffect, useState } from "react";
import ImageSection from "./ImageSection.tsx";
import InfoSection from "./InfoSection.tsx";
import CommentsSection from "./CommentsSection.tsx";

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{article.title}</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl">×</button>
        </div>

        {/* BODY SCROLL */}
        <div className="p-4 overflow-y-auto space-y-6">

          <ImageSection
            images={article.images || []}
            articleId={article.id}
            onUpdate={loadArticleInfo}
          />

          <InfoSection
            article={article}
            onUpdate={loadArticleInfo}
          />

          <CommentsSection
            comments={comments}
            postId={article.id}
            onUpdate={loadComments}
          />

        </div>
      </div>
    </div>
  );
};

export default DetailModal;
