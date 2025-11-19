import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

interface CommentItem {
  id: number;
  content: string;
  created_at: string;
}

interface CommentsModalProps {
  item: { id: number; title?: string };
  onClose: () => void;
  onUpdated?: () => void;
}

export default function CommentsModal({ item, onClose, onUpdated }: CommentsModalProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("id,content,created_at")
      .eq("post_id", item.id)
      .order("created_at", { ascending: false });

    if (error) {
      alert("댓글을 불러오지 못했습니다: " + error.message);
      return;
    }

    setComments(data || []);
  };

  const addComment = async () => {
    if (!newComment.trim()) {
      alert("댓글 내용을 입력하세요.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: item.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      await loadComments();
      onUpdated?.();
    } catch (err) {
      alert("댓글 저장 오류: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [item.id]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999"
      onClick={onClose}   // 팝업 밖 클릭 시 닫힘
    >
      {/* X 버튼을 화면 우측 상단에 완전 고정 */}
      <button
        className="fixed top-6 right-6 text-white text-3xl z-10000 hover:text-gray-300"
        onClick={onClose}
        aria-label="닫기"
      >
        ×
      </button>

      {/* 모달 본체 */}
      <div
        className="bg-white w-[520px] max-h-[640px] rounded-lg p-4 overflow-y-auto shadow-lg relative"
        onClick={(e) => e.stopPropagation()}  // 내부 클릭 시 닫힘 방지
      >
        <div className="pr-8 mb-4">
          <h2 className="text-xl font-semibold">댓글 히스토리</h2>
          {item.title && (
            <p className="text-sm text-gray-500 wrap-break-words">{item.title}</p>
          )}
        </div>

        <div className="space-y-3">
          {comments.length === 0 && (
            <p className="text-gray-500">등록된 댓글이 없습니다.</p>
          )}

          {comments.map((c) => (
            <div key={c.id} className="border rounded p-3 bg-gray-50">
              <p className="whitespace-pre-wrap text-sm">{c.content}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(c.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t pt-4">
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={3}
            placeholder="댓글을 입력하세요"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            onClick={addComment}
            disabled={submitting}
          >
            {submitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
