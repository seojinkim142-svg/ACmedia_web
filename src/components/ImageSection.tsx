import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import { uploadImage } from "../lib/uploadImages";

interface Props {
  images: string[];
  articleId: number;
  onUpdate: () => void;
}

const REQUIRED_WIDTH = 1080;
const REQUIRED_HEIGHT = 1350;
const PLACEHOLDER_IMAGE = "https://placehold.co/108x135?text=No+Image";

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setIndex((prev) => {
      if (images.length === 0) return 0;
      return Math.min(prev, images.length - 1);
    });
  }, [images.length]);

  const hasImages = images.length > 0;
  const totalImages = images.length;
  const currentPosition = hasImages ? index + 1 : 0;
  const current =
    hasImages && index < totalImages ? images[index] : PLACEHOLDER_IMAGE;

  const deleteImage = async () => {
    if (!hasImages) return;
    const updated = images.filter((_, i) => i !== index);
    const nextIndex = Math.min(index, Math.max(0, updated.length - 1));

    await supabase.from("articles").update({ images: updated }).eq("id", articleId);

    setIndex(nextIndex);
    onUpdate();
  };

  const downloadImage = async (url: string) => {
    if (!hasImages) return;
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
      alert("이미지를 다운로드하지 못했습니다.");
    }
  };

  const uploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList?.length) return;

    const newUrls: string[] = [];

    for (const file of Array.from(fileList)) {
      try {
        const { width, height } = await readImageSize(file);
        if (width !== REQUIRED_WIDTH || height !== REQUIRED_HEIGHT) {
          alert(
            `${file.name}의 이미지 크기를 ${REQUIRED_WIDTH}x${REQUIRED_HEIGHT} 픽셀로 맞춰 주세요. 현재 크기: ${width}x${height}`
          );
          continue;
        }
      } catch {
        alert(`${file.name}의 이미지 정보를 불러오지 못했습니다.`);
        continue;
      }

      try {
        const uploadedUrl = await uploadImage(file);
        if (typeof uploadedUrl !== "string" || uploadedUrl.length === 0) {
          alert(`${file.name} 업로드에 실패했습니다.`);
          continue;
        }
        newUrls.push(uploadedUrl);
      } catch (err) {
        console.error(err);
        alert(`${file.name} 업로드에 실패했습니다.`);
      }
    }

    e.target.value = "";

    if (newUrls.length === 0) return;

    const updated = [...images, ...newUrls];

    await supabase.from("articles").update({ images: updated }).eq("id", articleId);

    setIndex(updated.length - 1);
    onUpdate();
  };

  return (
    <div className="w-full space-y-5">
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

      <div className="flex flex-row gap-4 rounded-2xl border border-dashed border-yellow-200 bg-white/80 overflow-x-auto">
        <div className="flex-1 min-w-[220px] relative flex flex-col items-center justify-center p-5">
          <div
            className="relative border border-dashed border-yellow-200 rounded-2xl bg-white shadow-sm overflow-hidden flex items-center justify-center mx-auto w-full max-w-[220px]"
            style={{ aspectRatio: "4 / 5" }}
          >
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 text-gray-700 rounded-full w-9 h-9 flex items-center justify-center shadow disabled:opacity-40"
              onClick={() => {
                if (!hasImages) return;
                setIndex((prev) => (prev - 1 + totalImages) % totalImages);
              }}
              disabled={!hasImages || totalImages <= 1}
            >
              &lt;
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 text-gray-700 rounded-full w-9 h-9 flex items-center justify-center shadow disabled:opacity-40"
              onClick={() => {
                if (!hasImages) return;
                setIndex((prev) => (prev + 1) % totalImages);
              }}
              disabled={!hasImages || totalImages <= 1}
            >
              &gt;
            </button>

            <img
              src={current}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => hasImages && setPreviewImage(current)}
            />
          </div>
          <p className="mt-3 text-sm text-gray-700">(현재 {currentPosition} / 총 {totalImages})</p>
        </div>

        <div className="flex flex-col justify-center gap-3 bg-white/90 p-4 border-l border-dashed border-yellow-200 min-w-[180px]">
          <button
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-800 disabled:opacity-50 text-center"
            onClick={() => fileInputRef.current?.click()}
          >
            업로드
          </button>
          <button
            className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-center"
            onClick={() => downloadImage(current)}
            disabled={!hasImages}
          >
            다운로드
          </button>
          <button
            className="w-full px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 text-center"
            onClick={deleteImage}
            disabled={!hasImages}
          >
            삭제
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white/80 p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3 text-center">썸네일 리스트</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {hasImages ? (
            images.map((img, i) => (
              <button
                type="button"
                key={`${img}-${i}`}
                className={`w-14 h-16 border rounded overflow-hidden transition ${
                  i === index ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setIndex(i)}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))
          ) : (
            <p className="text-xs text-gray-400">등록된 이미지가 없습니다.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={uploadNew}
          className="text-sm"
        />
        <p className="text-xs text-gray-500">
          권장 이미지 크기: {REQUIRED_WIDTH} x {REQUIRED_HEIGHT} 픽셀
        </p>
      </div>
    </div>
  );
}
