import { useState } from "react";
import { uploadImage } from "../lib/uploadImages";
import { supabase } from "../supabaseClient";


interface Props {
  images: string[];
  articleId: number;
  onUpdate: () => void;
}

export default function ImageSection({ images, articleId, onUpdate }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const next = () => setCurrentIndex((i) => (i + 1) % images.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);

  const downloadImage = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "image.png";
    a.click();
  };

  const uploadNewImage = async (e: any) => {
    if (!e.target.files[0]) return;
    setUploading(true);

    const url = await uploadImage(e.target.files[0]);
    if (url) {
      const newImages = [...images, url];
      await supabase.from("articles").update({ images: newImages }).eq("id", articleId);
      onUpdate();
    }
    setUploading(false);
  };

  return (
    <>
      {preview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-999"
             onClick={() => setPreview(null)}>
          <img src={preview} className="max-w-[90vw] max-h-[90vh] rounded-lg" />
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-3">
          {/* 슬라이더 */}
          <div className="relative flex justify-center items-center">
            <button onClick={prev} className="absolute left-0 bg-black/60 text-white px-3 py-2 rounded-full">‹</button>

            <img
              src={images[currentIndex]}
              className="w-64 h-64 object-cover rounded-lg cursor-pointer"
              onClick={() => setPreview(images[currentIndex])}
            />

            <button onClick={next} className="absolute right-0 bg-black/60 text-white px-3 py-2 rounded-full">›</button>
          </div>

          <button
            onClick={() => downloadImage(images[currentIndex])}
            className="px-3 py-1 bg-gray-800 text-white rounded-md"
          >
            다운로드
          </button>

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
        </div>
      )}

      {/* 업로드 */}
      <div>
        <input type="file" accept="image/*" onChange={uploadNewImage} />
        {uploading && <div className="text-sm text-blue-600">업로드 중...</div>}
      </div>
    </>
  );
}
