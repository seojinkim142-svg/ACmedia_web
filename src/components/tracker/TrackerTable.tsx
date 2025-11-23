import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import TrackerRow from "./TrackerRow";
import type { TrackerArticle } from "../../types/tracker";

interface TrackerTableProps {
  articles: TrackerArticle[];
  onTitleClick: (item: TrackerArticle) => void;
  onInlineUpdate: (id: number, field: string, value: string) => Promise<unknown> | void;
  onImageClick: (e: MouseEvent, item: TrackerArticle) => void;
  onMemoClick: (item: TrackerArticle) => void;
  onSelectedChange?: (ids: number[]) => void;
  filterTitle?: string;
  filterStatus?: string;
  filterEditor?: string;
  filterDateFrom?: string;
  filterDateTo?: string;
  onFilterTitleChange?: (value: string) => void;
  onFilterStatusChange?: (value: string) => void;
  onFilterEditorChange?: (value: string) => void;
  onFilterDateFromChange?: (value: string) => void;
  onFilterDateToChange?: (value: string) => void;
  onResetFilters?: () => void;
  statusOptions?: string[];
  editorOptions?: string[];
}

interface SelectedCell {
  rowIndex: number;
  field: string;
}

interface HistoryEntry {
  id: number;
  field: string;
  previous: string;
  next: string;
}

const DEFAULT_EDITOR_OPTIONS = ["지민", "아라", "지안"];

