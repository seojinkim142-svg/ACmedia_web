import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface InfoSectionProps {
  article: any;
  onUpdate: () => void;
}

const STATUS_OPTIONS = [
  "리뷰",
  "추천",
  "보류",
  "본문 작성",
  "본문 완료",
  "썸네일 작성",
  "썸네일 완료",
  "업로드 예정",
  "업로드 완료",
  "중복",
];

const SOURCE_OPTIONS = ["기사", "뉴스", "AI", "창의"];

const EDITOR_OPTIONS = ["지민", "지안", "아라"];

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
          <option value="">선택해주세요</option>
          {EDITOR_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
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
          {SOURCE_OPTIONS.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
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
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
