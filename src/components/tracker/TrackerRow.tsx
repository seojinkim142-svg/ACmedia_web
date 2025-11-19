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
  selectedCell?: { rowIndex: number; field: string } | null;
  onSelectCell: (rowIndex: number, field: string) => void;
  rowSelected: boolean;
  onToggleRow: (checked: boolean) => void;
}

export default function TrackerRow({
  index,
  item,
  onDoubleClick,
  onInlineUpdate,
  onImageClick,
  onMemoClick,
  selectedCell,
  onSelectCell,
  rowSelected,
  onToggleRow,
}: TrackerRowProps) {
  const preview =
    item.images?.length
      ? item.images[0]
      : "https://placehold.co/108x135?text=No+Image";

  const isSelected = (field: string) =>
    selectedCell?.rowIndex === index && selectedCell?.field === field;

  return (
    <tr className="border-b hover:bg-gray-50" onDoubleClick={() => onDoubleClick(item)}>
      <td className="py-2 px-1 text-center">
        <input
          type="checkbox"
          className="w-6 h-6"
          checked={rowSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleRow(e.target.checked);
          }}
        />
      </td>
      <td className="py-2 px-1 text-sm">{index + 1}</td>

      <td className="py-2 px-1 cursor-pointer">
        <div
          className="w-12 rounded overflow-hidden"
          style={{ aspectRatio: "4 / 5" }}
          onClick={(e) => {
            e.stopPropagation();
            onImageClick(e, item);
          }}
        >
          <img src={preview} className="w-full h-full object-cover" />
        </div>
      </td>

      <InlineCell
        type="date"
        value={item.created_at?.slice(0, 10)}
        onUpdate={(val) => onInlineUpdate(item.id, "created_at", val)}
        selected={isSelected("created_at")}
        onSelect={() => onSelectCell(index, "created_at")}
      />

      <InlineCell
        type="select"
        value={item.editor || ""}
        options={["지민", "지안", "아라"]}
        onUpdate={(val) => onInlineUpdate(item.id, "editor", val)}
        selected={isSelected("editor")}
        onSelect={() => onSelectCell(index, "editor")}
      />

      <td
        className={`
          py-2 px-2 cursor-pointer max-w-[320px] truncate
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
          "리뷰",
          "추천",
          "보류",
          "본문 작성",
          "본문 완료",
          "이미지 작성",
          "이미지 완료",
          "업로드 대기",
          "업로드",
        ]}
        onUpdate={(val) => onInlineUpdate(item.id, "status", val)}
        selected={isSelected("status")}
        onSelect={() => onSelectCell(index, "status")}
      />

      <td
        className="py-2 px-2 cursor-pointer text-sm text-gray-600 max-w-[220px] truncate"
        onClick={() => onMemoClick(item)}
      >
        {item.latest_comment ? item.latest_comment.slice(0, 40) : ""}
      </td>
    </tr>
  );
}

