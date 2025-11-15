import { useState } from "react";
import { uploadImage } from "../lib/uploadImages";
import { supabase } from "../supabaseClient";

const DEFAULT_IMAGE = "https://placehold.co/120x120?text=No+Image";

interface Props {
  images: string[];
  articleId: number;
  onUpdate: () => void;
}

export default function ImageSection({ images, articleId, onUpdate }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  const next = () => setCurrentIndex((i) => (i + 1) % images.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);

  const downloadImage = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "image.png";
    a.click();
  };

  const deleteImage = async () => {
    const updated = images.filter((img) => img !== images[currentIndex]);

    await supabase
      .from("articles")
      .update({ images: updated })
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

      {images.length > 0 && (
        <>
          <div className="relative flex justify-center items-center">
            <button onClick={prev} className="absolute left-0 bg-black/60 text-white px-3 py-2 rounded-full">‹</button>

            <img
              src={images[currentIndex] || DEFAULT_IMAGE}
              className="w-64 h-64 object-cover rounded cursor-pointer"
            />

            <button onClick={next} className="absolute right-0 bg-black/60 text-white px-3 py-2 rounded-full">›</button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => downloadImage(images[currentIndex])}
              className="px-3 py-1 bg-gray-800 text-white rounded"
            >
              다운로드
            </button>

            <button
              onClick={deleteImage}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              삭제
            </button>
          </div>

          <div className="flex gap-2 justify-center">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img || DEFAULT_IMAGE}
                onClick={() => setCurrentIndex(idx)}
                className={`w-14 h-14 object-cover rounded cursor-pointer border ${
                  idx === currentIndex ? "border-blue-500" : "border-gray-300"
                }`}
              />
            ))}
          </div>
        </>
      )}

      <div>
        <input type="file" accept="image/*" onChange={uploadNewImage} />
        {uploading && <div className="text-sm text-blue-600">업로드 중...</div>}
      </div>
    </div>
  );
}
