import { supabase } from "../supabaseClient";
import { useState } from "react";

const sources = ["기사", "인스타", "AI", "창의"];
const statuses = ["리뷰", "작업", "업로드", "추천", "중복", "보류", "업로드대기"];

export default function InfoSection({ article, onUpdate }: any) {
  const [editor, setEditor] = useState(article.editor || "");
  const [source, setSource] = useState(article.source || "");
  const [contentSource, setContentSource] = useState(article.content_source || "");
  const [status, setStatus] = useState(article.status || "");

  const save = async () => {
    await supabase
      .from("articles")
      .update({
        editor,
        source,
        content_source: contentSource,
        status,
      })
      .eq("id", article.id);

    onUpdate();
    alert("저장되었습니다.");
  };

  return (
    <div className="space-y-4">

      <div>
        <label className="font-semibold">에디터</label>
        <input
          className="border rounded p-2 w-full"
          value={editor}
          onChange={(e) => setEditor(e.target.value)}
        />
      </div>

      <div>
        <label className="font-semibold">출처</label>
        <select
          className="border rounded p-2 w-full"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          {sources.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="font-semibold">콘텐츠 출처</label>
        <input
          className="border rounded p-2 w-full"
          value={contentSource}
          onChange={(e) => setContentSource(e.target.value)}
        />
      </div>

      <div>
        <label className="font-semibold">상태</label>
        <select
          className="border rounded p-2 w-full"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <button
        className="w-full py-2 bg-green-600 text-white rounded"
        onClick={save}
      >
        저장
      </button>
    </div>
  );
}
