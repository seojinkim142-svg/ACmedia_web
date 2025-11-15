import { supabase } from "../supabaseClient";
import { useState } from "react";

interface Props {
  comments: any[];
  postId: number;
  onUpdate: () => void;
}

export default function CommentsSection({ comments, postId, onUpdate }: Props) {
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const saveComment = async () => {
    if (!content.trim()) return;

    await supabase.from("comments").insert({
      post_id: postId,
      content,
    });

    setContent("");
    onUpdate();
  };

  const deleteComment = async (id: number) => {
    await supabase.from("comments").delete().eq("id", id);
    onUpdate();
  };

  const saveEdit = async () => {
    await supabase.from("comments")
      .update({ content: editContent })
      .eq("id", editId);

    setEditId(null);
    setEditContent("");
    onUpdate();
  };

  return (
    <div>
      <h3 className="font-bold mb-1">댓글</h3>

      {comments.map((c) => (
        <div key={c.id} className="border p-2 rounded-md bg-gray-50 mb-2">
          {editId === c.id ? (
            <div>
              <textarea
                className="w-full border rounded p-2"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button onClick={saveEdit} className="px-3 py-1 bg-blue-600 text-white rounded">
                  저장
                </button>
                <button onClick={() => setEditId(null)} className="px-3 py-1 bg-gray-300 rounded">
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div>{c.content}</div>
              <div className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</div>

              <div className="flex gap-4 text-sm mt-2">
                <button
                  onClick={() => {
                    setEditId(c.id);
                    setEditContent(c.content);
                  }}
                  className="text-blue-600"
                >
                  수정
                </button>
                <button onClick={() => deleteComment(c.id)} className="text-red-600">
                  삭제
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <textarea
        className="w-full border rounded p-2 mt-2"
        placeholder="댓글 입력"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        onClick={saveComment}
        className="w-full mt-2 py-2 bg-blue-600 text-white rounded"
      >
        댓글 작성
      </button>
    </div>
  );
}
