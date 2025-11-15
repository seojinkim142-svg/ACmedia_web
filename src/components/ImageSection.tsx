import { useState } from "react";
import { uploadImage } from "../lib/uploadImages";
import { supabase } from "../supabaseClient";

interface Props {
  images: string[];
  articleId: number;
  onUpdate: () => void;
  onPreview?: (index: number) => void; // ← 수정됨: URL → index
}

export default function ImageSection({ images, articleId, onUpdate, onPreview }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  const next = () => {
    if (images.length === 0) return;
    setCurrentIndex((i) => (i + 1) % images.length);
  };

  const prev = () => {
    if (images.length === 0) return;
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  };

  const downloadImage = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "image.png";
    a.click();
  };

  const deleteImage = async (url: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const newImages = images.filter((img) => img !== url);

    await supabase
      .from("articles")
      .update({ images: newImages })
      .eq("id", articleId);

    onUpdate();
  };

  const uploadNewImage = async (e: any) => {
    if (!e.target.files[0]) return;
    setUploading(true);

    const url = await uploadImage(e.target.files[0]);
    if (url) {
      const newImages = [...images, url];
      await supabase
        .from("articles")
        .update({ images: newImages })
        .eq("id", articleId);

      onUpdate();
    }

    setUploading(false);
  };

  return (
    <div className="space-y-3">

      {/* ===== 이미지 슬라이더 ===== */}
      {images.length > 0 && (
        <div className="relative flex justify-center items-center">
          <button
            onClick={prev}
            className="absolute left-0 bg-black/60 text-white px-3 py-2 rounded-full"
          >
            ‹
          </button>

          <img
            src={images[currentIndex]}
            className="w-64 h-64 object-cover rounded-lg cursor-pointer"
            onClick={() => onPreview?.(currentIndex)} // ← index 전달
          />

          <button
            onClick={next}
            className="absolute right-0 bg-black/60 text-white px-3 py-2 rounded-full"
          >
            ›
          </button>
        </div>
      )}

      {/* ===== 다운로드 / 삭제 버튼 ===== */}
      {images.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => downloadImage(images[currentIndex])}
            className="px-3 py-1 bg-gray-800 text-white rounded-md"
          >
            다운로드
          </button>

          <button
            onClick={() => deleteImage(images[currentIndex])}
            className="px-3 py-1 bg-red-600 text-white rounded-md"
          >
            삭제
          </button>
        </div>
      )}

      {/* ===== 썸네일 리스트 ===== */}
      {images.length > 0 && (
        <div className="flex justify-center gap-2">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setCurrentIndex(i)}
              className={`w-14 h-14 object-cover cursor-pointer border rounded-md ${
                i === currentIndex ? "border-blue-500" : "border-gray-300"
              }`}
            />
          ))}
        </div>
      )}

      {/* ===== 이미지 업로드 ===== */}
      <div>
        <input type="file" accept="image/*" onChange={uploadNewImage} />
        {uploading && <div className="text-sm text-blue-600">업로드 중...</div>}
      </div>
    </div>
  );
}
