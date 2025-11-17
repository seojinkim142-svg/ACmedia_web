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
  onDoubleClick: (item: Article) => void;
  onInlineUpdate: (id: number, field: string, value: string) => Promise<unknown> | void;
  onImageClick: (e: MouseEvent, item: Article) => void;
  onMemoClick: (item: Article) => void;
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
  onDoubleClick,
  onInlineUpdate,
  onImageClick,
  onMemoClick,
}: TrackerTableProps) {
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const undoStack = useRef<HistoryEntry[]>([]);
  const redoStack = useRef<HistoryEntry[]>([]);
  const applyingHistory = useRef(false);

  useEffect(() => {
    if (articles.length === 0) {
      setSelectedCell(null);
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

  const handleUpdate = async (id: number, field: string, value: string) => {
    const rowIndex = articles.findIndex((a) => a.id === id);
    const prevValue = rowIndex >= 0 ? String((articles[rowIndex] as any)[field] ?? "") : "";
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
    const value = (above as any)?.[field];
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
    const handler = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      const active = document.activeElement as HTMLElement | null;
      if (active && ["INPUT", "SELECT", "TEXTAREA"].includes(active.tagName)) {
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveSelection(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveSelection(-1);
      } else if (e.ctrlKey && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        copyFromAbove();
      } else if (e.ctrlKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        performUndo();
      } else if (
        e.ctrlKey &&
        (e.key === "y" || e.key === "Y" || e.key === "t" || e.key === "T")
      ) {
        e.preventDefault();
        performRedo();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedCell, articles]);

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b bg-gray-100">
          <th className="py-2 px-1 w-10 text-sm">#</th>
          <th className="py-2 px-1 w-16 text-sm">사진</th>
          <th className="py-2 px-1 w-20 text-sm">날짜</th>
          <th className="py-2 px-1 w-20 text-sm">편집자</th>
          <th className="py-2 px-2 w-[320px] text-sm">제목</th>
          <th className="py-2 px-1 w-20 text-sm">상태</th>
          <th className="py-2 px-2 w-[220px] text-sm">메모</th>
        </tr>
      </thead>

      <tbody>
        {articles.map((item, index) => (
          <TrackerRow
            key={item.id}
            index={index}
            item={item}
            onDoubleClick={onDoubleClick}
            onInlineUpdate={handleUpdate}
            onImageClick={onImageClick}
            onMemoClick={onMemoClick}
            selectedCell={selectedCell}
            onSelectCell={(rowIdx, field) =>
              setSelectedCell({ rowIndex: rowIdx, field })
            }
          />
        ))}
      </tbody>
    </table>
  );
}
