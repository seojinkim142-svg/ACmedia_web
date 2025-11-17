import { useState } from "react";
import { supabase } from "../supabaseClient";
import { uploadImage } from "../lib/uploadImages";

interface Props {
  images: string[];
  articleId: number;
  onUpdate: () => void;
}

const REQUIRED_WIDTH = 1080;
const REQUIRED_HEIGHT = 1350;

async function readImageSize(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () =>
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageSection({ images, articleId, onUpdate }: Props) {
  const [index, setIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const current =
    images.length > 0
      ? images[index]
      : "https://placehold.co/108x135?text=No+Image";

  const deleteImage = async () => {
    const updated = images.filter((_, i) => i !== index);

    await supabase
      .from("articles")
      .update({ images: updated })
      .eq("id", articleId);

    onUpdate();
  };

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to download image");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `image-${Date.now()}.png`;
      link.click();

      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      alert("�̹��� �ٿ�ε��� �����Ͽ����ϴ�.");
    }
  };

  const uploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    try {
      const { width, height } = await readImageSize(file);
      if (width !== REQUIRED_WIDTH || height !== REQUIRED_HEIGHT) {
        alert(
          `이미지 크기를 ${REQUIRED_WIDTH}x${REQUIRED_HEIGHT} 픽셀로 맞춰 주세요. 현재 크기: ${width}x${height}`
        );
        e.target.value = "";
        return;
      }
    } catch (err) {
      alert("이미지 정보를 읽어오지 못했습니다.");
      e.target.value = "";
      return;
    }

    const url = await uploadImage(file);
    const updated = [...images, url];

    await supabase
      .from("articles")
      .update({ images: updated })
      .eq("id", articleId);

    onUpdate();
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="rounded-lg shadow-xl overflow-hidden"
            style={{ width: "min(540px, 90vw)", aspectRatio: "4 / 5" }}
          >
            <img src={previewImage} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      <div
        className="border rounded cursor-pointer overflow-hidden w-[270px]"
        style={{ aspectRatio: "4 / 5" }}
        onClick={() => setPreviewImage(current)}
      >
        <img src={current} className="w-full h-full object-cover" />
      </div>

      <div className="flex gap-6">
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded"
          onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
          disabled={!images.length}
        >
          &lt;
        </button>

        <button
          className="px-4 py-2 bg-gray-700 text-white rounded"
          onClick={() => setIndex((i) => (i + 1) % images.length)}
          disabled={!images.length}
        >
          &gt;
        </button>
      </div>

      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => downloadImage(current)}
          disabled={!images.length}
        >
          다운로드
        </button>

        <button
          onClick={deleteImage}
          className="px-4 py-2 bg-red-600 text-white rounded"
          disabled={!images.length}
        >
          삭제
        </button>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {images.map((img, i) => (
          <div
            key={i}
            className={`w-12 border rounded cursor-pointer overflow-hidden ${
              i === index ? "ring-2 ring-blue-500" : ""
            }`}
            style={{ aspectRatio: "4 / 5" }}
            onClick={() => setIndex(i)}
          >
            <img src={img} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      <input type="file" accept="image/*" onChange={uploadNew} />
      <p className="text-xs text-gray-500">
        권장 이미지 크기: {REQUIRED_WIDTH} x {REQUIRED_HEIGHT} 픽셀
      </p>
    </div>
  );
}
