"use client";

// [CYCL:d8abe72a] Displays cost breakdown table with per-person and total columns, grand total, and Save to Trip button
interface LineItem {
  label: string;
  perPerson: number;
  total: number;
}

interface BudgetBreakdownTableProps {
  lineItems: LineItem[];
  grandTotal: number;
  grandTotalPerPerson: number;
  travelers: number;
  currency: string;
  tripId?: string;
  destination: string;
  duration: number;
  style: string;
  onSave?: () => void;
  saving?: boolean;
  saved?: boolean;
}

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BudgetBreakdownTable({
  lineItems,
  grandTotal,
  grandTotalPerPerson,
  travelers,
  currency,
  tripId,
  onSave,
  saving,
  saved,
}: BudgetBreakdownTableProps) {
  return (
    <div className="mt-6">
      {/* Grand total banner */}
      <div className="bg-indigo-600 text-white rounded-2xl p-5 mb-4 text-center shadow-lg">
        <p className="text-sm font-medium opacity-80 mb-1">
          Estimated Total for {travelers} {travelers === 1 ? "traveler" : "travelers"}
        </p>
        <p className="text-4xl font-extrabold tracking-tight">
          {fmt(grandTotal, currency)}
        </p>
        {travelers > 1 && (
          <p className="text-sm opacity-75 mt-1">
            {fmt(grandTotalPerPerson, currency)} per person
          </p>
        )}
      </div>

      {/* Line items table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Category
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Per Person
              </th>
              {travelers > 1 && (
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Total
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lineItems.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{item.label}</td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                  {fmt(item.perPerson, currency)}
                </td>
                {travelers > 1 && (
                  <td className="px-4 py-3 text-right text-gray-900 font-semibold tabular-nums">
                    {fmt(item.total, currency)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-indigo-50 border-t-2 border-indigo-100">
              <td className="px-4 py-3 font-bold text-indigo-900">Grand Total</td>
              <td className="px-4 py-3 text-right font-bold text-indigo-900 tabular-nums">
                {fmt(grandTotalPerPerson, currency)}
              </td>
              {travelers > 1 && (
                <td className="px-4 py-3 text-right font-bold text-indigo-900 tabular-nums">
                  {fmt(grandTotal, currency)}
                </td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-2 text-center">
        Estimates in {currency} — actual costs may vary with exchange rates.
      </p>

      {/* Save to Trip button (only shown when tripId is provided) */}
      {tripId && onSave && (
        <button
          onClick={onSave}
          disabled={saving || saved}
          className={`w-full mt-4 py-3 font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 ${
            saved
              ? "bg-green-500 text-white"
              : "bg-white border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 disabled:opacity-60"
          }`}
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              Saving…
            </>
          ) : saved ? (
            "✓ Saved to Trip!"
          ) : (
            "📌 Save to Trip"
          )}
        </button>
      )}
    </div>
  );
}
