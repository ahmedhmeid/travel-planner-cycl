"use client";

// [CYCL:0351b220] Animated reveal card displaying the selected destination with action buttons
import { AnimatePresence, motion } from "framer-motion";
import { getBestMonthsLabel, type Country } from "@/lib/countries";
import { useRouter } from "next/navigation";

interface DestinationRevealProps {
  country: Country | null;
  onRespin: () => void;
}

export default function DestinationReveal({ country, onRespin }: DestinationRevealProps) {
  const router = useRouter();

  function handleStartTrip() {
    if (!country) return;
    const params = new URLSearchParams({
      destination: country.code,
      name: country.name,
    });
    router.push(`/trips/new?${params.toString()}`);
  }

  return (
    <AnimatePresence mode="wait">
      {country && (
        <motion.div
          key={country.code}
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="bg-white rounded-3xl p-8 shadow-2xl text-center"
        >
          {/* Flag */}
          <div className="text-8xl mb-4 leading-none" role="img" aria-label={`Flag of ${country.name}`}>
            {country.flag}
          </div>

          {/* Country name */}
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{country.name}</h2>
          <p className="text-indigo-600 font-medium mb-6">{country.region}</p>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Language</p>
              <p className="text-sm font-semibold text-gray-800">
                {country.languages.slice(0, 2).join(", ")}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Best Time</p>
              <p className="text-sm font-semibold text-gray-800">
                {getBestMonthsLabel(country.bestMonths.slice(0, 3))}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Climate</p>
              <p className="text-sm font-semibold text-gray-800 capitalize">
                {country.climateZones.slice(0, 2).join(", ")}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">US Visa</p>
              <p className={`text-sm font-semibold ${country.visaFreeForUS ? "text-green-600" : "text-orange-600"}`}>
                {country.visaFreeForUS ? "✓ Visa-free" : "Visa required"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onRespin}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-indigo-200 text-indigo-700 font-semibold hover:bg-indigo-50 transition-colors"
            >
              Spin Again
            </button>
            <button
              onClick={handleStartTrip}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-md"
            >
              Start Trip →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
