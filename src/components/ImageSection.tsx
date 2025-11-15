import { useState } from "react";
import { supabase } from "../supabaseClient";
import { uploadImage } from "../lib/uploadImages";

interface Props {
  images: string[];
  articleId: number;
  onUpdate: () => void;
}

export default function ImageSection({ images, articleId, onUpdate }: Props) {
  const [index, setIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null); // ★ 이미지 팝업 복구

  const current =
    images.length > 0
      ? images[index]
      : "https://placehold.co/120x120?text=No+Image";

  // 이미지 삭제
  const deleteImage = async () => {
    const updated = images.filter((_, i) => i !== index);

    await supabase
      .from("articles")
      .update({ images: updated })
      .eq("id", articleId);

    onUpdate();
  };

  // 다운로드
  const downloadImage = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `image-${Date.now()}.png`;
    link.click();
  };

  // 이미지 업로드
  const uploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const url = await uploadImage(e.target.files[0]);
    const updated = [...images, url];

    await supabase
      .from("articles")
      .update({ images: updated })
      .eq("id", articleId);

    onUpdate();
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">

      {/* ★ 이미지 단독 팝업 */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 z-9999 flex justify-center items-center"
          onClick={() => setPreviewImage(null)}   // 배경 클릭 → 닫기
        >
          <img
            src={previewImage}
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-xl"
          />
        </div>
      )}

      {/* 큰 이미지 */}
      <img
        src={current}
        className="w-64 h-64 object-cover border rounded cursor-pointer"
        onClick={() => setPreviewImage(current)}   // ★ 클릭 → 이미지 팝업 열기
      />

      {/* 좌우 버튼 */}
      <div className="flex gap-6">
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded"
          onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
        >
          &lt;
        </button>

        <button
          className="px-4 py-2 bg-gray-700 text-white rounded"
          onClick={() => setIndex((i) => (i + 1) % images.length)}
        >
          &gt;
        </button>
      </div>

      {/* 다운로드 & 삭제 */}
      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => downloadImage(current)}   // ★ 원래 기능
        >
          다운로드
        </button>

        <button
          onClick={deleteImage}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          삭제
        </button>
      </div>

      {/* 썸네일 */}
      <div className="flex gap-2 flex-wrap justify-center">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            className={`w-12 h-12 border rounded cursor-pointer ${
              i === index ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

      {/* 업로드 */}
      <input type="file" accept="image/*" onChange={uploadNew} />
    </div>
  );
}
