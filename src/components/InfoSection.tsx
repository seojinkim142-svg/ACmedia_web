import { supabase } from "../supabaseClient";

interface InfoSectionProps {
  article: any;
  onUpdate: () => void;
}

export default function InfoSection({ article, onUpdate }: InfoSectionProps) {
  const updateField = async (field: string, value: any) => {
    await supabase
      .from("articles")
      .update({ [field]: value })
      .eq("id", article.id);

    onUpdate();
  };

  return (
    <div className="w-full space-y-4">

      {/* 에디터 -> 드롭다운 변환 */}
      <div>
        <label className="font-semibold">에디터</label>
        <select
          className="border rounded p-2 w-full"
          value={article.editor || ""}
          onChange={(e) => updateField("editor", e.target.value)}
        >
          <option value="">선택하세요</option>
          <option value="지민">지민</option>
          <option value="지안">지안</option>
          <option value="아라">아라</option>
        </select>
      </div>

      {/* 출처 */}
      <div>
        <label className="font-semibold">출처</label>
        <select
          className="border rounded p-2 w-full"
          value={article.source || "기사"}
          onChange={(e) => updateField("source", e.target.value)}
        >
          <option>기사</option>
          <option>인스타</option>
          <option>AI</option>
          <option>창의</option>
        </select>
      </div>

      {/* 콘텐츠 출처 */}
      <div>
        <label className="font-semibold">콘텐츠 출처</label>
        <input
          className="border rounded p-2 w-full"
          value={article.content_source || ""}
          onChange={(e) => updateField("content_source", e.target.value)}
        />
      </div>

      {/* 출처 URL */}
      <div>
        <label className="font-semibold">출처 URL</label>
        <input
          className="border rounded p-2 w-full"
          value={article.url || ""}
          onChange={(e) => updateField("url", e.target.value)}
        />
      </div>

      {/* 상태 */}
      <div>
        <label className="font-semibold">상태</label>
        <select
          className="border rounded p-2 w-full"
          value={article.status || ""}
          onChange={(e) => updateField("status", e.target.value)}
        >
          <option>리뷰</option>
          <option>추천</option>
          <option>보류</option>
          <option>본문 생성</option>
          <option>본문 완료</option>
          <option>이미지 생성</option>
          <option>이미지 완료</option>
          <option>업로드 대기</option>
          <option>업로드</option>
        </select>
      </div>

    </div>
  );
}
