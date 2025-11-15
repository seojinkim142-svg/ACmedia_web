export default function ImagePreviewModal({ images, index, onClose, onSelect }: any) {
  if (index === null) return null;

  const next = () => onSelect((index + 1) % images.length);
  const prev = () => onSelect((index - 1 + images.length) % images.length);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <img src={images[index]} className="max-w-[90vw] max-h-[90vh] rounded" />

        <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 text-white text-4xl">‹</button>
        <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-4xl">›</button>
      </div>
    </div>
  );
}
