import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

interface InlineCellProps {
  value: string | number | null | undefined;
  type?: "text" | "date" | "select";
  options?: string[];
  onUpdate: (newValue: string) => void;
  highlight?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
}

export default function InlineCell({
  value,
  type = "text",
  options = [],
  onUpdate,
  highlight = false,
  selected = false,
  onSelect,
  className = "",
}: InlineCellProps) {
  const [editing, setEditing] = useState(false);
  const controlRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);
  const handleEditingKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setEditing(false);
      (event.currentTarget as HTMLInputElement | HTMLSelectElement).blur();
    }
  };

  useEffect(() => {
    if (!selected && editing) {
      setEditing(false);
    }
  }, [selected, editing]);

  useEffect(() => {
    if (!editing) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (controlRef.current && !controlRef.current.contains(event.target as Node)) {
        setEditing(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [editing]);

  const tdStyle = { width: 0 };

  if (editing) {
    if (type === "select") {
      return (
      <td className={`py-2 px-1 ${className}`} style={tdStyle}>
        <select
          className="border rounded px-1 w-full"
          value={value || ""}
          onChange={(e) => {
            onUpdate(e.target.value);
            setEditing(false);
          }}
          onBlur={() => setEditing(false)}
          onKeyDown={handleEditingKeyDown}
          autoFocus
          style={{ minWidth: 0 }}
          ref={(el) => {
            controlRef.current = el;
          }}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </td>
      );
    }

    return (
      <td className={`py-2 px-1 ${className}`} style={tdStyle}>
        <input
          type={type}
          className="border rounded px-1 w-full"
          value={value || ""}
          onChange={(e) => onUpdate(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={handleEditingKeyDown}
          autoFocus
          style={{ minWidth: 0 }}
          ref={(el) => {
            controlRef.current = el;
          }}
        />
      </td>
    );
  }

  return (
    <td
      tabIndex={0}
      className={`py-2 px-1 cursor-pointer ${highlight ? "underline text-blue-600" : ""} ${
        selected ? "ring-2 ring-blue-400 rounded" : ""
      } ${className}`}
      style={tdStyle}
      onClick={(e) => {
        e.stopPropagation();
        if (!selected) {
          onSelect?.();
        }
        setEditing(true);
      }}
      onFocus={() => onSelect?.()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === "F2") && selected) {
          e.preventDefault();
          setEditing(true);
        }
      }}
    >
      <div className="w-full truncate">{value ?? ""}</div>
    </td>
  );
}
