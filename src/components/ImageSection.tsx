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
  const current = images.length > 0 ? images[index] : "https://placehold.co/120x120?text=No+Image";

  const deleteImage = async () => {
    const updated = images.filter((_, i) => i !== index);

    await supabase
      .from("articles")
      .update({ images: updated })
      .eq("id", articleId);

    onUpdate();
  };

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

      {/* 큰 이미지 */}
      <img src={current} className="w-64 h-64 object-cover border rounded" />

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
        <a
          href={current}
          download
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          다운로드
        </a>

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
