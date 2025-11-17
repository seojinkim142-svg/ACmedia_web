import { useEffect, useState } from "react";
import ImageSection from "./ImageSection";
import InfoSection from "./InfoSection";
import CommentsSection from "./CommentsSection";
import { supabase } from "../supabaseClient";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
  onUpdated?: (updated: any) => void;
}

export default function DetailModal({ isOpen, onClose, item, onUpdated }: DetailModalProps) {
  const [article, setArticle] = useState<any>(item);
  const [comments, setComments] = useState<any[]>([]);

  const loadArticleInfo = async () => {
    if (!item?.id) return;

    const { data } = await supabase.from("articles").select("*").eq("id", item.id).single();
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

  if (!isOpen || !article) return null;

  const handleSave = async () => {
    const { data, error } = await supabase
      .from("articles")
      .update({
        title: article.title,
        summary: article.summary,
        body: article.body,
        source: article.source,
        status: article.status,
        content_source: article.content_source,
        editor: article.editor,
        bgm: article.bgm || "",
        images: article.images,
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id)
      .select()
      .single();

    if (error) {
      alert("저장에 실패했습니다: " + error.message);
      return;
    }

    if (data) setArticle(data);
    onUpdated?.(data);
    alert("변경 사항이 저장되었습니다.");
  };

  return (
    <div className="fixed inset-0 z-9000 bg-black/40 backdrop-blur-sm px-4 py-6 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="relative px-6 py-4 border-b bg-white">
          <div className="flex flex-col gap-1 pr-36">
            <p className="text-xs uppercase tracking-widest text-gray-400">기사 상세</p>
            <h2 className="text-2xl font-semibold truncate text-gray-900">
              {article.title || "제목 없음"}
            </h2>
          </div>
          <div className="absolute inset-y-0 right-4 flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-semibold transition"
            >
              저장
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 flex items-center justify-center text-lg"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-6">
          <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
            <div>
              <label className="font-semibold text-sm text-gray-600">제목</label>
              <input
                className="mt-1 border border-gray-200 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={article.title || ""}
                onChange={(e) => setArticle((prev: any) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="font-semibold text-sm text-gray-600">요약</label>
              <textarea
                rows={3}
                className="mt-1 border border-gray-200 rounded-lg p-3 w-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={article.summary || ""}
                onChange={(e) => setArticle((prev: any) => ({ ...prev, summary: e.target.value }))}
              />
            </div>

            <div>
              <label className="font-semibold text-sm text-gray-600">본문</label>
              <textarea
                rows={6}
                className="mt-1 border border-gray-200 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={article.body || ""}
                onChange={(e) => setArticle((prev: any) => ({ ...prev, body: e.target.value }))}
              />
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm p-5">
            <ImageSection images={article.images || []} articleId={article.id} onUpdate={loadArticleInfo} />
          </section>

          <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
            <InfoSection article={article} onUpdate={loadArticleInfo} />
            <div>
              <label className="font-semibold text-sm text-gray-600">BGM</label>
              <input
                className="mt-1 border border-gray-200 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={article.bgm || ""}
                onChange={(e) => setArticle((prev: any) => ({ ...prev, bgm: e.target.value }))}
              />
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm p-5">
            <CommentsSection comments={comments} postId={article.id} onUpdate={loadComments} />
          </section>
        </div>

        <div className="px-6 py-4 border-t bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            닫기
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-full bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition"
          >
            변경 사항 저장
          </button>
        </div>
      </div>
    </div>
  );
}
