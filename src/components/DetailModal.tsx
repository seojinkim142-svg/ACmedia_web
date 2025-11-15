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
      setArticle(item); // ★ item 변경 즉시 article 반영
      loadArticleInfo();
      loadComments();
    }
  }, [item]);

  // ★ 팝업 열림 여부만 체크 (핵심 수정)
  if (!isOpen) return null;

  // ★ article 상태 체크 (item 대신)
  if (!article) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-start overflow-auto">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl mt-10 max-h-[90vh] overflow-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{article?.title}</h2>
          <button onClick={onClose} className="text-2xl text-gray-600">×</button>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-6">

          {/* 제목 */}
          <div>
            <label className="font-semibold">제목</label>
            <input
              className="border rounded p-2 w-full"
              value={article.title || ""}
              onChange={(e) =>
                setArticle((prev: any) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>

          {/* 요약 */}
          <div>
            <label className="font-semibold">요약</label>
            <textarea
              rows={3}
              className="border rounded p-2 w-full"
              value={article.summary || ""}
              onChange={(e) =>
                setArticle((prev: any) => ({ ...prev, summary: e.target.value }))
              }
            />
          </div>

          {/* 본문 */}
          <div>
            <label className="font-semibold">본문</label>
            <textarea
              rows={6}
              className="border rounded p-2 w-full"
              value={article.body || ""}
              onChange={(e) =>
                setArticle((prev: any) => ({ ...prev, body: e.target.value }))
              }
            />
          </div>

          {/* 이미지 슬라이더 */}
          <ImageSection
            images={article.images || []}
            articleId={article.id}
            onUpdate={loadArticleInfo}
          />

          {/* 에디터 / 출처 / 콘텐츠 출처 / 상태 */}
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
}
