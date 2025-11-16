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
}

export default function CommentsModal({ item, onClose }: CommentsModalProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);

  const loadComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", item.id)
      .order("created_at", { ascending: true });

    setComments(data || []);
  };

  useEffect(() => {
    loadComments();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] max-h-[600px] rounded-lg p-4 overflow-y-auto shadow-lg">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">메모 / 댓글 히스토리</h2>
          <button
            className="text-gray-600 hover:text-black text-xl"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {comments.length === 0 && (
            <p className="text-gray-500">댓글이 없습니다.</p>
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
      </div>
    </div>
  );
}
