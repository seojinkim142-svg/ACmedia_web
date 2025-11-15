import { useEffect, useState } from "react";
import ImageSection from "./ImageSection";
import InfoSection from "./InfoSection";
import ImagePreviewModal from "./ImagePreviewModal";
import CommentsSection from "./CommentsSection";
import { supabase } from "../supabaseClient";

export default function DetailModal({ isOpen, onClose, item }: any) {
  const [article, setArticle] = useState<any>(item);
  const [comments, setComments] = useState<any[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const loadArticle = async () => {
    const { data } = await supabase.from("articles").select("*").eq("id", item.id).single();
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
      loadArticle();
      loadComments();
    }
  }, [item]);

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-bold text-lg">{article.title}</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>

        {/* body */}
        <div className="p-4 overflow-y-auto space-y-6">
          <ImageSection
            images={article.images || []}
            articleId={article.id}
            onUpdate={loadArticle}
            onPreview={setPreviewIndex}
          />
          <InfoSection article={article} onUpdate={loadArticle} />
          <CommentsSection comments={comments} postId={article.id} onUpdate={loadComments} />
        </div>
      </div>

      <ImagePreviewModal
        images={article.images || []}
        index={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onSelect={setPreviewIndex}
      />
    </div>
  );
}
