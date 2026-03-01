"use client";

// [CYCL:0351b220] Spinner page — composes filter panel, animated spinner widget, and destination reveal card
import { useState, useMemo, useCallback } from "react";
import { allCountries, applyFilters, type Country } from "@/lib/countries";
import {
  DestinationSpinner,
  DestinationReveal,
  SpinnerFilters,
  type FilterState,
} from "@/components/spinner";

const DEFAULT_FILTERS: FilterState = {
  continents: [],
  climates: [],
  visaFreeOnly: false,
};

export default function SpinnerPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<Country | null>(null);

  const filteredPool = useMemo(
    () => applyFilters(allCountries, filters),
    [filters]
  );

  const handleResult = useCallback((country: Country) => {
    setResult(country);
  }, []);

  const handleSpinStart = useCallback(() => {
    setResult(null);
    setIsSpinning(true);
  }, []);

  const handleSpinEnd = useCallback(() => {
    setIsSpinning(false);
  }, []);

  const handleRespin = useCallback(() => {
    setResult(null);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col">
      {/* Header */}
      <header className="text-center pt-10 pb-4 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
          Where to Next?
        </h1>
        <p className="text-white/80 mt-2 text-lg">
          Spin the globe — your next adventure awaits
        </p>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-6 px-4 pb-10 max-w-5xl mx-auto w-full">
        {/* Filters panel */}
        <aside className="w-full lg:w-80 shrink-0">
          <SpinnerFilters filters={filters} onChange={setFilters} />
        </aside>

        {/* Spinner + reveal */}
        <section className="flex-1 flex flex-col items-center gap-8 w-full">
          <DestinationSpinner
            pool={filteredPool}
            onResult={handleResult}
            isSpinning={isSpinning}
            onSpinStart={handleSpinStart}
            onSpinEnd={handleSpinEnd}
          />

          {!isSpinning && result && (
            <div className="w-full max-w-sm">
              <DestinationReveal country={result} onRespin={handleRespin} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
