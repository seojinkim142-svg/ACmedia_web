import { useState } from "react";
import { supabase } from "../supabaseClient";
import { uploadImage } from "../lib/uploadImages";

const sourceList = ["기사", "인스타", "AI", "창의"];
const statusList = ["리뷰", "작업", "업로드", "추천", "중복", "보류", "업로드대기"];

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [editor, setEditor] = useState("");

  const [source, setSource] = useState("기사");
  const [status, setStatus] = useState("리뷰");
  const [contentSource, setContentSource] = useState("");

  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const uploadImg = async (e: any) => {
    if (!e.target.files[0]) return;
    setUploading(true);
    const url = await uploadImage(e.target.files[0]);
    if (url) setImages([...images, url]);
    setUploading(false);
  };

  const saveArticle = async () => {
    const { error } = await supabase.from("articles").insert({
      title,
      summary,
      body,
      editor,
      source,
      status,
      content_source: contentSource,
      images, // TEXT[]
    });

    if (error) {
      alert("저장 실패: " + error.message);
      console.error(error);
      return;
    }

    alert("저장 완료");
    setTitle("");
    setSummary("");
    setBody("");
    setEditor("");
    setContentSource("");
    setImages([]);
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold">글쓰기</h2>

      <input className="border p-2 w-full" value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" />

      <textarea className="border p-2 w-full" value={summary} onChange={e => setSummary(e.target.value)} placeholder="요약" />

      <textarea className="border p-2 w-full h-40" value={body} onChange={e => setBody(e.target.value)} placeholder="본문" />

      <input className="border p-2 w-full" value={editor} onChange={e => setEditor(e.target.value)} placeholder="에디터" />

      <input className="border p-2 w-full" value={contentSource} onChange={e => setContentSource(e.target.value)} placeholder="콘텐츠 출처(URL)" />

      <div className="flex gap-2">
        <select value={source} onChange={e => setSource(e.target.value)} className="border p-2">
          {sourceList.map(s => <option key={s}>{s}</option>)}
        </select>

        <select value={status} onChange={e => setStatus(e.target.value)} className="border p-2">
          {statusList.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <input type="file" accept="image/*" onChange={uploadImg} />
      {uploading && <p>업로드 중...</p>}

      <button onClick={saveArticle} className="px-4 py-2 bg-blue-600 text-white rounded">
        저장하기
      </button>
    </div>
  );
}
