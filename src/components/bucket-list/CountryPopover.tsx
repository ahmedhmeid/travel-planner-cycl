"use client";

// [CYCL:fe9bf0bb] Popover rendered when a user clicks a country on the map
import { allCountries } from "@/lib/countries";
import type { DestinationStatus } from "@/lib/destinations";

interface CountryPopoverProps {
  countryCode: string;    // alpha-2
  countryName: string;
  currentStatus: DestinationStatus | undefined;
  onAdd: (status: DestinationStatus) => void;
  onRemove: () => void;
  onClose: () => void;
}

export default function CountryPopover({
  countryCode,
  countryName,
  currentStatus,
  onAdd,
  onRemove,
  onClose,
}: CountryPopoverProps) {
  const country = allCountries.find((c) => c.code === countryCode);
  const flag = country?.flag ?? "🌍";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-gray-800 border border-gray-600 rounded-2xl shadow-2xl p-6 w-full max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{flag}</span>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">{countryName}</h3>
              {currentStatus && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    currentStatus === "visited"
                      ? "bg-green-900/60 text-green-300"
                      : "bg-yellow-900/60 text-yellow-300"
                  }`}
                >
                  {currentStatus === "visited" ? "✓ Visited" : "★ Wishlist"}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {currentStatus !== "visited" && (
            <button
              onClick={() => onAdd("visited")}
              className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              ✓ Mark as Visited
            </button>
          )}
          {currentStatus !== "wishlist" && (
            <button
              onClick={() => onAdd("wishlist")}
              className="w-full py-2.5 px-4 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              ★ Add to Wishlist
            </button>
          )}
          {currentStatus && (
            <button
              onClick={onRemove}
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-xl transition-colors text-sm"
            >
              Remove
            </button>
          )}
          {!currentStatus && (
            <p className="text-center text-gray-500 text-xs mt-1">
              Click an action above to add this country
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
