// [CYCL:fe9bf0bb] Bucket list page — hosts the BucketListView component
import Link from "next/link";
import BucketListView from "@/components/bucket-list/BucketListView";

export const metadata = {
  title: "Bucket List | Travel Planner",
};

export default function BucketListPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900">
      {/* Header */}
      <header className="max-w-3xl mx-auto px-4 pt-10 pb-4">
        <Link
          href="/profile"
          className="text-indigo-400 hover:text-indigo-300 text-sm mb-4 inline-block transition-colors"
        >
          ← Back to Profile
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-4xl">⭐</span>
          <div>
            <h1 className="text-3xl font-extrabold text-white">My Bucket List</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Track countries you&apos;ve visited and places you dream of going
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <BucketListView />
      </div>
    </main>
  );
}
