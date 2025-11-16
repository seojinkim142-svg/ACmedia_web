import InlineCell from "./InlineCell";

interface Article {
  id: number;
  title: string;
  summary: string;
  body: string;
  source: string;
  status: string;
  editor?: string;
  content_source?: string;
  images: string[] | null;
  created_at?: string;
  latest_comment?: string;
}

interface TrackerRowProps {
  index: number;
  item: Article;
  onDoubleClick: (item: Article) => void;
  onInlineUpdate: (id: number, field: string, value: string) => void;
  onImageClick: (e: React.MouseEvent, item: Article) => void;
  onMemoClick: (item: Article) => void;
}

export default function TrackerRow({
  index,
  item,
  onDoubleClick,
  onInlineUpdate,
  onImageClick,
  onMemoClick,
}: TrackerRowProps) {

  const preview =
    item.images?.length
      ? item.images[0]
      : "https://placehold.co/120x120?text=No+Image";

  return (
    <tr className="border-b hover:bg-gray-50" onDoubleClick={() => onDoubleClick(item)}>

      <td className="py-2 px-1 text-sm">{index + 1}</td>

      <td
        className="py-2 px-1 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onImageClick(e, item); }}
      >
        <img src={preview} className="w-14 h-14 object-cover rounded" />
      </td>

      <InlineCell
        type="date"
        value={item.created_at?.slice(0, 10)}
        onUpdate={(val) => onInlineUpdate(item.id, "created_at", val)}
      />

      <InlineCell
        type="select"
        value={item.editor || ""}
        options={["지민", "지안", "아라"]}
        onUpdate={(val) => onInlineUpdate(item.id, "editor", val)}
      />

      {/* 제목 — 길이에 따라 글씨 크기 자동 조정 */}
      <td
        className={`
          py-2 px-1 cursor-pointer max-w-[260px] truncate
          ${
            item.title.length < 25
              ? "text-sm"
              : item.title.length < 40
              ? "text-xs"
              : "text-[10px]"
          }
        `}
        onClick={() => onDoubleClick(item)}
      >
        {item.title}
      </td>

      <InlineCell
        type="select"
        value={item.status}
        options={[
          "리뷰", "추천", "보류",
          "본문 생성", "본문 완료",
          "이미지 생성", "이미지 완료",
          "업로드 대기", "업로드",
        ]}
        onUpdate={(val) => onInlineUpdate(item.id, "status", val)}
      />

      <td
        className="py-2 px-1 cursor-pointer text-sm text-gray-600"
        onClick={() => onMemoClick(item)}
      >
        {item.latest_comment ? item.latest_comment.slice(0, 20) : ""}
      </td>

    </tr>
  );
}
