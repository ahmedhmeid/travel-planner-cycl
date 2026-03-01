// [CYCL:0351b220] Stub page for the Create New Trip flow — receives destination via query params from the spinner
import Link from "next/link";

interface NewTripPageProps {
  searchParams: Promise<{ destination?: string; name?: string }>;
}

export default async function NewTripPage({ searchParams }: NewTripPageProps) {
  const { destination, name } = await searchParams;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-white rounded-3xl p-10 shadow-2xl max-w-md w-full">
        <div className="text-5xl mb-4">🧳</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {name ? `Trip to ${name}` : "New Trip"}
        </h1>
        {destination && (
          <p className="text-indigo-600 font-medium mb-4">
            Destination code: {destination}
          </p>
        )}
        <p className="text-gray-500 mb-8">
          Trip planning features are coming in future cycles. Stay tuned!
        </p>
        <Link
          href="/spinner"
          className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          ← Back to Spinner
        </Link>
      </div>
    </main>
  );
}
