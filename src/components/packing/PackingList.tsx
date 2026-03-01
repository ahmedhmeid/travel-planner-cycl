"use client";

// [CYCL:41e8dbe1] Top-level packing list component: fetches data, shows progress, handles regenerate, composes category sections
import { useState, useEffect, useCallback } from "react";
import type { PackingItem, PackingCategory, PackingListWithItems } from "@/types/packing";
import PackingCategoryComponent from "./PackingCategory";

interface PackingListProps {
  tripId: string;
  tripName: string;
}

export default function PackingList({ tripId, tripName }: PackingListProps) {
  const [data, setData] = useState<PackingListWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/packing-list`);
      if (!res.ok) throw new Error("Failed to load packing list");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  async function generateList() {
    setGenerating(true);
    setError(null);
    setShowRegenerateConfirm(false);
    try {
      const res = await fetch(`/api/trips/${tripId}/packing-list`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to generate packing list");
      }
      const json: PackingListWithItems = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  function handleItemDeleted(itemId: string) {
    if (!data) return;
    const categories = data.categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((i) => i.id !== itemId),
      }))
      .filter((cat) => cat.items.length > 0);
    setData({ ...data, categories });
  }

  function handleItemAdded(categoryName: string, item: PackingItem) {
    if (!data) return;
    const categories = data.categories.map((cat) => {
      if (cat.name === categoryName) {
        return { ...cat, items: [...cat.items, item] };
      }
      return cat;
    });
    // If the category doesn't exist yet (edge case), add it
    if (!categories.find((c) => c.name === categoryName)) {
      categories.push({ name: categoryName, items: [item] });
    }
    setData({ ...data, categories });
  }

  // Flatten all items to compute progress
  const allItems: PackingItem[] = data?.categories.flatMap((c) => c.items) ?? [];
  const checkedCount = allItems.filter((i) => i.checked).length;
  const totalCount = allItems.length;
  const progressPct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-500 text-sm">Loading your packing list…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchList}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  // No list yet — prompt to generate
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">🎒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No packing list yet
        </h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          Let AI build a smart, categorized packing checklist tailored to your
          trip to <strong>{tripName}</strong>.
        </p>
        <button
          onClick={generateList}
          disabled={generating}
          className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center gap-2"
        >
          {generating ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating…
            </>
          ) : (
            "✨ Generate Packing List"
          )}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {checkedCount} of {totalCount} items packed
          </span>
          <span className="text-sm font-bold text-indigo-600">{progressPct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {progressPct === 100 && totalCount > 0 && (
          <p className="text-green-600 text-sm font-medium mt-2 text-center">
            🎉 You&apos;re all packed!
          </p>
        )}
      </div>

      {/* Regenerate button */}
      <div className="flex justify-end mb-4">
        {showRegenerateConfirm ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Replace your current list?</span>
            <button
              onClick={generateList}
              disabled={generating}
              className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
            >
              {generating ? "Generating…" : "Yes, regenerate"}
            </button>
            <button
              onClick={() => setShowRegenerateConfirm(false)}
              className="px-3 py-1.5 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowRegenerateConfirm(true)}
            className="text-sm text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M1.5 8A6.5 6.5 0 1 1 4 12.5" />
              <polyline points="1.5,5 1.5,8 4.5,8" />
            </svg>
            Regenerate list
          </button>
        )}
      </div>

      {/* Category sections */}
      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
        {data.categories.map((cat: PackingCategory) => (
          <div key={cat.name} className="px-5 py-4">
            <PackingCategoryComponent
              name={cat.name}
              items={cat.items}
              tripId={tripId}
              onItemDeleted={handleItemDeleted}
              onItemAdded={(item) => handleItemAdded(cat.name, item)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
