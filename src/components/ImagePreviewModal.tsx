import { useState } from "react";
import { supabase } from "../supabaseClient";

interface Props {
  images: string[];           // 전체 이미지 배열
  startIndex: number;         // 클릭한 이미지 index
  articleId: number;          // 삭제 시 DB 업데이트용
  onUpdate: () => void;       // 삭제 후 다시 로딩
  onClose: () => void;
}

export default function ImagePreviewModal({
  images,
  startIndex,
  articleId,
  onUpdate,
  onClose,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  if (!images || images.length === 0) return null;

  const prev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setCurrentIndex((i) => (i + 1) % images.length);

  const downloadImage = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "image.png";
    a.click();
  };

  const deleteImage = async () => {
    const newImages = images.filter((_, i) => i !== currentIndex);

    await supabase.from("articles")
      .update({ images: newImages })
      .eq("id", articleId);

    onUpdate();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-9999"
      onClick={onClose}
    >
      <div
        className="relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 좌우 이동 */}
        <button
          onClick={prev}
          className="absolute left-[-60px] top-1/2 -translate-y-1/2 bg-black/60 text-white px-4 py-3 rounded-full"
        >
          ‹
        </button>

        {/* 이미지 */}
        <img
          src={images[currentIndex]}
          className="max-w-[90vw] max-h-[80vh] rounded-lg"
        />

        <button
          onClick={next}
          className="absolute right-[-60px] top-1/2 -translate-y-1/2 bg-black/60 text-white px-4 py-3 rounded-full"
        >
          ›
        </button>

        {/* 하단 컨트롤 */}
        <div className="flex justify-between items-center mt-4">
          {/* 삭제 */}
          <button
            onClick={deleteImage}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            삭제
          </button>

          {/* 인덱스 표시 */}
          <div className="text-white mx-4">
            {currentIndex + 1} / {images.length}
          </div>

          {/* 다운로드 */}
          <button
            onClick={() => downloadImage(images[currentIndex])}
            className="px-4 py-2 bg-black/80 text-white rounded"
          >
            다운로드
          </button>
        </div>
      </div>
    </div>
  );
}
