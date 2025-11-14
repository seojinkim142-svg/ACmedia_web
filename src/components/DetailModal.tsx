interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
}

const DetailModal = ({ isOpen, onClose, item }: DetailModalProps) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{item.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ×
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 overflow-y-auto space-y-5">
          
          {/* SUMMARY */}
          <div>
            <h3 className="font-bold text-lg mb-1">한눈에 보기</h3>
            <p className="text-gray-700 whitespace-pre-line">{item.summary}</p>
          </div>

          {/* BODY */}
          <div>
            <h3 className="font-bold text-lg mb-1">본문</h3>
            <p className="text-gray-700 whitespace-pre-line">{item.body}</p>
          </div>

          {/* IMAGE */}
          <div className="flex justify-center">
            <img
              src={item.image}
              alt=""
              className="w-60 h-60 object-cover rounded-md"
            />
          </div>

          {/* SOURCE */}
          <div>
            <h4 className="font-bold text-sm mb-1">콘텐츠 출처</h4>
            <div className="px-3 py-1 bg-gray-100 rounded-md inline-block">
              {item.source}
            </div>
          </div>

          {/* STATUS */}
          <div>
            <h4 className="font-bold text-sm mb-1">상태</h4>
            <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md inline-block">
              {item.status}
            </div>
          </div>

          {/* COMMENT */}
          <div>
            <h4 className="font-bold text-sm mb-2">댓글</h4>
            <textarea
              className="w-full border rounded-md p-2 h-24"
              placeholder="댓글을 입력하세요..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
