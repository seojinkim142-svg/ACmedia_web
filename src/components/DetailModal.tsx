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
  const [previewData, setPreviewData] = useState<any>(null);

  const loadArticleInfo = async () => {
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
    loadArticleInfo();
    loadComments();
  }, [item]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-5000">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">

        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{article.title}</h2>
          <button className="text-2xl text-gray-600" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-8">

          <div>
            <h3 className="font-bold mb-1">요약</h3>
            <p>{article.summary}</p>
          </div>

          <div>
            <h3 className="font-bold mb-1">본문</h3>
            <p className="whitespace-pre-line">{article.body}</p>
          </div>

          <ImageSection
            images={article.images || []}
            articleId={article.id}
            onUpdate={loadArticleInfo}
            onPreview={(idx: number) =>
              setPreviewData({
                images: article.images,
                index: idx,
                articleId: article.id,
              })
            }
          />

          <InfoSection article={article} onUpdate={loadArticleInfo} />

          <CommentsSection comments={comments} postId={article.id} onUpdate={loadComments} />
        </div>
      </div>

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
