"use client";

// [CYCL:fe9bf0bb] Main bucket list feature container — map, stats, list view, and Spin from Wishlist
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  fetchDestinations,
  addDestination,
  updateDestination,
  removeDestination,
} from "@/lib/destinations";
import type { UserDestination, DestinationStatus } from "@/lib/destinations";
import { allCountries } from "@/lib/countries";
import CountryPopover from "./CountryPopover";
import BucketListStats from "./BucketListStats";

// Dynamically import WorldMap to avoid SSR issues with react-simple-maps
const WorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-xl bg-gray-800 animate-pulse flex items-center justify-center">
      <span className="text-gray-500 text-sm">Loading map…</span>
    </div>
  ),
});

interface PopoverState {
  code: string;
  name: string;
}

export default function BucketListView() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<UserDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [popover, setPopover] = useState<PopoverState | null>(null);

  useEffect(() => {
    fetchDestinations()
      .then(setDestinations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Map of alpha-2 code → status for quick lookup
  const statusMap = useMemo<Record<string, DestinationStatus>>(
    () =>
      Object.fromEntries(destinations.map((d) => [d.country_code, d.status])),
    [destinations]
  );

  const visitedCount = useMemo(
    () => destinations.filter((d) => d.status === "visited").length,
    [destinations]
  );

  const wishlistCount = useMemo(
    () => destinations.filter((d) => d.status === "wishlist").length,
    [destinations]
  );

  const handleCountryClick = useCallback((code: string, name: string) => {
    setPopover({ code, name });
  }, []);

  const handleAdd = useCallback(
    async (status: DestinationStatus) => {
      if (!popover) return;
      const { code } = popover;
      const current = statusMap[code];

      // Optimistic update
      setDestinations((prev) => {
        if (current) {
          return prev.map((d) => (d.country_code === code ? { ...d, status } : d));
        }
        return [
          ...prev,
          {
            id: `optimistic-${code}`,
            user_id: "anonymous",
            country_code: code,
            status,
            added_at: new Date().toISOString(),
          },
        ];
      });
      setPopover(null);

      try {
        if (current) {
          const updated = await updateDestination(code, status);
          setDestinations((prev) =>
            prev.map((d) => (d.country_code === code ? updated : d))
          );
        } else {
          const added = await addDestination(code, status);
          setDestinations((prev) =>
            prev.map((d) =>
              d.id === `optimistic-${code}` ? added : d
            )
          );
        }
      } catch (err) {
        console.error("Failed to save destination:", err);
        // Revert optimistic update on failure
        setDestinations((prev) => prev.filter((d) => d.id !== `optimistic-${code}`));
      }
    },
    [popover, statusMap]
  );

  const handleRemove = useCallback(async () => {
    if (!popover) return;
    const { code } = popover;

    // Optimistic update
    setDestinations((prev) => prev.filter((d) => d.country_code !== code));
    setPopover(null);

    try {
      await removeDestination(code);
    } catch (err) {
      console.error("Failed to remove destination:", err);
      // Fetch fresh data on failure
      const fresh = await fetchDestinations();
      setDestinations(fresh);
    }
  }, [popover]);

  const handleSpinFromWishlist = useCallback(() => {
    const wishlistCodes = destinations
      .filter((d) => d.status === "wishlist")
      .map((d) => d.country_code)
      .join(",");
    router.push(`/spinner?pool=wishlist&codes=${encodeURIComponent(wishlistCodes)}`);
  }, [destinations, router]);

  // Saved countries list sorted by added_at desc
  const savedList = useMemo(
    () =>
      [...destinations].sort(
        (a, b) =>
          new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
      ),
    [destinations]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white/60 animate-pulse">Loading your bucket list…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <BucketListStats visitedCount={visitedCount} wishlistCount={wishlistCount} />

      {/* World Map */}
      <WorldMap destinations={statusMap} onCountryClick={handleCountryClick} />

      {/* Spin from Wishlist */}
      {wishlistCount > 0 && (
        <button
          onClick={handleSpinFromWishlist}
          className="w-full py-3 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold rounded-2xl shadow-lg transition-all text-base"
        >
          🎲 Spin from My Wishlist ({wishlistCount}{" "}
          {wishlistCount === 1 ? "country" : "countries"})
        </button>
      )}

      {/* Saved Countries List */}
      <div>
        <h2 className="text-white font-bold text-lg mb-3">
          Saved Countries{" "}
          {savedList.length > 0 && (
            <span className="text-gray-400 font-normal text-sm">
              ({savedList.length})
            </span>
          )}
        </h2>

        {savedList.length === 0 ? (
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">🗺️</div>
            <p className="text-gray-400 text-sm">
              Click any country on the map to add it to your wishlist or mark it
              as visited.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {savedList.map((dest) => {
              const country = allCountries.find(
                (c) => c.code === dest.country_code
              );
              return (
                <li
                  key={dest.id}
                  className="flex items-center justify-between bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{country?.flag ?? "🌍"}</span>
                    <div>
                      <span className="text-white font-medium text-sm">
                        {country?.name ?? dest.country_code}
                      </span>
                      <div
                        className={`text-xs mt-0.5 font-semibold ${
                          dest.status === "visited"
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {dest.status === "visited" ? "✓ Visited" : "★ Wishlist"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dest.status === "wishlist" && (
                      <button
                        onClick={() => handleCountryClick(dest.country_code, country?.name ?? dest.country_code)}
                        className="text-xs px-2.5 py-1 bg-green-800/60 hover:bg-green-700 text-green-300 rounded-lg transition-colors"
                        title="Mark as visited"
                      >
                        Mark Visited
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        setDestinations((prev) =>
                          prev.filter((d) => d.country_code !== dest.country_code)
                        );
                        removeDestination(dest.country_code).catch(async () => {
                          const fresh = await fetchDestinations();
                          setDestinations(fresh);
                        });
                      }}
                      className="text-xs px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                      title="Remove"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Country Popover */}
      {popover && (
        <CountryPopover
          countryCode={popover.code}
          countryName={popover.name}
          currentStatus={statusMap[popover.code]}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
}
