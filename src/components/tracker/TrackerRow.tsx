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
}

interface TrackerRowProps {
  index: number;
  item: Article;
  onDoubleClick: (item: Article) => void;
  onInlineUpdate: (id: number, field: string, value: string) => void;
  onImageClick: (e: React.MouseEvent, item: Article) => void;
}

export default function TrackerRow({
  index,
  item,
  onDoubleClick,
  onInlineUpdate,
  onImageClick,
}: TrackerRowProps) {
  
  const preview =
    item.images?.length
      ? item.images[0]
      : "https://placehold.co/120x120?text=No+Image";

  return (
    <tr
      className="border-b hover:bg-gray-50"
      onDoubleClick={() => onDoubleClick(item)}
    >
      {/* 번호 */}
      <td className="py-2 px-1 text-sm">{index + 1}</td>

      {/* 사진 클릭 → 메뉴 호출 */}
      <td
        className="py-2 px-1 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onImageClick(e, item);
        }}
      >
        <img
          src={preview}
          className="w-14 h-14 object-cover rounded"
        />
      </td>

      {/* 날짜 */}
      <InlineCell
        type="date"
        value={item.created_at?.slice(0, 10)}
        onUpdate={(val) => onInlineUpdate(item.id, "created_at", val)}
      />

      {/* 에디터 */}
      <InlineCell
        type="select"
        value={item.editor || ""}
        options={["지민", "지안", "아라"]}
        onUpdate={(val) => onInlineUpdate(item.id, "editor", val)}
      />

      {/* 제목 */}
      <InlineCell
        value={item.title}
        highlight
        onUpdate={(val) => onInlineUpdate(item.id, "title", val)}
      />

      {/* 상태 */}
      <InlineCell
        type="select"
        value={item.status}
        options={[
          "리뷰",
          "작업",
          "업로드",
          "추천",
          "중복",
          "보류",
          "업로드대기",
        ]}
        onUpdate={(val) => onInlineUpdate(item.id, "status", val)}
      />
    </tr>
  );
}
