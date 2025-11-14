import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
}

const DetailModal = ({ isOpen, onClose, item }: DetailModalProps) => {
  if (!isOpen || !item) return null;

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // 댓글 로드
  const loadComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", item.id)
      .order("created_at", { ascending: true }); // 오래된 순 → 위, 최신 → 아래

    if (!error && data) setComments(data);
  };

  useEffect(() => {
    if (item?.id) loadComments();
  }, [item]);

  // 댓글 저장
  const handleSaveComment = async () => {
    if (!comment.trim()) return;

    await supabase.from("comments").insert({
      post_id: item.id,
      content: comment,
    });

    setComment("");
    loadComments();
  };

  // 댓글 삭제
  const handleDeleteComment = async (id: number) => {
    await supabase.from("comments").delete().eq("id", id);
    loadComments();
  };

  // 댓글 수정 시작
  const handleStartEdit = (id: number, content: string) => {
    setEditId(id);
    setEditContent(content);
  };

  // 댓글 수정 저장
  const handleEditSave = async () => {
    if (!editContent.trim()) return;

    await supabase
      .from("comments")
      .update({ content: editContent })
      .eq("id", editId);

    setEditId(null);
    setEditContent("");
    loadComments();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-9999">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{item.title}</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl">×</button>
        </div>

        {/* CONTENT */}
        <div className="p-4 overflow-y-auto space-y-6">

          {/* SUMMARY */}
          <div>
            <h3 className="font-bold mb-1">한눈에 보기</h3>
            <p className="text-gray-700">{item.summary}</p>
          </div>

          {/* BODY */}
          <div>
            <h3 className="font-bold mb-1">본문</h3>
            <p className="text-gray-700">{item.body}</p>

            <div className="flex justify-center mt-4">
              <img src={item.image} className="w-60 h-60 rounded-md object-cover" />
            </div>
          </div>

          {/* COMMENT LIST */}
          <div>
            <h3 className="font-bold mb-1">댓글</h3>

            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="border p-2 rounded-md bg-gray-50">

                  {/* 수정 중 */}
                  {editId === c.id ? (
                    <>
                      <textarea
                        className="w-full border rounded-md p-2"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <div className="flex gap-2 mt-2">
                        <button 
                          className="px-3 py-1 bg-blue-500 text-white rounded-md"
                          onClick={handleEditSave}
                        >
                          저장
                        </button>

                        <button
                          className="px-3 py-1 bg-gray-300 rounded-md"
                          onClick={() => setEditId(null)}
                        >
                          취소
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-800">{c.content}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(c.created_at).toLocaleString()}
                      </div>

                      <div className="flex gap-3 mt-1 text-sm">
                        <button
                          className="text-blue-600"
                          onClick={() => handleStartEdit(c.id, c.content)}
                        >
                          수정
                        </button>
                        <button
                          className="text-red-600"
                          onClick={() => handleDeleteComment(c.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* NEW COMMENT INPUT */}
          <div>
            <textarea
              className="w-full border rounded-md p-3 h-24"
              placeholder="댓글을 입력하세요..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button
              onClick={handleSaveComment}
              className="w-full mt-2 py-2 bg-blue-600 text-white rounded-lg"
            >
              댓글 작성
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
