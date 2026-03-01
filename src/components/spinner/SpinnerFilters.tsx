"use client";

// [CYCL:0351b220] Filter panel component for the destination spinner — emits FilterState on change
import { ALL_CLIMATE_ZONES, ALL_CONTINENTS, type ClimateZone, type Continent } from "@/lib/countries";

export interface FilterState {
  continents: Continent[];
  climates: ClimateZone[];
  visaFreeOnly: boolean;
}

interface SpinnerFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const CONTINENT_LABELS: Record<Continent, string> = {
  Africa: "🌍 Africa",
  Asia: "🌏 Asia",
  Europe: "🌍 Europe",
  "North America": "🌎 N. America",
  "South America": "🌎 S. America",
  Oceania: "🌊 Oceania",
  Antarctica: "🧊 Antarctica",
};

const CLIMATE_LABELS: Record<ClimateZone, string> = {
  tropical: "🌴 Tropical",
  arid: "🏜️ Arid",
  temperate: "🌤️ Temperate",
  continental: "❄️ Continental",
  polar: "🧊 Polar",
  mediterranean: "🫒 Mediterranean",
};

export default function SpinnerFilters({ filters, onChange }: SpinnerFiltersProps) {
  function toggleContinent(c: Continent) {
    const next = filters.continents.includes(c)
      ? filters.continents.filter((x) => x !== c)
      : [...filters.continents, c];
    onChange({ ...filters, continents: next });
  }

  function toggleClimate(z: ClimateZone) {
    const next = filters.climates.includes(z)
      ? filters.climates.filter((x) => x !== z)
      : [...filters.climates, z];
    onChange({ ...filters, climates: next });
  }

  function toggleVisaFree() {
    onChange({ ...filters, visaFreeOnly: !filters.visaFreeOnly });
  }

  function clearAll() {
    onChange({ continents: [], climates: [], visaFreeOnly: false });
  }

  const hasFilters =
    filters.continents.length > 0 ||
    filters.climates.length > 0 ||
    filters.visaFreeOnly;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm uppercase tracking-widest">
          Filters
        </h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-white/60 hover:text-white text-xs underline transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Continent filter */}
      <div>
        <p className="text-white/70 text-xs mb-2 font-medium">Continent</p>
        <div className="flex flex-wrap gap-2">
          {ALL_CONTINENTS.map((c) => {
            const active = filters.continents.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleContinent(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  active
                    ? "bg-white text-indigo-700 shadow-md"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {CONTINENT_LABELS[c]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Climate filter */}
      <div>
        <p className="text-white/70 text-xs mb-2 font-medium">Climate</p>
        <div className="flex flex-wrap gap-2">
          {ALL_CLIMATE_ZONES.map((z) => {
            const active = filters.climates.includes(z);
            return (
              <button
                key={z}
                onClick={() => toggleClimate(z)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  active
                    ? "bg-white text-indigo-700 shadow-md"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {CLIMATE_LABELS[z]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visa-free toggle */}
      <div className="flex items-center gap-3">
        <button
          role="switch"
          aria-checked={filters.visaFreeOnly}
          onClick={toggleVisaFree}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            filters.visaFreeOnly ? "bg-white" : "bg-white/25"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-indigo-600 transition-transform ${
              filters.visaFreeOnly ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-white text-sm">Visa-free for US passport</span>
      </div>
    </div>
  );
}
