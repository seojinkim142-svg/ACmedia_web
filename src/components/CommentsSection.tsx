import { useState } from "react";
import { supabase } from "../supabaseClient";

interface Props {
  comments: any[];
  postId: number;
  onUpdate: () => void;
}

export default function CommentsSection({ comments, postId, onUpdate }: Props) {
  const [text, setText] = useState("");

  const save = async () => {
    if (!text.trim()) return;

    await supabase.from("comments").insert({
      post_id: postId,
      content: text,
    });

    setText("");
    onUpdate();
  };

  return (
    <div className="w-full space-y-3">
      <h3 className="text-lg font-semibold">댓글</h3>

      {comments.map((c, i) => (
        <div key={i} className="border p-2 rounded bg-gray-50">
          {c.content}
        </div>
      ))}

      <textarea
        className="border rounded p-2 w-full"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={save}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        등록
      </button>
    </div>
  );
}
