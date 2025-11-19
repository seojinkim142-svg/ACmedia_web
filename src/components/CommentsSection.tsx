import { useState } from "react";
import { supabase } from "../supabaseClient";

interface Props {
  comments: any[];
  postId: number;
  onUpdate: () => void;
}

export default function CommentsSection({ comments, postId, onUpdate }: Props) {
  const [text, setText] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // ?볤? 異붽?
  const addComment = async () => {
    if (!text.trim()) return;

    await supabase.from("comments").insert({
      post_id: postId,
      content: text,
    });

    setText("");
    onUpdate();
  };

  // ?볤? ??젣
  const deleteComment = async (id: number) => {
    await supabase.from("comments").delete().eq("id", id);
    onUpdate();
  };

  // ?볤? ?섏젙 ???
  const saveEdit = async () => {
    await supabase.from("comments").update({ content: editText }).eq("id", editId);
    setEditId(null);
    setEditText("");
    onUpdate();
  };

  return (
    <div className="w-full space-y-3">
      <h3 className="text-lg font-semibold">?볤?</h3>

      {/* ?볤? 紐⑸줉 */}
      {comments.map((c) => (
        <div key={c.id} className="border rounded p-3 bg-gray-50">

          {/* ?섏젙 以묒씤 寃쎌슦 */}
          {editId === c.id ? (
            <>
              <textarea
                className="w-full border rounded p-2"
                rows={3}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveEdit}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  ???
                </button>
                <button
                  onClick={() => {
                    setEditId(null);
                    setEditText("");
                  }}
                  className="px-3 py-1 bg-gray-300 rounded"
                >
                  痍⑥냼
                </button>
              </div>
            </>
          ) : (
            <>
              {/* ?볤? ?댁슜 */}
              <div className="text-sm">{c.content}</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(c.created_at).toLocaleString()}
              </div>

              {/* ?섏젙 / ??젣 踰꾪듉 */}
              <div className="flex gap-3 text-sm mt-2">
                <button
                  onClick={() => {
                    setEditId(c.id);
                    setEditText(c.content);
                  }}
                  className="text-blue-600"
                >
                  ?섏젙
                </button>

                <button
                  onClick={() => deleteComment(c.id)}
                  className="text-red-600"
                >
                  ??젣
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {/* ?볤? ?묒꽦 */}
      <textarea
        className="border rounded p-2 w-full"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="?볤? ?낅젰"
      />

      <button
        onClick={addComment}
        className="px-4 py-2 bg-blue-600 text-white rounded w-full"
      >
        ?묒꽦
      </button>
    </div>
  );
}

