import { useState } from "react";
import { supabase } from "../supabaseClient";
import { uploadImage } from "../lib/uploadImages";

const sourceList = ["기사", "인스타", "AI", "창의"];
const statusList = ["리뷰", "작업", "업로드", "추천", "중복", "보류", "업로드대기"];

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [editor, setEditor] = useState("");
  const [source, setSource] = useState("기사");
  const [contentSource, setContentSource] = useState("");
  const [status, setStatus] = useState("리뷰");

  const uploadNewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const url = await uploadImage(e.target.files[0]);
    if (url) setImages((prev) => [...prev, url]);
  };

  const saveArticle = async () => {
    await supabase.from("articles").insert({
      title,
      summary,
      body,
      images,
      editor,
      source,
      content_source: contentSource,
      status,
    });

    alert("저장되었습니다!");
    setTitle("");
    setSummary("");
    setBody("");
    setImages([]);
    setEditor("");
    setSource("기사");
    setContentSource("");
    setStatus("리뷰");
  };

  return (
    <div className="w-full">

      {/* 전체 좌측 정렬 */}
      <div className="flex flex-col items-start w-full px-6 mt-6 gap-4">

        {/* 제목 */}
        <label className="font-semibold">제목</label>
        <input
          className="border rounded p-2 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 요약 */}
        <label className="font-semibold">요약</label>
        <textarea
          className="border rounded p-2 w-full"
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />

        {/* 본문 */}
        <label className="font-semibold">본문</label>
        <textarea
          className="border rounded p-2 w-full"
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        {/* 이미지 업로드 */}
        <label className="font-semibold">이미지 업로드</label>
        <input type="file" accept="image/*" onChange={uploadNewImage} />

        {/* 업로드된 이미지 썸네일 */}
        <div className="flex gap-2 flex-wrap mt-2">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              className="w-20 h-20 object-cover border rounded"
            />
          ))}
        </div>

        {/* 에디터 */}
        <label className="font-semibold">에디터</label>
        <input
          className="border rounded p-2 w-full"
          value={editor}
          onChange={(e) => setEditor(e.target.value)}
        />

        {/* 출처 */}
        <label className="font-semibold">출처</label>
        <select
          className="border rounded p-2 w-full"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          {sourceList.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        {/* 콘텐츠 출처 */}
        <label className="font-semibold">콘텐츠 출처</label>
        <input
          className="border rounded p-2 w-full"
          value={contentSource}
          onChange={(e) => setContentSource(e.target.value)}
        />

        {/* 상태 */}
        <label className="font-semibold">상태</label>
        <select
          className="border rounded p-2 w-full"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statusList.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        {/* 저장 버튼 */}
        <button
          className="px-6 py-3 bg-green-600 text-white rounded mt-4"
          onClick={saveArticle}
        >
          저장
        </button>
      </div>
    </div>
  );
}
