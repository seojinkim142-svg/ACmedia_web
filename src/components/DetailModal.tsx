import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";


interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
}

const sourceList = ["기사", "인스타", "AI", "창의"];
const statusList = ["리뷰", "작업", "업로드", "추천", "중복", "보류", "업로드대기"];

const DetailModal = ({ isOpen, onClose, item }: DetailModalProps) => {
  if (!isOpen || !item) return null;

  const [source, setSource] = useState(item.source);
  const [status, setStatus] = useState(item.status);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  // 댓글 불러오기
  const loadComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", item.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComments(data);
    }
  };

  // 모달 열릴 때 댓글 로드
  useEffect(() => {
    if (item?.id) {
      loadComments();
    }
  }, [item]);

  // 댓글 저장
  const handleSaveComment = async () => {
    if (!comment.trim()) return;

    const { error } = await supabase
      .from("comments")
      .insert({ post_id: item.id, content: comment });

    if (!error) {
      setComment("");
      loadComments(); // 저장 후 새로 불러오기
    }
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

          {/* SOURCE */}
          <div>
            <h4 className="font-bold mb-1">콘텐츠 출처</h4>
            <select className="border rounded-md px-3 py-1" value={source} onChange={(e) => setSource(e.target.value)}>
              {sourceList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* STATUS */}
          <div>
            <h4 className="font-bold mb-1">상태</h4>
            <select className="border rounded-md px-3 py-1" value={status} onChange={(e) => setStatus(e.target.value)}>
              {statusList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* COMMENTS LIST */}
          <div>
            <h4 className="font-bold mb-1">댓글 목록</h4>
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="border p-2 rounded-md bg-gray-50">
                  <div className="text-gray-700">{c.content}</div>
                  <div className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</div>
                </div>
              ))}

              {comments.length === 0 && (
                <div className="text-gray-400 text-sm">댓글이 없습니다.</div>
              )}
            </div>
          </div>

          {/* COMMENT INPUT */}
          <div>
            <h4 className="font-bold mb-1">댓글 작성</h4>
            <textarea
              className="w-full border rounded-md p-3 h-24"
              placeholder="댓글을 입력하세요..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button
              onClick={handleSaveComment}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium mt-2"
            >
              댓글 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
