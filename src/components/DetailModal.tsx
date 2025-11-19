import { useEffect, useMemo, useState } from "react";
import ImageSection from "./ImageSection";
import CommentsSection from "./CommentsSection";
import { supabase } from "../supabaseClient";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
  onUpdated?: (updated: any) => void;
}

const STATUS_OPTIONS = [
  "초안",
  "검토",
  "발행",
  "문장 작성",
  "문장 완료",
  "이미지 작성",
  "이미지 완료",
  "업로드 대기",
  "업로드",
  "중복",
];

const CONTENT_TYPES = ["인스타", "기사", "AI", "창작", "직접 입력"];
const CONTRIBUTOR_OPTIONS = ["미정", "도란", "현민", "아둥", "상혁"];

const formatDateForInput = (value?: string | null) => {
  if (!value) return "";
  if (value.includes("T")) return value.slice(0, 10);
  if (value.length >= 10) return value.slice(0, 10);
  return "";
};

export default function DetailModal({ isOpen, onClose, item, onUpdated }: DetailModalProps) {
  const [article, setArticle] = useState<any>(item);
  const [comments, setComments] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const loadArticleInfo = async () => {
    if (!item?.id) return;

    const { data } = await supabase.from("articles").select("*").eq("id", item.id).single();
    if (data) setArticle(data);
  };

  const loadComments = async () => {
    if (!item?.id) return;

    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", item.id)
      .order("created_at", { ascending: false });

    if (data) setComments(data);
  };

  useEffect(() => {
    if (item?.id) {
      setArticle(item);
      loadArticleInfo();
      loadComments();
    }
  }, [item]);

  const handleFieldChange = (field: string, value: unknown) => {
    setArticle((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (value: string) => {
    if (!value) {
      handleFieldChange("created_at", null);
      return;
    }
    const iso = new Date(`${value}T00:00:00`).toISOString();
    handleFieldChange("created_at", iso);
  };

  const normalizedUrl = useMemo(() => {
    if (!article?.url) return "";
    if (article.url.startsWith("http")) return article.url;
    return `https://${article.url}`;
  }, [article?.url]);

  if (!isOpen || !article) return null;

  const handleSave = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from("articles")
      .update({
        title: article.title,
        summary: article.summary,
        body: article.body,
        source: article.source,
        status: article.status,
        content_source: article.content_source,
        editor: article.editor,
        bgm: article.bgm || "",
        url: article.url || "",
        created_at: article.created_at,
        images: article.images,
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id)
      .select()
      .single();

    setSaving(false);

    if (error) {
      alert("저장에 실패했습니다: " + error.message);
      return;
    }

    if (data) setArticle(data);
    onUpdated?.(data);
    alert("변경 사항이 저장되었습니다.");
  };

  return (
    <div
      className="fixed inset-0 z-9000 bg-black/40 backdrop-blur-sm px-4 py-6 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-6 py-4 border-b bg-white flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400">메인 팝업</p>
            <h2 className="text-2xl font-semibold text-gray-900">{article.title || "제목 없음"}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="w-10 h-10 rounded-full border border-gray-300 text-lg font-semibold text-gray-500 hover:bg-gray-100 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">상태</label>
              <select
                className="border rounded px-4 py-2.5 w-full"
                value={article.status || ""}
                onChange={(e) => handleFieldChange("status", e.target.value)}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">드롭다운(디폴트 '리뷰') · 작성할 때 선택</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">날짜</label>
                <input
                  type="date"
                  className="border rounded px-4 py-2.5 w-full"
                  value={formatDateForInput(article.created_at)}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">발행(디폴트, 작성 당일) · 작성할 때</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">참고 콘텐츠</label>
                <select
                  className="border rounded px-4 py-2.5 w-full"
                  value={article.source || ""}
                  onChange={(e) => handleFieldChange("source", e.target.value)}
                >
                  {CONTENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">예: 인스타, 기사, AI, 창작, 직접입력 등</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">편집자</label>
                <select
                  className="border rounded px-4 py-2.5 w-full"
                  value={article.editor || ""}
                  onChange={(e) => handleFieldChange("editor", e.target.value)}
                >
                  {CONTRIBUTOR_OPTIONS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">드롭다운(디폴트, 담당자) · 작성할 때</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">출처</label>
                <input
                  className="border rounded px-4 py-2.5 w-full"
                  value={article.content_source || ""}
                  onChange={(e) => handleFieldChange("content_source", e.target.value)}
                  placeholder="예: 웹소설, 또는 인스타 아이디 등"
                />
                <p className="text-xs text-gray-500 mt-1">비고(웹소설, 계정 이름 등)</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">URL (클릭하면 이동)</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className="border rounded px-4 py-2.5 flex-1"
                  value={article.url || ""}
                  onChange={(e) => handleFieldChange("url", e.target.value)}
                  placeholder="www.example.com"
                />
                <button
                  type="button"
                  disabled={!article.url}
                  onClick={() => window.open(normalizedUrl, "_blank", "noopener")}
                  className="px-5 py-2.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  이동
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">클릭하면 새 탭에서 바로 열기</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">BGM</label>
              <input
                className="border rounded px-4 py-2.5 w-full"
                value={article.bgm || ""}
                onChange={(e) => handleFieldChange("bgm", e.target.value)}
                placeholder="필요 시에만 입력"
              />
              <p className="text-xs text-gray-500 mt-1">필요한 경우에만 자유 입력</p>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">제목 (기사 제목)</label>
              <input
                className="border rounded px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={article.title || ""}
                onChange={(e) => handleFieldChange("title", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">요약</label>
              <textarea
                rows={3}
                className="border rounded px-4 py-3 w-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={article.summary || ""}
                onChange={(e) => handleFieldChange("summary", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">본문</label>
              <textarea
                rows={10}
                className="border rounded px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={article.body || ""}
                onChange={(e) => handleFieldChange("body", e.target.value)}
              />
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">이미지</h3>
                <p className="text-xs text-gray-500">너무 크지 않게 · 1/5 비율로 캡처 권장</p>
              </div>
            </div>
            <ImageSection images={article.images || []} articleId={article.id} onUpdate={loadArticleInfo} />
          </section>

          <section className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 border-t border-dashed border-gray-300" />
              <span className="text-sm font-semibold text-gray-700">댓글 영역</span>
              <div className="flex-1 border-t border-dashed border-gray-300" />
            </div>
            <CommentsSection comments={comments} postId={article.id} onUpdate={loadComments} />
          </section>
        </div>
      </div>
    </div>
  );

}
