import { useState } from "react";
import { supabase } from "../supabaseClient";
import { uploadImage } from "../lib/uploadImages";

interface ImageSectionProps {
  images: string[];
  articleId: number;
  onUpdate: () => void;
}

export default function ImageSection({
  images,
  articleId,
  onUpdate,
}: ImageSectionProps) {
  const [index, setIndex] = useState<number>(0);
  const [preview, setPreview] = useState<string | null>(null);

  const next = () => {
    if (images.length > 0) {
      setIndex((prev: number) => (prev + 1) % images.length);
    }
  };

  const prev = () => {
    if (images.length > 0) {
      setIndex((prev: number) => (prev - 1 + images.length) % images.length);
    }
  };

  const downloadImg = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "image.png";
    a.click();
  };

  const deleteImg = async () => {
    const newList = images.filter((_, i: number) => i !== index);

    await supabase
      .from("articles")
      .update({ images: newList })
      .eq("id", articleId);

    onUpdate();
  };

  const uploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const url = await uploadImage(e.target.files[0]);
    if (!url) return;

    const newList = [...images, url];

    await supabase
      .from("articles")
      .update({ images: newList })
      .eq("id", articleId);

    onUpdate();
  };

  return (
    <div className="mb-6">
      {/* 전체 이미지 큰 미리보기 */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreview(null)}
        >
          <img src={preview} className="max-w-[90vw] max-h-[90vh]" />
        </div>
      )}

      {/* 이미지 슬라이더 */}
      {images.length > 0 && (
        <div className="text-center mb-4">
          <div className="relative flex justify-center items-center">
            <button
              className="absolute left-0 bg-gray-700 text-white px-2 py-1 rounded"
              onClick={prev}
            >
              ‹
            </button>

            <img
              src={images[index]}
              className="w-64 h-64 object-cover rounded cursor-pointer"
              onClick={() => setPreview(images[index])}
            />

            <button
              className="absolute right-0 bg-gray-700 text-white px-2 py-1 rounded"
              onClick={next}
            >
              ›
            </button>
          </div>

          {/* 썸네일 목록 */}
          <div className="flex justify-center mt-3 gap-2">
            {images.map((img: string, i: number) => (
              <img
                key={i}
                src={img}
                className={`w-14 h-14 cursor-pointer border ${
                  i === index ? "border-blue-500" : "border-gray-300"
                }`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>

          {/* 다운로드 / 삭제 */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              className="px-3 py-1 bg-gray-800 text-white rounded"
              onClick={() => downloadImg(images[index])}
            >
              다운로드
            </button>

            <button
              className="px-3 py-1 bg-red-600 text-white rounded"
              onClick={deleteImg}
            >
              삭제
            </button>
          </div>
        </div>
      )}

      {/* 이미지 업로드 */}
      <input type="file" accept="image/*" onChange={uploadNew} />
    </div>
  );
}
