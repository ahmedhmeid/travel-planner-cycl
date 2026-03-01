"use client";

// [CYCL:41e8dbe1] Trip creation form — collects travel dates & activities, creates a trip record, then navigates to the packing list
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function NewTripForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const destination = searchParams.get("destination") ?? "";
  const name = searchParams.get("name") ?? "Unknown Destination";

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activitiesInput, setActivitiesInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const activities = activitiesInput
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          name,
          start_date: startDate || null,
          end_date: endDate || null,
          activities,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create trip");
      }

      const trip = await res.json();
      router.push(`/trips/${trip.id}/packing`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md">
        <Link
          href="/spinner"
          className="text-indigo-400 hover:text-indigo-600 text-sm flex items-center gap-1 mb-6 transition-colors"
        >
          ← Spin again
        </Link>

        <div className="text-4xl mb-3 text-center">🧳</div>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
          Trip to {name}
        </h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          Add details to get the most accurate packing list
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Departure Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Return Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Planned Activities{" "}
              <span className="font-normal text-gray-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={activitiesInput}
              onChange={(e) => setActivitiesInput(e.target.value)}
              placeholder="hiking, beach, city tours, scuba diving…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-md hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating trip…
              </>
            ) : (
              "🎒 Create Trip & Build Packing List"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function NewTripPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <NewTripForm />
    </Suspense>
  );
}
