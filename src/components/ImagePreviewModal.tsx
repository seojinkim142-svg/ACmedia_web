
interface Props {
  image: string | null;
  onClose: () => void;
}

export default function ImagePreviewModal({ image, onClose }: Props) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-9999"
      onClick={onClose}
    >
      <img
        src={image}
        className="max-w-[90vw] max-h-[90vh] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
