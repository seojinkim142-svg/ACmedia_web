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

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const [uploading, setUploading] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  // 🔥 변경: 이미지 상태를 item에서 직접 수정하지 않고 별도 상태로 관리
  const [pendingImages, setPendingImages] = useState<string[]>(item.images || []);

  // -------------------------
  // article 정보 불러오기
  // -------------------------
  const loadArticleInfo = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("id", item.id)
      .single();

    if (data) {
      if (data.source) setSource(data.source);
      if (data.status) setStatus(data.status);
      if (data.images) {
        setPendingImages(data.images);
      }
    }
  };

  // -------------------------
  // 댓글 불러오기
  // -------------------------
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

  // -------------------------
  // 🔥 출처/상태 + pendingImages 최종 저장
  // -------------------------
  const handleSaveArticleInfo = async () => {
    await supabase.from("articles").update({
      source,
      status,
      images: pendingImages,
      updated_at: new Date().toISOString(),
    })
    .eq("id", item.id);

    alert("저장되었습니다.");
  };

  // -------------------------
  // 댓글 저장
  // -------------------------
  const handleSaveComment = async () => {
    if (!comment.trim()) return;

    await supabase.from("comments").insert({
      post_id: item.id,
      content: comment,
    });

    setComment("");
    loadComments();
  };

  // -------------------------
  // 댓글 삭제
  // -------------------------
  const handleDeleteComment = async (id: number) => {
    await supabase.from("comments").delete().eq("id", id);
    loadComments();
  };

  // -------------------------
  // 댓글 수정
  // -------------------------
  const handleEditSave = async () => {
    if (!editContent.trim()) return;

    await supabase.from("comments").update({ content: editContent }).eq("id", editId);
    setEditId(null);
    setEditContent("");
    loadComments();
  };

  // -------------------------
  // 이미지 다운로드
  // -------------------------
  const handleDownloadImage = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "image.jpg";
    link.click();
  };

  // -------------------------
  // 🔥 이미지 업로드 (DB 저장 ❌ / pendingImages에만 저장 ⭕)
  // -------------------------
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploading(true);

    const url = await uploadImage(file);

    if (url) {
      const newList = [...pendingImages, url];
      setPendingImages(newList);  // DB 반영은 하지 않음
    }

    setUploading(false);
  };

  // -------------------------------------------------
  // UI
  // -------------------------------------------------
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

          {/* --------------------------- */}
          {/* 이미지 슬라이더 */}
          {/* --------------------------- */}
          {pendingImages.length > 0 && (
            <div className="space-y-3 mt-4">
              <div className="relative flex justify-center items-center">

                {/* Prev */}
                <button
                  className="absolute left-0 px-3 py-2 bg-black/50 text-white rounded-full"
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      prev === 0 ? pendingImages.length - 1 : prev - 1
                    )
                  }
                >
                  ‹
                </button>

                {/* Main image */}
                <img
                  src={pendingImages[currentIndex]}
                  className="w-64 h-64 object-cover rounded-lg shadow"
                />

                {/* Next */}
                <button
                  className="absolute right-0 px-3 py-2 bg-black/50 text-white rounded-full"
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      prev === pendingImages.length - 1 ? 0 : prev + 1
                    )
                  }
                >
                  ›
                </button>
              </div>

              {/* Download + Upload */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => handleDownloadImage(pendingImages[currentIndex])}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  다운로드
                </button>

                <label className="px-4 py-2 bg-gray-700 text-white rounded-md cursor-pointer">
                  업로드
                  <input type="file" className="hidden" onChange={handleUploadImage} />
                </label>
              </div>

              {/* Thumbnails */}
              <div className="flex justify-center gap-2">
                {pendingImages.map((img, i) => (
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

          {/* 별도 이미지 업로드 영역 유지 */}
          <div>
            <h4 className="font-bold mb-1">이미지 업로드</h4>
            <input type="file" accept="image/*" onChange={handleUploadImage} />
            {uploading && <p className="text-blue-600">업로드 중...</p>}
          </div>

          {/* 출처/상태 */}
          <div className="space-y-3">
            <div>
              <h4 className="font-bold mb-1">콘텐츠 출처</h4>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="border px-3 py-1 rounded-md"
              >
                {sourceList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <h4 className="font-bold mb-1">상태</h4>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border px-3 py-1 rounded-md"
              >
                {statusList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSaveArticleInfo}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
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
