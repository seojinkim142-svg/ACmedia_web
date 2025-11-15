import { supabase } from "../supabaseClient";

interface Props {
  article: any;
  onUpdate: () => void;
}

export default function InfoSection({ article, onUpdate }: Props) {
  const updateField = async (field: string, value: any) => {
    await supabase.from("articles").update({ [field]: value }).eq("id", article.id);
    onUpdate();
  };

  return (
    <div className="w-full space-y-4">

      {/* 에디터 */}
      <div>
        <label className="font-semibold">에디터</label>
        <input
          className="border rounded p-2 w-full"
          value={article.editor || ""}
          onChange={(e) => updateField("editor", e.target.value)}
        />
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

      {/* 상태 */}
      <div>
        <label className="font-semibold">상태</label>
        <select
          className="border rounded p-2 w-full"
          value={article.status || ""}
          onChange={(e) => updateField("status", e.target.value)}
        >
          <option>리뷰</option>
          <option>작업</option>
          <option>업로드</option>
          <option>추천</option>
          <option>중복</option>
          <option>보류</option>
          <option>업로드대기</option>
        </select>
      </div>

      {/* 저장 버튼 */}
      <button
        className="w-full py-3 bg-green-600 text-white rounded"
        onClick={() => alert("저장되었습니다.")}
      >
        저장
      </button>
    </div>
  );
}
