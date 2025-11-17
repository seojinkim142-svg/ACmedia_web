interface ImageMenuProps {
  menu: {
    x: number;
    y: number;
    images: string[];
    id: number;
  } | null;
  onPreview: (images: string[], startIndex?: number) => void;
  onDownload: (url: string) => void;
  onUpload: (file: File, articleId: number) => void;
  onClose: () => void;
}

export default function ImageMenu({
  menu,
  onPreview,
  onDownload,
  onUpload,
  onClose,
}: ImageMenuProps) {
  if (!menu) return null;

  const hasImages = menu.images.length > 0;

  return (
    <div
      className="fixed bg-white border shadow-lg rounded z-50"
      style={{ top: menu.y, left: menu.x }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
        onClick={() => {
          onPreview(menu.images, 0);
          onClose();
        }}
        disabled={!hasImages}
      >
        이미지 보기
      </button>

      <button
        className="block w-full px-4 py-2 text-left hover:bg-gray-100 disabled:text-gray-400"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDownload(menu.images[0] || "");
          onClose();
        }}
        disabled={!hasImages}
      >
        다운로드
      </button>

      <label className="block w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer">
        업로드
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onUpload(e.target.files[0], menu.id);
            }
            onClose();
          }}
        />
      </label>
    </div>
  );
}
