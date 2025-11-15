import { useState } from "react";
import { supabase } from "../supabaseClient";
import { uploadImage } from "../lib/uploadImages";

const sourceList = ["기사", "인스타", "AI", "창의"];
const statusList = ["리뷰", "작업", "업로드", "추천", "중복", "보류", "업로드대기"];

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [editor, setEditor] = useState("");      // ← 추가됨
  const [source, setSource] = useState("기사");
  const [status, setStatus] = useState("리뷰");
  const [images, setImages] = useState<string[]>([]);

  
  const uploadNewImage = async (e: any) => {
    if (!e.target.files[0]) return;
    const url = await uploadImage(e.target.files[0]);
    if (url) setImages((prev) => [...prev, url]);
  };

const saveArticle = async () => {
  const { data, error } = await supabase.from("articles").insert({
    title,
    summary,
    body,
    editor,
    source,
    status,
    images,
  });

  console.log("data:", data);
  console.log("error:", error);

  if (error) {
    alert("DB 오류: " + error.message);
    return;
  }

  alert("저장 완료");
};


  return (
    <div className="max-w-xl mx-auto mt-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">새 글 작성</h1>

      <input
        className="w-full border p-2 rounded"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="에디터"
        value={editor}
        onChange={(e) => setEditor(e.target.value)}
      />

      <textarea
        className="w-full border p-2 rounded"
        rows={3}
        placeholder="요약"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />

      <textarea
        className="w-full border p-2 rounded"
        rows={7}
        placeholder="본문"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <div>
        <span className="font-semibold mr-2">출처</span>
        <select className="border p-1 rounded" value={source} onChange={(e) => setSource(e.target.value)}>
          {sourceList.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <span className="font-semibold mr-2">상태</span>
        <select className="border p-1 rounded" value={status} onChange={(e) => setStatus(e.target.value)}>
          {statusList.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <span className="font-semibold">이미지</span>
        <input type="file" accept="image/*" onChange={uploadNewImage} className="block mt-1" />

        <div className="flex gap-2 mt-2">
          {images.map((img, idx) => (
            <img key={idx} src={img} className="w-16 h-16 object-cover rounded" />
          ))}
        </div>
      </div>

      <button onClick={saveArticle} className="w-full py-2 bg-blue-600 text-white rounded">
        저장
      </button>
    </div>
  );
}
