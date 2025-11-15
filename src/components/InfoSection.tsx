import { supabase } from "../supabaseClient";
import { useState } from "react";

const sourceList = ["기사", "인스타", "AI", "창의"];
const statusList = ["리뷰", "작업", "업로드", "추천", "중복", "보류", "업로드대기"];

export default function InfoSection({ article, onUpdate }: any) {
  const [title, setTitle] = useState(article.title || "");
  const [summary, setSummary] = useState(article.summary || "");
  const [body, setBody] = useState(article.body || "");
  const [editor, setEditor] = useState(article.editor || "");
  const [source, setSource] = useState(article.source || "기사");
  const [contentSource, setContentSource] = useState(article.content_source || "");
  const [status, setStatus] = useState(article.status || "리뷰");

  const save = async () => {
    await supabase
      .from("articles")
      .update({
        title,
        summary,
        body,
        editor,
        source,
        content_source: contentSource,
        status,
      })
      .eq("id", article.id);

    alert("저장되었습니다.");
    onUpdate();
  };

  return (
    <div className="space-y-4">

      <div>
        <label className="font-semibold">제목</label>
        <input
          className="border p-2 rounded w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="font-semibold">요약</label>
        <textarea
          className="border p-2 rounded w-full"
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      <div>
        <label className="font-semibold">본문</label>
        <textarea
          className="border p-2 rounded w-full"
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <div>
        <label className="font-semibold">에디터</label>
        <input
          className="border p-2 rounded w-full"
          value={editor}
          onChange={(e) => setEditor(e.target.value)}
        />
      </div>

      <div>
        <label className="font-semibold">출처</label>
        <select
          className="border p-2 rounded w-full"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          {sourceList.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="font-semibold">콘텐츠 출처</label>
        <input
          className="border p-2 rounded w-full"
          value={contentSource}
          onChange={(e) => setContentSource(e.target.value)}
        />
      </div>

      <div>
        <label className="font-semibold">상태</label>
        <select
          className="border p-2 rounded w-full"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statusList.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <button
        className="bg-green-600 text-white py-2 rounded w-full"
        onClick={save}
      >
        저장
      </button>
    </div>
  );
}
