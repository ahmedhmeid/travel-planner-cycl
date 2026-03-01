"use client";

// [CYCL:41e8dbe1] Renders a category group with its items, inline add-custom-item input, and item-level actions
import { useState } from "react";
import type { PackingItem as PackingItemType } from "@/types/packing";
import PackingItem from "./PackingItem";

interface PackingCategoryProps {
  name: string;
  items: PackingItemType[];
  tripId: string;
  onItemDeleted: (itemId: string) => void;
  onItemAdded: (item: PackingItemType) => void;
}

export default function PackingCategory({
  name,
  items,
  tripId,
  onItemDeleted,
  onItemAdded,
}: PackingCategoryProps) {
  const [adding, setAdding] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Infer the list_id from the first item (all items in a category share the same list)
  const listId = items[0]?.list_id;

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed || !listId) return;

    setIsSubmitting(true);
    try {
      // POST a new custom item directly to the items API (via the packing-list route, using PATCH body approach)
      // We POST to a sub-route for adding items to an existing list
      const res = await fetch(`/api/trips/${tripId}/packing-list/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          list_id: listId,
          category: name,
          name: trimmed,
          is_custom: true,
        }),
      });

      if (res.ok) {
        const item = await res.json();
        onItemAdded(item);
        setNewItemName("");
        setAdding(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          {name}
        </h3>
        <span className="text-xs text-gray-400">
          {checkedCount}/{items.length}
        </span>
      </div>

      <ul className="space-y-0.5">
        {items.map((item) => (
          <PackingItem
            key={item.id}
            item={item}
            tripId={tripId}
            onDelete={onItemDeleted}
          />
        ))}
      </ul>

      {adding ? (
        <form onSubmit={handleAddItem} className="mt-2 flex gap-2">
          <input
            autoFocus
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Item name..."
            maxLength={100}
            className="flex-1 text-sm px-3 py-1.5 border border-indigo-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newItemName.trim()}
            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setNewItemName("");
            }}
            className="px-3 py-1.5 text-gray-500 text-sm rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="7" y1="2" x2="7" y2="12" />
            <line x1="2" y1="7" x2="12" y2="7" />
          </svg>
          Add item
        </button>
      )}
    </div>
  );
}
