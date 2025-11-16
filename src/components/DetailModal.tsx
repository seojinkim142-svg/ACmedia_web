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

  if (!isOpen) return null;
  if (!article) return null;

  const handleSave = async () => {
    await supabase
      .from("articles")
      .update({
        title: article.title,
        summary: article.summary,
        body: article.body,
        source: article.source,
        status: article.status,
        content_source: article.content_source,
        editor: article.editor,
        images: article.images,
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id);

    alert("저장되었습니다.");
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-9000 flex justify-center items-start overflow-auto">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl mt-10 max-h-[90vh] overflow-hidden flex flex-col">

        {/* HEADER  — 제목 / 저장 / 닫기 */}
        <div className="relative border-b px-4 py-3 flex items-center">

          {/* 제목 */}
          <h2 className="text-xl font-bold pr-32">{article.title}</h2>

          {/* 저장 버튼 (항상 우측 상단 고정) */}
          <button
            onClick={handleSave}
            className="absolute right-14 top-3 bg-green-600 text-white px-4 py-2 rounded shadow"
          >
            저장
          </button>

          {/* 닫기 버튼 (고정) */}
          <button
            onClick={onClose}
            className="absolute right-4 top-3 text-2xl text-gray-600"
          >
            ×
          </button>
        </div>

        {/* BODY — 스크롤 가능 */}
        <div className="p-4 space-y-6 overflow-y-auto">

          {/* 제목 수정 */}
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

          {/* 이미지 슬라이더 + 팝업 + 업로드 */}
          <ImageSection
            images={article.images || []}
            articleId={article.id}
            onUpdate={loadArticleInfo}
          />

          {/* 출처 / 상태 / 콘텐츠 출처 / 에디터 */}
          <InfoSection article={article} onUpdate={loadArticleInfo} />

          {/* 댓글 전체 */}
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
