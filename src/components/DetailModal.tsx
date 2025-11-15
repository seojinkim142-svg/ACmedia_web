import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { uploadImage } from "../lib/uploadImages";

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

  // 댓글
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // 이미지 상태
  const [pendingImages, setPendingImages] = useState<string[]>(item.images || []);
  const [uploading, setUploading] = useState(false);

  // 슬라이더
  const [currentIndex, setCurrentIndex] = useState(0);

  // -------------------------  데이터 로드  -------------------------
  const loadArticleInfo = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("id", item.id)
      .single();

    if (data) {
      if (data.source) setSource(data.source);
      if (data.status) setStatus(data.status);
      if (data.images) setPendingImages(data.images);
    }
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", item.id)
      .order("created_at", { ascending: true });

    if (data) setComments(data);
  };

  useEffect(() => {
    if (item?.id) {
      loadArticleInfo();
      loadComments();
    }
  }, [item]);

  // -------------------------  저장 (출처 + 상태 + 이미지)  -------------------------
  const handleSaveArticle = async () => {
    await supabase
      .from("articles")
      .update({
        source,
        status,
        images: pendingImages,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    alert("저장되었습니다.");
  };

  // -------------------------  댓글 작성  -------------------------
  const handleSaveComment = async () => {
    if (!comment.trim()) return;

    await supabase.from("comments").insert({
      post_id: item.id,
      content: comment,
    });

    setComment("");
    loadComments();
  };

  // -------------------------  댓글 삭제  -------------------------
  const handleDeleteComment = async (id: number) => {
    await supabase.from("comments").delete().eq("id", id);
    loadComments();
  };

  // -------------------------  댓글 수정  -------------------------
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

  // -------------------------  이미지 업로드 (DB 저장 X / 미리보기만)  -------------------------
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploading(true);

    const url = await uploadImage(file);

    if (url) {
      const newImages = [...pendingImages, url];
      setPendingImages(newImages); // DB 저장 없음
    }

    setUploading(false);
  };

  // -------------------------  슬라이더 이동  -------------------------
  const nextImage = () => {
    if (pendingImages.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % pendingImages.length);
  };

  const prevImage = () => {
    if (pendingImages.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + pendingImages.length) % pendingImages.length);
  };

  // ------------------------- UI ------------------------------
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
          </div>

          {/* 이미지 슬라이더 */}
          {pendingImages.length > 0 && (
            <div className="space-y-3">
              <div className="relative flex justify-center items-center">
                <button
                  onClick={prevImage}
                  className="absolute left-0 px-3 py-2 text-white bg-black/50 rounded-full"
                >
                  ‹
                </button>

                <img
                  src={pendingImages[currentIndex]}
                  className="w-64 h-64 object-cover rounded-lg shadow"
                />

                <button
                  onClick={nextImage}
                  className="absolute right-0 px-3 py-2 text-white bg-black/50 rounded-full"
                >
                  ›
                </button>
              </div>

              {/* 썸네일 */}
              <div className="flex justify-center gap-2">
                {pendingImages.map((img: string, i: number) => (
                  <img
                    key={i}
                    src={img}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-14 h-14 object-cover cursor-pointer rounded-md border ${
                      i === currentIndex ? "border-blue-500" : "border-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 이미지 업로드 */}
          <div>
            <h4 className="font-bold mb-1">이미지 업로드</h4>

            <input
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              className="border p-2 rounded-md"
            />

            {uploading && (
              <div className="text-blue-600 text-sm mt-2">업로드 중...</div>
            )}
          </div>

          {/* 출처 / 상태 */}
          <div className="space-y-3 mt-4">
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

            <button
              onClick={handleSaveArticle}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              저장
            </button>
          </div>

          {/* 댓글 */}
          <div>
            <h3 className="font-bold mb-1">댓글</h3>

            {comments.map((c) => (
              <div key={c.id} className="border p-2 rounded-md bg-gray-50 mb-2">
                {editId === c.id ? (
                  <>
                    <textarea
                      className="w-full border rounded-md p-2"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />

                    <div className="flex gap-2 mt-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-md" onClick={handleEditSave}>저장</button>
                      <button className="px-3 py-1 bg-gray-300 rounded-md" onClick={() => setEditId(null)}>취소</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-gray-800">{c.content}</div>
                    <div className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</div>

                    <div className="flex gap-4 text-sm mt-2">
                      <button className="text-blue-600" onClick={() => { setEditId(c.id); setEditContent(c.content); }}>수정</button>
                      <button className="text-red-600" onClick={() => handleDeleteComment(c.id)}>삭제</button>
                    </div>
                  </>
                )}
              </div>
            ))}

            <textarea
              className="w-full border rounded-md p-3 mt-2"
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
