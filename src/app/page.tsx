import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-center">
      <div className="text-6xl mb-6">✈️</div>
      <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-4">
        Travel Planner
      </h1>
      <p className="text-white/80 text-xl mb-10 max-w-lg">
        Fly to a random country without worries — discover your next adventure.
      </p>
      <Link
        href="/spinner"
        className="px-10 py-4 bg-white text-indigo-700 font-bold text-lg rounded-2xl shadow-xl hover:bg-indigo-50 transition-colors"
      >
        🎲 Spin the Globe
      </Link>
    </main>
  );
}
