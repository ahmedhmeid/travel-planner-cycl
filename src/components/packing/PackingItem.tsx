"use client";

// [CYCL:41e8dbe1] Renders a single packing item with checkbox, label, and delete button; optimistic local state before PATCH
import { useState } from "react";
import type { PackingItem as PackingItemType } from "@/types/packing";

interface PackingItemProps {
  item: PackingItemType;
  tripId: string;
  onDelete: (itemId: string) => void;
}

export default function PackingItem({ item, tripId, onDelete }: PackingItemProps) {
  const [checked, setChecked] = useState(item.checked);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleToggle() {
    const next = !checked;
    // Optimistic update — flip immediately, revert on error
    setChecked(next);

    try {
      const res = await fetch(
        `/api/trips/${tripId}/packing-list/${item.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checked: next }),
        }
      );
      if (!res.ok) throw new Error("PATCH failed");
    } catch {
      // Revert optimistic update
      setChecked(!next);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/trips/${tripId}/packing-list/${item.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        onDelete(item.id);
      } else {
        setIsDeleting(false);
      }
    } catch {
      setIsDeleting(false);
    }
  }

  return (
    <li
      className={`flex items-center gap-2 py-1.5 px-1 rounded-lg group transition-opacity ${
        isDeleting ? "opacity-40" : ""
      }`}
    >
      <button
        onClick={handleToggle}
        aria-label={checked ? "Uncheck item" : "Check item"}
        className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          checked
            ? "bg-indigo-600 border-indigo-600"
            : "border-gray-300 hover:border-indigo-400"
        }`}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="1.5,6 4.5,9 10.5,3" />
          </svg>
        )}
      </button>

      <span
        className={`flex-1 text-sm transition-colors select-none cursor-pointer ${
          checked ? "line-through text-gray-400" : "text-gray-700"
        } ${item.is_custom ? "italic" : ""}`}
        onClick={handleToggle}
      >
        {item.name}
        {item.is_custom && (
          <span className="ml-1 text-xs text-indigo-400">(custom)</span>
        )}
      </span>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="Delete item"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 p-0.5 rounded"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M2 4h12M6 4V2h4v2M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" />
          <line x1="7" y1="7" x2="7" y2="11" />
          <line x1="9" y1="7" x2="9" y2="11" />
        </svg>
      </button>
    </li>
  );
}
