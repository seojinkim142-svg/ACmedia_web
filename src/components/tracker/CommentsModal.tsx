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
      alert("댓글 등록 실패: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [item.id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[520px] max-h-[640px] rounded-lg p-4 overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">메모 / 댓글 히스토리</h2>
            {item.title && <p className="text-sm text-gray-500">{item.title}</p>}
          </div>
          <button
            className="text-gray-600 hover:text-black text-xl"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {comments.length === 0 && (
            <p className="text-gray-500">등록된 메모가 없습니다.</p>
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
            placeholder="메모 또는 댓글을 입력하세요"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            onClick={addComment}
            disabled={submitting}
          >
            {submitting ? "등록 중..." : "메모 추가"}
          </button>
        </div>
      </div>
    </div>
  );
}
