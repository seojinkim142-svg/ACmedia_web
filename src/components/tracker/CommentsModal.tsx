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
  onAfterClose?: () => void;
}

const PAGE_SIZE = 4;

export default function CommentsModal({ item, onClose, onUpdated, onAfterClose }: CommentsModalProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("id,content,created_at")
      .eq("post_id", item.id)
      .order("created_at", { ascending: false });

    if (error) {
      alert("댓글을 불러오지 못했습니다. " + error.message);
      return;
    }

    setComments(data || []);
    setCurrentPage(1);
  };

  const addComment = async () => {
    if (!newComment.trim()) {
      alert("댓글 내용을 입력해주세요.");
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
      alert("댓글 추가 오류: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [item.id]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        onAfterClose?.();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onAfterClose, onClose]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(comments.length / PAGE_SIZE));
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [comments]);

  const handleClose = () => {
    onClose();
    onAfterClose?.();
  };

  const totalPages = Math.max(1, Math.ceil(comments.length / PAGE_SIZE));
  const pageNumbers = Array.from({ length: totalPages }, (_, idx) => idx + 1);
  const paginatedComments = comments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999"
      onClick={handleClose}
    >
      <button
        className="fixed top-6 right-6 text-white text-3xl z-10000 hover:text-gray-300"
        onClick={handleClose}
        aria-label="닫기"
      >
        ×
      </button>

      <div
        className="bg-white w-[520px] max-h-[640px] rounded-lg p-4 overflow-y-auto shadow-lg relative"
        onClick={(e) => e.stopPropagation()} // 모달 밖 클릭 시 배경 닫힘 방지
      >
        <div className="pr-8 mb-4">
          <h2 className="text-xl font-semibold">댓글 히스토리</h2>
          {item.title && <p className="text-sm text-gray-500 wrap-break-words">{item.title}</p>}
        </div>

        <div className="mt-2 border rounded-lg p-3 bg-gray-50">
          <p className="text-sm font-medium mb-2">새 댓글</p>
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={3}
            placeholder="댓글을 입력해주세요"
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

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">총 {comments.length}개</div>
          <div className="flex gap-2">
            {pageNumbers.map((num) => (
              <button
                key={num}
                className={`min-w-[36px] h-9 rounded border text-sm transition ${
                  num === currentPage
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 mt-3">
          {comments.length === 0 && <p className="text-gray-500">등록된 댓글이 없습니다.</p>}

          {paginatedComments.map((c) => (
            <div key={c.id} className="border rounded p-3 bg-gray-50">
              <p className="whitespace-pre-wrap text-sm">{c.content}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(c.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
