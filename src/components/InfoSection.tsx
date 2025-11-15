import { supabase } from "../supabaseClient";
import { useState } from "react";

const sourceList = ["기사", "인스타", "AI", "창의"];
const statusList = ["리뷰", "작업", "업로드", "추천", "중복", "보류", "업로드대기"];

export default function InfoSection({ article, onUpdate }: any) {
  const [source, setSource] = useState(article.source);
  const [status, setStatus] = useState(article.status);
  const [contentSource, setContentSource] = useState(article.content_source || "");

  const save = async () => {
    await supabase
      .from("articles")
      .update({
        source,
        status,
        content_source: contentSource,
      })
      .eq("id", article.id);

    onUpdate();
    alert("저장되었습니다.");
  };

  return (
    <div className="space-y-4">

      <div>
        <h3 className="font-bold">한눈에 보기</h3>
        <p>{article.summary}</p>
      </div>

      <div>
        <h3 className="font-bold">본문</h3>
        <p className="whitespace-pre-line">{article.body}</p>
      </div>

      <div>
        <h3 className="font-bold">출처</h3>
        <select className="border p-1 rounded" value={source} onChange={(e) => setSource(e.target.value)}>
          {sourceList.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <h3 className="font-bold">콘텐츠 출처</h3>
        <input
          className="border rounded p-1 w-full"
          value={contentSource}
          onChange={(e) => setContentSource(e.target.value)}
        />
      </div>

      <div>
        <h3 className="font-bold">상태</h3>
        <select className="border p-1 rounded" value={status} onChange={(e) => setStatus(e.target.value)}>
          {statusList.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <button onClick={save} className="px-4 py-2 bg-green-600 text-white rounded">
        저장
      </button>
    </div>
  );
}
