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

  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);

  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const [uploading, setUploading] = useState(false);

  // 변경 사항: 이미지 DB 저장 대신 "대기 상태 저장"
  const [pendingImages, setPendingImages] = useState<string[]>(item.images || []);

  const loadArticleInfo = async () => {
    const { 장
            </button>
          </div>

          <div>
            <h3 className="font-bold mb-1">댓글</h3>

            {comments.map((c) => (
              <div key={c.id} className="border p-2 rounded-md bg-gray-50 mt-2">

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
                        onClick={() => { setEditId(c.id); setEditContent(c.content); }}
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

            <textarea
              className="w-full border rounded-md p-3 mt-4"
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
