import { useState } from "react";
import { supabase } from "../supabaseClient";
import { uploadImage } from "../lib/uploadImages";

const sourceList = ["기사", "뉴스", "AI", "창의"];
const statusList = [
  "리뷰",
  "추천",
  "보류",
  "본문 작성",
  "본문 완료",
  "썸네일 작성",
  "썸네일 완료",
  "업로드 예정",
  "업로드 완료",
  "중복",
];

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [editor, setEditor] = useState("");
  const [source, setSource] = useState("기사");
  const [contentSource, setContentSource] = useState("");

  // 추가 필드
  const [sourceUrl, setSourceUrl] = useState("");
  const [bgm, setBgm] = useState("");

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

      // 추가 필드 저장
      source_url: sourceUrl,
      bgm,

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
    setSourceUrl("");
    setBgm("");
    setStatus("리뷰");
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-start w-full px-6 mt-6 gap-4">
        <label className="font-semibold">제목</label>
        <input className="border rounded p-2 w-full" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label className="font-semibold">요약</label>
        <textarea
          className="border rounded p-2 w-full"
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />

        <label className="font-semibold">본문</label>
        <textarea
          className="border rounded p-2 w-full"
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <label className="font-semibold">이미지 업로드</label>
        <input type="file" accept="image/*" onChange={uploadNewImage} />

        <div className="flex gap-2 flex-wrap mt-2">
          {images.map((img, i) => (
            <img key={i} src={img} className="w-20 h-20 object-cover border rounded" />
          ))}
        </div>

        <label className="font-semibold">에디터</label>
        <select className="border rounded p-2 w-full" value={editor} onChange={(e) => setEditor(e.target.value)}>
          <option value="">선택해주세요</option>
          <option value="지수">지수</option>
          <option value="지민">지민</option>
          <option value="아라">아라</option>
          <option value="서진">서진</option>
        </select>

        <label className="font-semibold">출처</label>
        <select className="border rounded p-2 w-full" value={source} onChange={(e) => setSource(e.target.value)}>
          {sourceList.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <label className="font-semibold">콘텐츠 출처</label>
        <input
          className="border rounded p-2 w-full"
          value={contentSource}
          onChange={(e) => setContentSource(e.target.value)}
        />

        <label className="font-semibold">출처 URL</label>
        <input
          className="border rounded p-2 w-full"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
        />

        <label className="font-semibold">BGM 자료</label>
        <input className="border rounded p-2 w-full" value={bgm} onChange={(e) => setBgm(e.target.value)} />

        <label className="font-semibold">상태</label>
        <select className="border rounded p-2 w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
          {statusList.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <button className="px-6 py-3 bg-green-600 text-white rounded mt-4" onClick={saveArticle}>
          저장
        </button>
      </div>
    </div>
  );
}
