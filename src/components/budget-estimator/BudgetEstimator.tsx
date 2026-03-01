"use client";

// [CYCL:d8abe72a] Parent component: owns form state, triggers API call, shows results and toast notifications
import { useState } from "react";
import BudgetEstimatorForm from "./BudgetEstimatorForm";
import BudgetBreakdownTable from "./BudgetBreakdownTable";

export type TravelStyle = "budget" | "mid-range" | "luxury";

interface LineItem {
  label: string;
  perPerson: number;
  total: number;
}

interface EstimateResult {
  lineItems: LineItem[];
  grandTotal: number;
  grandTotalPerPerson: number;
  currency: string;
  travelers: number;
}

interface BudgetEstimatorProps {
  destination: string;
  tripId?: string;
  initialDuration?: number;
}

export default function BudgetEstimator({
  destination,
  tripId,
  initialDuration,
}: BudgetEstimatorProps) {
  const [travelers, setTravelers] = useState(2);
  const [duration, setDuration] = useState(initialDuration ?? 7);
  const [style, setStyle] = useState<TravelStyle>("mid-range");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EstimateResult | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Simple toast state
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleEstimate() {
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/estimate-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, travelers, duration, style }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to estimate budget");
      }

      const data: EstimateResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result || !tripId) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/trips/${tripId}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          travelers: result.travelers,
          durationDays: duration,
          style,
          lineItems: result.lineItems,
          grandTotal: result.grandTotal,
          currency: result.currency,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save budget");
      }

      setSaved(true);
      showToast("Budget estimate saved to your trip!");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save budget");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            Budget Estimator
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            AI-powered cost breakdown for{" "}
            <span className="font-semibold text-indigo-600">{destination}</span>
          </p>
        </div>

        <BudgetEstimatorForm
          travelers={travelers}
          duration={duration}
          style={style}
          loading={loading}
          onTravelersChange={setTravelers}
          onDurationChange={(v) => {
            setDuration(v);
            setSaved(false);
          }}
          onStyleChange={(v) => {
            setStyle(v);
            setSaved(false);
          }}
          onSubmit={handleEstimate}
        />

        {error && (
          <p className="mt-4 text-red-500 text-sm text-center">{error}</p>
        )}

        {result && (
          <BudgetBreakdownTable
            lineItems={result.lineItems}
            grandTotal={result.grandTotal}
            grandTotalPerPerson={result.grandTotalPerPerson}
            travelers={result.travelers}
            currency={result.currency}
            tripId={tripId}
            destination={destination}
            duration={duration}
            style={style}
            onSave={handleSave}
            saving={saving}
            saved={saved}
          />
        )}
      </div>
    </div>
  );
}
