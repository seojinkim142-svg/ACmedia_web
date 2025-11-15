export default function WritePage() {
  return <h1 className="text-2xl font-bold">글쓰기 페이지</h1>
}
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { uploadImage } from "../lib/uploadImages";

const sourceList = ["기사", "인스타", "AI", "창의"];
const statusList = ["리뷰", "작업", "업로드", "추천", "중복", "보류", "업로드대기"];

const WritePage = () => {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");

  const [source, setSource] = useState("기사");
  const [status, setStatus] = useState("리뷰");

  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploading(true);

    const url = await uploadImage(file);

    if (url) setImages((prev) => [...prev, url]);

    setUploading(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("제목은 필수입니다.");
      return;
    }

    const { error } = await supabase.from("articles").insert({
      title,
      summary,
      body,
      source,
      status,
      images,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error(error);
      alert("저장 중 오류가 발생했습니다.");
      return;
    }

    alert("저장되었습니다!");
    setTitle("");
    setSummary("");
    setBody("");
    setImages([]);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">작성 페이지</h1>

      <div className="space-y-4">

        <div>
          <label className="font-bold">제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded-md mt-1"
            placeholder="제목 입력"
          />
        </div>

        <div>
          <label className="font-bold">한눈에 보기</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full border p-2 rounded-md mt-1"
            placeholder="요약 입력"
            rows={3}
          />
        </div>

        <div>
          <label className="font-bold">본문</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full border p-2 rounded-md mt-1"
            placeholder="본문 입력"
            rows={6}
          />
        </div>

        <div>
          <label className="font-bold">이미지 업로드</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadImage}
            className="mt-1"
          />

          {uploading && (
            <p className="text-blue-600 text-sm mt-1">업로드 중...</p>
          )}

          {/* 업로드된 이미지 미리보기 */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                className="w-24 h-24 object-cover rounded-md border"
              />
            ))}
          </div>
        </div>

        <div>
          <label className="font-bold">출처</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="border p-2 rounded-md ml-2"
          >
            {sourceList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold">상태</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded-md ml-2"
          >
            {statusList.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-green-600 text-white py-2 rounded-md mt-4"
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default WritePage;
