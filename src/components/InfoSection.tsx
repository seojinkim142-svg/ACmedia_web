import { supabase } from "../supabaseClient";
import { useState } from "react";

const sourceList = ["기사", "인스타", "AI", "창의"];
const statusList = ["리뷰", "작업", "업로드", "추천", "중복", "보류", "업로드대기"];

interface InfoProps {
  article: any;
  onUpdate: () => void;
}

export default function InfoSection({ article, onUpdate }: InfoProps) {
  const [title, setTitle] = useState(article.title);
  const [summary, setSummary] = useState(article.summary);
  const [body, setBody] = useState(article.body);
  const [editor, setEditor] = useState(article.editor || "");
  const [source, setSource] = useState(article.source);
  const [contentSource, setContentSource] = useState(article.content_source || "");
  const [status, setStatus] = useState(article.status);

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

    onUpdate();
    alert("저장되었습니다.");
  };

  return (
    <div className="space-y-6">

      <div>
        <h3 className="font-bold mb-1">제목</h3>
        <input
          className="border rounded p-2 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <h3 className="font-bold mb-1">요약</h3>
        <textarea
          className="border rounded p-2 w-full"
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      <div>
        <h3 className="font-bold mb-1">본문</h3>
        <textarea
          className="border rounded p-2 w-full"
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <div>
        <h3 className="font-bold mb-1">에디터</h3>
        <input
          className="border rounded p-2 w-full"
          value={editor}
          onChange={(e) => setEditor(e.target.value)}
        />
      </div>

      <div>
        <h3 className="font-bold mb-1">출처</h3>
        <select
          className="border rounded p-2"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          {sourceList.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-bold mb-1">콘텐츠 출처</h3>
        <input
          className="border rounded p-2 w-full"
          value={contentSource}
          onChange={(e) => setContentSource(e.target.value)}
        />
      </div>

      <div>
        <h3 className="font-bold mb-1">상태</h3>
        <select
          className="border rounded p-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statusList.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <button
        onClick={save}
        className="px-4 py-2 w-full bg-green-600 text-white rounded"
      >
        저장
      </button>
    </div>
  );
}
