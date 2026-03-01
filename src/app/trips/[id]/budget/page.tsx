// [CYCL:d8abe72a] Trip-scoped budget page — pre-populates estimator with trip destination and date range
import { notFound } from "next/navigation";
import Link from "next/link";
import BudgetEstimator from "@/components/budget-estimator/BudgetEstimator";
import { getSupabaseAdmin } from "@/lib/supabase";

interface BudgetPageProps {
  params: Promise<{ id: string }>;
}

function calcDuration(startDate: string | null, endDate: string | null): number {
  if (!startDate || !endDate) return 7;
  const diff = Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff > 0 ? diff : 7;
}

export async function generateMetadata({ params }: BudgetPageProps) {
  const { id } = await params;
  try {
    const supabase = getSupabaseAdmin();
    const { data: trip } = await supabase
      .from("trips")
      .select("name")
      .eq("id", id)
      .single();
    return { title: trip ? `Budget for ${trip.name}` : "Budget Estimator" };
  } catch {
    return { title: "Budget Estimator" };
  }
}

export default async function BudgetPage({ params }: BudgetPageProps) {
  const { id } = await params;

  let trip: { id: string; name: string; destination: string; start_date: string | null; end_date: string | null } | null = null;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("trips")
      .select("id, name, destination, start_date, end_date")
      .eq("id", id)
      .single();

    if (error || !data) notFound();
    trip = data;
  } catch {
    notFound();
  }

  const duration = calcDuration(trip.start_date, trip.end_date);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Header */}
      <header className="px-4 pt-8 pb-4 max-w-2xl mx-auto">
        <div className="flex gap-3 mb-4 text-sm">
          <Link
            href="/spinner"
            className="text-white/70 hover:text-white flex items-center gap-1 transition-colors"
          >
            ← Spinner
          </Link>
          <span className="text-white/40">/</span>
          <Link
            href={`/trips/${id}/packing`}
            className="text-white/70 hover:text-white flex items-center gap-1 transition-colors"
          >
            Packing List
          </Link>
        </div>
        <h1 className="text-3xl font-extrabold text-white drop-shadow">
          💰 Budget for {trip.name}
        </h1>
        <p className="text-white/80 mt-1 text-sm">
          AI-powered cost estimate for your trip
        </p>
      </header>

      {/* Estimator */}
      <section className="max-w-2xl mx-auto px-4 pb-12">
        <BudgetEstimator
          destination={trip.destination}
          tripId={trip.id}
          initialDuration={duration}
        />
      </section>
    </main>
  );
}
