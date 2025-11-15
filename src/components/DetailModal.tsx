import { useEffect, useState } from "react";
import ImageSection from "./ImageSection";
import InfoSection from "./InfoSection";
import CommentsSection from "./CommentsSection";
import { supabase } from "../supabaseClient";

const DEFAULT_IMAGE = "https://placehold.co/120x120?text=No+Image";

interface Article {
  id: number;
  title: string;
  summary: string;
  body: string;
  source: string;
  status: string;
  editor: string | null;
  content_source: string | null;
  images: string[] | null;
  created_at: string;
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Article | null;
}

const DetailModal = ({ isOpen, onClose, item }: DetailModalProps) => {
  if (!isOpen || !item) return null;

  const [article, setArticle] = useState<Article>(item);
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

        {/* BODY */}
        <div className="p-4 overflow-y-auto space-y-6">

          {/* 요약 */}
          <div>
            <textarea
              readOnly
              className="w-full border rounded p-2 text-sm h-20"
              value={article.summary || ""}
              placeholder="요약"
            />
          </div>

          {/* 본문 */}
          <div>
            <textarea
              readOnly
              className="w-full border rounded p-2 text-sm h-48 whitespace-pre-line"
              value={article.body || ""}
              placeholder="본문"
            />
          </div>

          {/* 이미지 */}
          <ImageSection
            images={article.images?.length ? article.images : [DEFAULT_IMAGE]}
            articleId={article.id}
            onUpdate={loadArticleInfo}
          />

          {/* 출처 / 에디터 / 상태 / 저장 */}
          <InfoSection article={article} onUpdate={loadArticleInfo} />

          {/* 댓글 */}
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
