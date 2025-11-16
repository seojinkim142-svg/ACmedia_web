import { useState } from "react";

interface InlineCellProps {
  value: string | number | null | undefined;
  type?: "text" | "date" | "select";
  options?: string[];
  onUpdate: (newValue: string) => void;
  highlight?: boolean;
}

export default function InlineCell({
  value,
  type = "text",
  options = [],
  onUpdate,
  highlight = false,
}: InlineCellProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    if (type === "select") {
      return (
        <td className="py-2 px-1">
          <select
            className="border rounded px-1"
            value={value || ""}
            onChange={(e) => onUpdate(e.target.value)}
            onBlur={() => setEditing(false)}
          >
            {options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </td>
      );
    }

    return (
      <td className="py-2 px-1">
        <input
          type={type}
          className="border rounded px-1 w-full"
          value={value || ""}
          onChange={(e) => onUpdate(e.target.value)}
          onBlur={() => setEditing(false)}
        />
      </td>
    );
  }

  return (
    <td
      className={`py-2 px-1 cursor-pointer ${
        highlight ? "underline text-blue-600" : ""
      }`}
      onClick={() => setEditing(true)}
    >
      {value}
    </td>
  );
}