const DEFAULT_STATUS_OPTIONS = [
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

export default function TrackerTable({
  articles,
  onTitleClick,
  onInlineUpdate,
  onImageClick,
  onMemoClick,
  onSelectedChange,
  filterTitle,
  filterStatus,
  filterEditor,
  filterDateFrom,
  filterDateTo,
  onFilterTitleChange,
  onFilterStatusChange,
  onFilterEditorChange,
  onFilterDateFromChange,
  onFilterDateToChange,
  onResetFilters,
  statusOptions = [],
  editorOptions = [],
}: TrackerTableProps) {
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const undoStack = useRef<HistoryEntry[]>([]);
  const redoStack = useRef<HistoryEntry[]>([]);
  const applyingHistory = useRef(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDate, setBulkDate] = useState("");
  const [bulkEditor, setBulkEditor] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [anchorRowIndex, setAnchorRowIndex] = useState<number | null>(null);

  const filtersEnabled =
    onFilterTitleChange ||
    onFilterStatusChange ||
    onFilterEditorChange ||
    onFilterDateFromChange ||
    onFilterDateToChange ||
    onResetFilters;
  const filterTitleValue = filterTitle ?? "";
  const filterStatusValue = filterStatus ?? "";
  const filterEditorValue = filterEditor ?? "";
  const filterDateFromValue = filterDateFrom ?? "";
  const filterDateToValue = filterDateTo ?? "";
  const editorSelectOptions = editorOptions.length ? editorOptions : DEFAULT_EDITOR_OPTIONS;
  const statusSelectOptions = statusOptions.length ? statusOptions : DEFAULT_STATUS_OPTIONS;

  useEffect(() => {
    if (articles.length === 0) {
      setSelectedCell(null);
      setSelectedIds([]);
      return;
    }

    setSelectedCell((prev) => {
      if (!prev) {
        return { rowIndex: 0, field: "created_at" };
      }
      const clampedIndex = Math.min(prev.rowIndex, articles.length - 1);
      return { rowIndex: clampedIndex, field: prev.field };
    });
  }, [articles.length]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => articles.some((a) => a.id === id)));
  }, [articles]);

  useEffect(() => {
    onSelectedChange?.(selectedIds);
  }, [selectedIds, onSelectedChange]);

  const handleUpdate = async (id: number, field: string, value: string) => {
    const rowIndex = articles.findIndex((a) => a.id === id);
    const prevValue =
      rowIndex >= 0
        ? String((articles[rowIndex] as unknown as Record<string, string | number | null | undefined>)[field] ?? "")
        : "";
    const normalized = value ?? "";
    if (!applyingHistory.current && prevValue !== normalized) {
      undoStack.current.push({ id, field, previous: prevValue, next: normalized });
      redoStack.current = [];
    }

    await onInlineUpdate(id, field, normalized);
  };

    const FIELD_ORDER = ["created_at", "editor", "status", "content_source"];

    const moveField = (delta: number) => {
      setSelectedCell((prev) => {
        if (!prev) return prev;
        const current = FIELD_ORDER.indexOf(prev.field);
        if (current === -1) return prev;
        const nextIndex = Math.min(Math.max(current + delta, 0), FIELD_ORDER.length - 1);
        return { ...prev, field: FIELD_ORDER[nextIndex] };
      });
    };

    const moveSelection = (delta: number) => {
      setSelectedCell((prev) => {
        if (!prev) return prev;
        const newIndex = prev.rowIndex + delta;
        if (newIndex < 0 || newIndex >= articles.length) return prev;
        return { ...prev, rowIndex: newIndex };
      });
    };

  const copyFromAbove = () => {
    if (!selectedCell) return;
    const { rowIndex, field } = selectedCell;
    if (rowIndex === 0) return;
    const above = articles[rowIndex - 1];
    const current = articles[rowIndex];
    const value = (above as unknown as Record<string, string | number | null | undefined> | undefined)?.[field];
    if (value === undefined || current === undefined) return;
    handleUpdate(current.id, field, String(value ?? ""));
  };

  const performUndo = async () => {
    const entry = undoStack.current.pop();
    if (!entry) return;
    applyingHistory.current = true;
    try {
      redoStack.current.push(entry);
      await onInlineUpdate(entry.id, entry.field, entry.previous);
    } finally {
      applyingHistory.current = false;
    }
  };

  const performRedo = async () => {
    const entry = redoStack.current.pop();
    if (!entry) return;
    applyingHistory.current = true;
    try {
      undoStack.current.push(entry);
      await onInlineUpdate(entry.id, entry.field, entry.next);
    } finally {
      applyingHistory.current = false;
    }
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (active && ["INPUT", "SELECT", "TEXTAREA"].includes(active.tagName)) {
        return;
      }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          moveSelection(1);
          if (event.shiftKey && selectedCell) {
            const nextIndex = Math.min(selectedCell.rowIndex + 1, articles.length - 1);
            const nextId = articles[nextIndex]?.id;
            if (nextId) {
              setActiveRowIndex(nextIndex);
              setAnchorRowIndex(anchorRowIndex ?? selectedCell.rowIndex);
              const nextIds = new Set(selectedIds);
              const start = anchorRowIndex ?? selectedCell.rowIndex;
              const end = nextIndex;
              for (let idx = Math.min(start, end); idx <= Math.max(start, end); idx += 1) {
                nextIds.add(articles[idx].id);
              }
              setSelectedIds(Array.from(nextIds));
            }
          }
          if (!event.shiftKey) {
            setAnchorRowIndex(selectedCell?.rowIndex ?? null);
          }
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          moveSelection(-1);
        if (event.shiftKey && selectedCell) {
            const nextIndex = Math.max(selectedCell.rowIndex - 1, 0);
            const nextId = articles[nextIndex]?.id;
            if (nextId) {
              setActiveRowIndex(nextIndex);
              setAnchorRowIndex(anchorRowIndex ?? selectedCell.rowIndex);
              const nextIds = new Set(selectedIds);
              const start = anchorRowIndex ?? selectedCell.rowIndex;
              const end = nextIndex;
              for (let idx = Math.min(start, end); idx <= Math.max(start, end); idx += 1) {
                nextIds.add(articles[idx].id);
              }
              setSelectedIds(Array.from(nextIds));
            }
          }
          if (!event.shiftKey) {
            setAnchorRowIndex(selectedCell?.rowIndex ?? null);
          }
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          moveField(1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          moveField(-1);
        } else if (event.ctrlKey && (event.key === "d" || event.key === "D")) {
        event.preventDefault();
        copyFromAbove();
      } else if (event.ctrlKey && (event.key === "z" || event.key === "Z")) {
        event.preventDefault();
        performUndo();
      } else if (
        event.ctrlKey &&
        (event.key === "y" || event.key === "Y" || event.key === "t" || event.key === "T")
      ) {
        event.preventDefault();
        performRedo();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedCell, articles]);

  const toggleRowSelection = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }
      return prev.filter((rowId) => rowId !== id);
    });
  };

  const toggleAllRows = (checked: boolean) => {
    if (checked) {
      setSelectedIds(articles.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const applyBulk = async (field: string, value: string) => {
    if (!value) {
      alert("적용할 값을 입력해주세요.");
      return;
    }
    if (selectedIds.length === 0) {
      alert("선택된 기사가 없습니다.");
      return;
    }
    await Promise.all(selectedIds.map((id) => handleUpdate(id, field, value)));
  };

  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    const allCount = articles.length;
    const selectedCount = selectedIds.length;
    headerCheckboxRef.current.indeterminate = selectedCount > 0 && selectedCount < allCount;
  }, [selectedIds, articles.length]);

  return (
    <div className="w-full">
      <div className="w-full flex flex-wrap gap-2 mb-3">
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={bulkDate}
          onChange={(e) => setBulkDate(e.target.value)}
        />
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-60"
          onClick={() => applyBulk("created_at", bulkDate)}
          disabled={!bulkDate}
        >
          날짜 적용
        </button>

        <select
          className="border rounded px-2 py-1"
          value={bulkEditor}
          onChange={(e) => setBulkEditor(e.target.value)}
        >
          <option value="">에디터 선택</option>
          {editorSelectOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-60"
          onClick={() => applyBulk("editor", bulkEditor)}
          disabled={!bulkEditor}
        >
          에디터 적용
        </button>

        <select
          className="border rounded px-2 py-1"
          value={bulkStatus}
          onChange={(e) => setBulkStatus(e.target.value)}
        >
          <option value="">상태 선택</option>
          {statusSelectOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-60"
          onClick={() => applyBulk("status", bulkStatus)}
          disabled={!bulkStatus}
        >
          상태 적용
        </button>
      </div>

      <table className="w-full text-left border border-gray-200">
        <colgroup>
          <col style={{ width: "60px" }} />
          <col style={{ width: "60px" }} />
          <col style={{ width: "80px" }} />
          <col />
          <col style={{ width: "120px" }} />
          <col style={{ width: "120px" }} />
          <col style={{ width: "120px" }} />
          <col style={{ width: "180px" }} />
          <col style={{ width: "220px" }} />
        </colgroup>
        <thead className="bg-gray-50 text-sm border-b border-gray-200">
          <tr>
            <th className="px-3 py-2 font-semibold text-gray-800 border-r border-gray-200">
              <input
                type="checkbox"
                ref={headerCheckboxRef}
                checked={articles.length > 0 && selectedIds.length === articles.length}
                onChange={(e) => toggleAllRows(e.target.checked)}
              />
            </th>
            <th className="px-3 py-2 font-semibold text-gray-800 border-r border-gray-200">#</th>
            <th className="px-3 py-2 font-semibold text-gray-800 border-r border-gray-200">썸네일</th>
            <th className="px-3 py-2 font-semibold text-gray-800 border-r border-gray-200">제목</th>
            <th className="px-3 py-2 font-semibold text-gray-800 border-r border-gray-200">날짜</th>
            <th className="px-3 py-2 font-semibold text-gray-800 border-r border-gray-200">에디터</th>
            <th className="px-3 py-2 font-semibold text-gray-800 border-r border-gray-200">상태</th>
            <th className="px-3 py-2 font-semibold text-gray-800 border-r border-gray-200">출처</th>
            <th className="px-3 py-2 font-semibold text-gray-800">메모</th>
          </tr>
          {filtersEnabled && (
            <tr className="border-b border-gray-200 bg-white text-xs text-gray-600">
              <th className="py-1 px-1 border-r border-gray-200">
                <button
                  className="text-blue-600 underline text-[11px]"
                  onClick={(e) => {
                    e.preventDefault();
                    onResetFilters?.();
                  }}
                >
                  초기화
                </button>
              </th>
              <th />
              <th />
              <th className="py-1 px-1 border-r border-gray-200">
                <input
                  className="border rounded px-1 py-0.5 text-xs w-full"
                  placeholder="제목"
                  value={filterTitleValue}
                  onChange={(e) => onFilterTitleChange?.(e.target.value)}
                />
              </th>
              <th className="py-1 px-1 border-r border-gray-200">
                <div className="flex gap-1">
                  <input
                    type="date"
                    className="border rounded px-1 py-0.5 text-xs w-full"
                    value={filterDateFromValue}
                    onChange={(e) => onFilterDateFromChange?.(e.target.value)}
                  />
                  <span className="self-center text-gray-400 text-[10px]">~</span>
                  <input
                    type="date"
                    className="border rounded px-1 py-0.5 text-xs w-full"
                    value={filterDateToValue}
                    onChange={(e) => onFilterDateToChange?.(e.target.value)}
                  />
                </div>
              </th>
              <th className="py-1 px-1 border-r border-gray-200">
                <select
                  className="border rounded px-1 py-0.5 text-xs w-full"
                  value={filterEditorValue}
                  onChange={(e) => onFilterEditorChange?.(e.target.value)}
                >
                  <option value="">전체</option>
                  {editorSelectOptions.map((editor) => (
                    <option key={editor} value={editor}>
                      {editor}
                    </option>
                  ))}
                </select>
              </th>
              <th className="py-1 px-1 border-r border-gray-200">
                <select
                  className="border rounded px-1 py-0.5 text-xs w-full"
                  value={filterStatusValue}
                  onChange={(e) => onFilterStatusChange?.(e.target.value)}
                >
                  <option value="">전체</option>
                  {statusSelectOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </th>
              <th className="border-r border-gray-200" />
              <th />
            </tr>
          )}
        </thead>

        <tbody>
          {articles.map((item, index) => (
            <TrackerRow
              key={item.id}
              index={index}
              item={item}
              onTitleClick={onTitleClick}
              onInlineUpdate={handleUpdate}
              onImageClick={onImageClick}
              onMemoClick={onMemoClick}
              selectedCell={selectedCell}
              onSelectCell={(rowIdx, field) => {
                setSelectedCell({ rowIndex: rowIdx, field });
                setActiveRowIndex(rowIdx);
              }}
              rowSelected={selectedIds.includes(item.id)}
              onToggleRow={(checked) => {
                toggleRowSelection(item.id, checked);
                setActiveRowIndex(index);
              }}
              rowActive={activeRowIndex === index}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}