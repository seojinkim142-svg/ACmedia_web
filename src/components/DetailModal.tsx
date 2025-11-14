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

  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // -----------------------------
  //  댓글 불러오기
  // -----------------------------
  const loadComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", item.id)
      .order("created_at", { ascending: true }); // 오래된 댓글 위 / 최신 아래

    if (data) setComments(data);
  };

  // -----------------------------
  //  article 데이터 불러오기 (출처/상태)
  // -----------------------------
  const loadArticleInfo = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("id", item.id)
      .single();

    if (data) {
      if (data.source) setSource(data.source);
      if (data.status) setStatus(data.status);
    }
  };

  // -----------------------------
  //  출처/상태 저장
  // -----------------------------
  const saveSourceStatus = async (src: string, st: string) => {
    await supabase.from("articles").upsert(
      {
        id: item.id,
        title: item.title,
        summary: item.summary,
        body: item.body,
        image: item.image,
        source: src,
        status: st,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  };

  //  출처/상태 변경될 때마다 자동 저장
  useEffect(() => {
    saveSourceStatus(source, status);
  }, [source, status]);

  // -----------------------------
  // 모달 열릴 때 DB 데이터 불러오기
  // -----------------------------
  useEffect(() => {
    if (item?.id) {
      loadArticleInfo();
      loadComments();
    }
  }, [item]);

  // -----------------------------
  // 댓글 생성
  // -----------------------------
  const handleSaveComment = async () => {
    if (!comment.trim()) return;

    await supabase.from("comments").insert({
      post_id: item.id,
      content: comment,
    });

    setComment("");
    loadComments();
  };

  // -----------------------------
  // 댓글 삭제
  // -----------------------------
  const handleDeleteComment = async (id: number) => {
    await supabase.from("comments").delete().eq("id", id);
    loadComments();
  };

  // -----------------------------
  // 댓글 수정
  // -----------------------------
  const handleStartEdit = (id: number, content: string) => {
    setEditId(id);
    setEditContent(content);
  };

  const handleEditSave = async () => {
    if (!editContent.trim()) return;

    await supabase.from("comments").update({ content: editContent }).eq("id", editId);

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

        <div className="p-4 overflow-y-auto space-y-6">

          {/* SUMMARY */}
          <div>
            <h3 className="font-bold mb-1">한눈에 보기</h3>
            <p className="text-gray-700">{item.summary}</p>
          </div>

          {/* BODY */}
          <div>
            <h3 className="font-bold mb-1">본문</h3>
            <p className="text-gray-700 whitespace-pre-line">{item.body}</p>

            <div className="flex justify-center mt-4">
              <img src={item.image} className="w-60 h-60 rounded-md object-cover" />
            </div>
          </div>

          {/* 출처 */}
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

          {/* 상태 */}
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

          {/* 댓글 목록 */}
          <div>
            <h3 className="font-bold mb-1">댓글</h3>

            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="border p-2 rounded-md bg-gray-50">

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

          {/* 새 댓글 */}
          <div>
            <textarea
              className="w-full border rounded-md p-3 h-24"
              placeholder="댓글 입력"
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
