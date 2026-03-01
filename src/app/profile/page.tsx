// [CYCL:fe9bf0bb] Profile page — entry point to user features including the bucket list
import Link from "next/link";

export const metadata = {
  title: "Profile | Travel Planner",
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Back */}
        <Link
          href="/"
          className="text-indigo-400 hover:text-indigo-300 text-sm mb-8 inline-block transition-colors"
        >
          ← Home
        </Link>

        <h1 className="text-3xl font-extrabold text-white mb-2">My Travel Profile</h1>
        <p className="text-gray-400 text-sm mb-8">Manage your personal travel data</p>

        <div className="flex flex-col gap-4">
          <Link
            href="/profile/bucket-list"
            className="group flex items-center gap-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-indigo-500 rounded-2xl p-5 transition-all"
          >
            <span className="text-4xl">⭐</span>
            <div className="flex-1">
              <div className="font-bold text-white text-lg">Bucket List</div>
              <div className="text-gray-400 text-sm">
                Track visited countries and build your wishlist
              </div>
            </div>
            <span className="text-gray-500 group-hover:text-indigo-400 transition-colors text-xl">
              →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
