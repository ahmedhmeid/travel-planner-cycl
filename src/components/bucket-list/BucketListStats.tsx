"use client";

// [CYCL:fe9bf0bb] Stats panel — visited count, wishlist count, % of world explored
const TOTAL_COUNTRIES = 195;

interface BucketListStatsProps {
  visitedCount: number;
  wishlistCount: number;
}

export default function BucketListStats({ visitedCount, wishlistCount }: BucketListStatsProps) {
  const percentage = Math.round((visitedCount / TOTAL_COUNTRIES) * 100);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-green-900/40 border border-green-700/50 rounded-xl p-4 text-center">
        <div className="text-3xl font-extrabold text-green-400">{visitedCount}</div>
        <div className="text-green-300/80 text-xs mt-1 font-medium">Visited</div>
      </div>
      <div className="bg-yellow-900/40 border border-yellow-700/50 rounded-xl p-4 text-center">
        <div className="text-3xl font-extrabold text-yellow-400">{wishlistCount}</div>
        <div className="text-yellow-300/80 text-xs mt-1 font-medium">Wishlist</div>
      </div>
      <div className="bg-indigo-900/40 border border-indigo-700/50 rounded-xl p-4 text-center">
        <div className="text-3xl font-extrabold text-indigo-400">{percentage}%</div>
        <div className="text-indigo-300/80 text-xs mt-1 font-medium">Explored</div>
      </div>
    </div>
  );
}
