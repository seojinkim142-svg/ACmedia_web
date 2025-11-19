import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import TrackerRow from "./TrackerRow";

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

interface TrackerTableProps {
  articles: Article[];
  onTitleClick: (item: Article) => void;
  onInlineUpdate: (id: number, field: string, value: string) => Promise<unknown> | void;
  onImageClick: (e: MouseEvent, item: Article) => void;
  onMemoClick: (item: Article) => void;
  onSelectedChange?: (ids: number[]) => void;
  filterTitle?: string;
  filterStatus?: string;
  filterEditor?: string;
  filterDate?: string;
  onFilterTitleChange?: (value: string) => void;
  onFilterStatusChange?: (value: string) => void;
  onFilterEditorChange?: (value: string) => void;
  onFilterDateChange?: (value: string) => void;
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
  filterDate,
  onFilterTitleChange,
  onFilterStatusChange,
  onFilterEditorChange,
  onFilterDateChange,
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

  const filtersEnabled =
    onFilterTitleChange ||
    onFilterStatusChange ||
    onFilterEditorChange ||
    onFilterDateChange ||
    onResetFilters;
  const filterTitleValue = filterTitle ?? "";
  const filterStatusValue = filterStatus ?? "";
  const filterEditorValue = filterEditor ?? "";
  const filterDateValue = filterDate ?? "";

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
        ? String(
            (
              articles[rowIndex] as unknown as Record<string, string | number | null | undefined>
            )[field] ?? ""
          )
        : "";
    const normalized = value ?? "";
    if (!applyingHistory.current && prevValue !== normalized) {
      undoStack.current.push({ id, field, previous: prevValue, next: normalized });
      redoStack.current = [];
    }

    await onInlineUpdate(id, field, normalized);
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
    const value = (above as unknown as Record<string, string | number | null | undefined> | undefined)?.[
      field
    ];
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
      if (!selectedCell) return;
      const active = document.activeElement as HTMLElement | null;
      if (active && ["INPUT", "SELECT", "TEXTAREA"].includes(active.tagName)) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        moveSelection(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        moveSelection(-1);
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
      alert("적용할 값을 입력하세요.");
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
    headerCheckboxRef.current.indeterminate =
      selectedCount > 0 && selectedCount < allCount;
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
          <option value="">편집자 선택</option>
          <option value="지민">지민</option>
          <option value="지안">지안</option>
          <option value="아라">아라</option>
          <option value="서진">서진</option>
        </select>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-60"
          onClick={() => applyBulk("editor", bulkEditor)}
          disabled={!bulkEditor}
        >
          편집자 적용
        </button>

        <select
          className="border rounded px-2 py-1"
          value={bulkStatus}
          onChange={(e) => setBulkStatus(e.target.value)}
        >
          <option value="">상태 선택</option>
          <option value="리뷰">리뷰</option>
          <option value="추천">추천</option>
          <option value="보류">보류</option>
          <option value="본문 작성">본문 작성</option>
          <option value="본문 완료">본문 완료</option>
          <option value="이미지 작성">이미지 작성</option>
          <option value="이미지 완료">이미지 완료</option>
          <option value="업로드 대기">업로드 대기</option>
          <option value="업로드">업로드</option>
          <option value="중복">중복</option>
        </select>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-60"
          onClick={() => applyBulk("status", bulkStatus)}
          disabled={!bulkStatus}
        >
          상태 적용
        </button>
      </div>

      <table className="w-full text-left border-collapse table-fixed">
        <colgroup>
          <col style={{ width: "3.75rem" }} />
          <col style={{ width: "1.75rem" }} />
          <col style={{ width: "3.5rem" }} />
          <col style={{ width: "6rem" }} />
          <col style={{ width: "4.5rem" }} />
          <col style={{ width: "320px" }} />
          <col style={{ width: "5rem" }} />
          <col style={{ width: "220px" }} />
        </colgroup>
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="py-2 px-1 w-8 text-sm text-center">
              <input
                type="checkbox"
                ref={headerCheckboxRef}
                checked={
                  articles.length > 0 && selectedIds.length === articles.length
                }
                onChange={(e) => toggleAllRows(e.target.checked)}
              />
            </th>
            <th className="py-2 px-1 w-10 text-sm">#</th>
            <th className="py-2 px-1 w-16 text-sm">썸네일</th>
            <th className="py-2 px-1 w-28 text-sm">날짜</th>
            <th className="py-2 px-1 w-20 text-sm">편집자</th>
            <th className="py-2 px-2 w-[320px] text-sm">제목</th>
            <th className="py-2 px-1 w-20 text-sm">상태</th>
            <th className="py-2 px-2 w-[220px] text-sm">댓글</th>
          </tr>
          {filtersEnabled && (
            <tr className="border-b bg-white text-xs text-gray-600">
              <th className="py-1 px-1">
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
              <th className="py-1 px-1">
                <input
                  type="date"
                  className="border rounded px-1 py-0.5 text-xs w-full"
                  value={filterDateValue}
                  onChange={(e) => onFilterDateChange?.(e.target.value)}
                />
              </th>
              <th className="py-1 px-1">
                <select
                  className="border rounded px-1 py-0.5 text-xs w-full"
                  value={filterEditorValue}
                  onChange={(e) => onFilterEditorChange?.(e.target.value)}
                >
                  <option value="">전체</option>
                  {editorOptions.map((editor) => (
                    <option key={editor} value={editor}>
                      {editor}
                    </option>
                  ))}
                </select>
              </th>
              <th className="py-1 px-1">
                <input
                  className="border rounded px-1 py-0.5 text-xs w-full"
                  placeholder="제목"
                  value={filterTitleValue}
                  onChange={(e) => onFilterTitleChange?.(e.target.value)}
                />
              </th>
              <th className="py-1 px-1">
                <select
                  className="border rounded px-1 py-0.5 text-xs w-full"
                  value={filterStatusValue}
                  onChange={(e) => onFilterStatusChange?.(e.target.value)}
                >
                  <option value="">전체</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </th>
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
              onSelectCell={(rowIdx, field) =>
                setSelectedCell({ rowIndex: rowIdx, field })
              }
              rowSelected={selectedIds.includes(item.id)}
              onToggleRow={(checked) => toggleRowSelection(item.id, checked)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
