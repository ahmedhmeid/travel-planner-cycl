"use client";

// [CYCL:d8abe72a] Controlled form for budget estimate inputs: travelers, duration, travel style
import type { TravelStyle } from "./BudgetEstimator";

interface BudgetEstimatorFormProps {
  travelers: number;
  duration: number;
  style: TravelStyle;
  loading: boolean;
  onTravelersChange: (v: number) => void;
  onDurationChange: (v: number) => void;
  onStyleChange: (v: TravelStyle) => void;
  onSubmit: () => void;
}

const STYLE_OPTIONS: { value: TravelStyle; label: string; emoji: string; desc: string }[] = [
  { value: "budget", label: "Budget", emoji: "🎒", desc: "Hostels, street food, local transport" },
  { value: "mid-range", label: "Mid-Range", emoji: "✈️", desc: "3-star hotels, restaurants, taxis" },
  { value: "luxury", label: "Luxury", emoji: "💎", desc: "5-star, business class, private tours" },
];

export default function BudgetEstimatorForm({
  travelers,
  duration,
  style,
  loading,
  onTravelersChange,
  onDurationChange,
  onStyleChange,
  onSubmit,
}: BudgetEstimatorFormProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Travelers + Duration row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Travelers
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={travelers}
            onChange={(e) => onTravelersChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Duration (days)
          </label>
          <input
            type="number"
            min={1}
            max={90}
            value={duration}
            onChange={(e) => onDurationChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* Travel style */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Travel Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStyleChange(opt.value)}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center ${
                style === opt.value
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
              }`}
            >
              <span className="text-2xl mb-1">{opt.emoji}</span>
              <span className="text-xs font-bold text-gray-800">{opt.label}</span>
              <span className="text-xs text-gray-500 leading-tight mt-0.5 hidden sm:block">
                {opt.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-md hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Estimating costs…
          </>
        ) : (
          "💰 Estimate Budget"
        )}
      </button>
    </form>
  );
}
