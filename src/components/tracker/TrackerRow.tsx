import type { MouseEvent } from "react";
import InlineCell from "./InlineCell";
import type { TrackerArticle } from "../../types/tracker";

interface TrackerRowProps {
  index: number;
  item: TrackerArticle;
  onTitleClick: (item: TrackerArticle) => void;
  onInlineUpdate: (id: number, field: string, value: string) => Promise<unknown> | void;
  onImageClick: (e: MouseEvent, item: TrackerArticle) => void;
  onMemoClick: (item: TrackerArticle) => void;
  selectedCell?: { rowIndex: number; field: string } | null;
  onSelectCell: (rowIndex: number, field: string) => void;
  rowSelected: boolean;
  onToggleRow: (checked: boolean) => void;
  rowActive?: boolean;
}

const EDITOR_OPTIONS = ["지민", "지안", "아라"];

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

export default function TrackerRow({
  index,
  item,
  onTitleClick,
  onInlineUpdate,
  onImageClick,
  onMemoClick,
  selectedCell,
  onSelectCell,
  rowSelected,
  onToggleRow,
  rowActive = false,
}: TrackerRowProps) {
  const preview =
    item.images?.length && item.images[0] ? item.images[0] : "https://placehold.co/108x135?text=No+Image";

  const isSelected = (field: string) => selectedCell?.rowIndex === index && selectedCell?.field === field;

  return (
    <tr className={`border-b border-gray-200 hover:bg-gray-50 ${rowActive ? "bg-blue-50" : ""}`}>
      <td className="py-2 px-1 text-center border-r border-gray-200">
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
      <td className="py-2 px-1 text-sm border-r border-gray-200">{index + 1}</td>

      <td className="py-2 px-1 cursor-pointer border-r border-gray-200">
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

      <td
        className={`py-2 px-2 cursor-pointer max-w-[320px] truncate border-r border-gray-200 ${
          item.title.length < 25 ? "text-sm" : item.title.length < 40 ? "text-xs" : "text-[10px]"
        }`}
        onClick={() => onTitleClick(item)}
      >
        {item.title}
      </td>

      <InlineCell
        type="date"
        value={item.created_at?.slice(0, 10)}
        onUpdate={(val) => onInlineUpdate(item.id, "created_at", val)}
        selected={isSelected("created_at")}
        onSelect={() => onSelectCell(index, "created_at")}
        className="border-r border-gray-200"
      />

      <InlineCell
        type="select"
        value={item.editor || ""}
        options={EDITOR_OPTIONS}
        onUpdate={(val) => onInlineUpdate(item.id, "editor", val)}
        selected={isSelected("editor")}
        onSelect={() => onSelectCell(index, "editor")}
        className="border-r border-gray-200"
      />

      <InlineCell
        type="select"
        value={item.status}
        options={STATUS_OPTIONS}
        onUpdate={(val) => onInlineUpdate(item.id, "status", val)}
        selected={isSelected("status")}
        onSelect={() => onSelectCell(index, "status")}
        className="border-r border-gray-200"
      />

      <td className="py-2 px-2 text-sm text-gray-700 border-r border-gray-200 max-w-[200px] truncate">
        {item.content_source || item.source || "-"}
      </td>

      <td
        className="py-2 px-2 cursor-pointer text-sm text-gray-700 max-w-[220px] truncate"
        onClick={() => onMemoClick(item)}
      >
        {item.latest_comment ? item.latest_comment.slice(0, 40) : ""}
      </td>
    </tr>
  );
}
