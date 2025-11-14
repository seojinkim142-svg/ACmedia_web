import { useState } from "react";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
}

const sourceList = ["기사", "인스타", "AI", "창의"];
const statusList = ["리뷰", "작업", "업로드", "추천", "중복", "보류", "업로드대기"];

const DetailModal = ({ isOpen, onClose, item }: DetailModalProps) => {
  if (!isOpen || !item) return null;

  // 로컬 상태 관리
  const [source, setSource] = useState(item.source);
  const [status, setStatus] = useState(item.status);
  const [comment, setComment] = useState("");

  const handleSave = () => {
    console.log("저장됨:");
    console.log("출처:", source);
    console.log("상태:", status);
    console.log("댓글:", comment);

    alert("저장되었습니다.");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-9999">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{item.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">
            ×
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 overflow-y-auto space-y-6">
          
          {/* SUMMARY */}
          <div>
            <h3 className="font-bold text-lg mb-1">한눈에 보기</h3>
            <p className="text-gray-700 whitespace-pre-line">{item.summary}</p>
          </div>

          {/* BODY */}
          <div>
            <h3 className="font-bold text-lg mb-1">본문</h3>
            <p className="text-gray-700 whitespace-pre-line">{item.body}</p>

            <div className="flex justify-center mt-4">
              <img src={item.image} className="w-60 h-60 rounded-md object-cover" />
            </div>
          </div>

          {/* SOURCE (select) */}
          <div>
            <h4 className="font-bold mb-1">콘텐츠 출처</h4>

            <select
              className="border rounded-md px-3 py-1"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              {sourceList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* STATUS (select) */}
          <div>
            <h4 className="font-bold mb-1">상태</h4>

            <select
              className="border rounded-md px-3 py-1"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* COMMENT */}
          <div>
            <h4 className="font-bold mb-1">댓글</h4>
            <textarea
              className="w-full border rounded-md p-3 h-24"
              placeholder="댓글을 입력하세요..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium mt-2"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
