import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface InfoSectionProps {
  article: any;
  onUpdate: () => void;
}

export default function InfoSection({ article, onUpdate }: InfoSectionProps) {
  const [editor, setEditor] = useState(article.editor || "");
  const [source, setSource] = useState(article.source || "기사");
  const [contentSource, setContentSource] = useState(article.content_source || "");
  const [url, setUrl] = useState(article.url || "");
  const [status, setStatus] = useState(article.status || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEditor(article.editor || "");
    setSource(article.source || "기사");
    setContentSource(article.content_source || "");
    setUrl(article.url || "");
    setStatus(article.status || "");
  }, [article]);

  const updateField = async (field: string, value: any) => {
    setSaving(true);
    await supabase
      .from("articles")
      .update({ [field]: value })
      .eq("id", article.id);
    setSaving(false);
    onUpdate();
  };

  const handleBlur = (field: string, value: string) => {
    if ((article as any)[field] === value) return;
    updateField(field, value);
  };

  return (
    <div className="w-full space-y-4">
      <div>
        <label className="font-semibold">에디터</label>
        <select
          className="border rounded p-2 w-full"
          value={editor}
          onChange={(e) => {
            setEditor(e.target.value);
            updateField("editor", e.target.value);
          }}
          disabled={saving}
        >
          <option value="">선택하세요</option>
          <option value="지민">지민</option>
          <option value="지안">지안</option>
          <option value="아라">아라</option>
        </select>
      </div>

      <div>
        <label className="font-semibold">출처</label>
        <select
          className="border rounded p-2 w-full"
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            updateField("source", e.target.value);
          }}
          disabled={saving}
        >
          <option>기사</option>
          <option>뉴스룸</option>
          <option>AI</option>
          <option>창의</option>
        </select>
      </div>

      <div>
        <label className="font-semibold">콘텐츠 출처</label>
        <input
          className="border rounded p-2 w-full"
          value={contentSource}
          onChange={(e) => setContentSource(e.target.value)}
          onBlur={() => handleBlur("content_source", contentSource)}
          disabled={saving}
        />
      </div>

      <div>
        <label className="font-semibold">출처 URL</label>
        <input
          className="border rounded p-2 w-full"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={() => handleBlur("url", url)}
          disabled={saving}
        />
      </div>

      <div>
        <label className="font-semibold">상태</label>
        <select
          className="border rounded p-2 w-full"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            updateField("status", e.target.value);
          }}
          disabled={saving}
        >
          <option>리뷰</option>
          <option>추천</option>
          <option>보류</option>
          <option>본문 작성</option>
          <option>본문 완료</option>
          <option>이미지 작성</option>
          <option>이미지 완료</option>
          <option>업로드 대기</option>
          <option>업로드</option>
          <option>중복</option>
        </select>
      </div>
    </div>
  );
}

