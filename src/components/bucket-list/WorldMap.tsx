"use client";

// [CYCL:fe9bf0bb] SVG world map using react-simple-maps — colors countries by bucket list status
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { alpha2ToNumeric } from "@/lib/destinations";
import type { DestinationStatus } from "@/lib/destinations";

const GEO_URL = "/countries-110m.json";

// Build a reverse lookup: numeric code → alpha-2 code (module-level, runs once)
const numericToAlpha2: Record<number, string> = Object.fromEntries(
  Object.entries(alpha2ToNumeric).map(([a2, num]) => [num, a2])
);

interface WorldMapProps {
  destinations: Record<string, DestinationStatus>; // alpha-2 code → status
  onCountryClick: (countryCode: string, countryName: string) => void;
}

function getCountryFill(status: DestinationStatus | undefined): string {
  if (status === "visited") return "#22c55e";  // green-500
  if (status === "wishlist") return "#eab308"; // yellow-500
  return "#374151";                            // gray-700 — unmarked
}

function getCountryHover(status: DestinationStatus | undefined): string {
  if (status === "visited") return "#16a34a";  // green-600
  if (status === "wishlist") return "#ca8a04"; // yellow-600
  return "#4b5563";                            // gray-600
}

export default function WorldMap({ destinations, onCountryClick }: WorldMapProps) {
  return (
    <div className="w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-700">
      <ComposableMap
        projectionConfig={{ scale: 147, center: [0, 10] }}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const numericId =
                typeof geo.id === "string" ? parseInt(geo.id, 10) : (geo.id as number);
              const alpha2 = numericToAlpha2[numericId];
              const status = alpha2 ? destinations[alpha2] : undefined;
              const fill = getCountryFill(status);
              const hoverFill = getCountryHover(status);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => {
                    if (alpha2) {
                      onCountryClick(alpha2, (geo.properties as Record<string, string>)?.name ?? alpha2);
                    }
                  }}
                  style={{
                    default: {
                      fill,
                      stroke: "#111827",
                      strokeWidth: 0.5,
                      outline: "none",
                      cursor: alpha2 ? "pointer" : "default",
                    },
                    hover: {
                      fill: hoverFill,
                      stroke: "#111827",
                      strokeWidth: 0.5,
                      outline: "none",
                      cursor: alpha2 ? "pointer" : "default",
                    },
                    pressed: {
                      fill: hoverFill,
                      stroke: "#111827",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-800/50 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
          Visited
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block" />
          Wishlist
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-700 inline-block" />
          Unexplored
        </span>
      </div>
    </div>
  );
}
