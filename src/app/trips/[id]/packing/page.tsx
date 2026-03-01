// [CYCL:41e8dbe1] Packing list page — fetches trip metadata server-side and renders the PackingList component
import { notFound } from "next/navigation";
import Link from "next/link";
import PackingList from "@/components/packing/PackingList";
import { getSupabaseAdmin } from "@/lib/supabase";

interface PackingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PackingPageProps) {
  const { id } = await params;
  try {
    const supabase = getSupabaseAdmin();
    const { data: trip } = await supabase
      .from("trips")
      .select("name")
      .eq("id", id)
      .single();
    return { title: trip ? `Pack for ${trip.name}` : "Packing List" };
  } catch {
    return { title: "Packing List" };
  }
}

export default async function PackingPage({ params }: PackingPageProps) {
  const { id } = await params;

  let trip: { id: string; name: string; destination: string } | null = null;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("trips")
      .select("id, name, destination")
      .eq("id", id)
      .single();

    if (error || !data) {
      notFound();
    }
    trip = data;
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Header */}
      <header className="px-4 pt-8 pb-4 max-w-2xl mx-auto">
        <Link
          href="/spinner"
          className="text-white/70 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors"
        >
          ← Back to Spinner
        </Link>
        <h1 className="text-3xl font-extrabold text-white drop-shadow">
          🎒 Pack for {trip.name}
        </h1>
        <p className="text-white/80 mt-1 text-sm">
          AI-generated packing checklist for your trip
        </p>
      </header>

      {/* Packing list */}
      <section className="max-w-2xl mx-auto px-4 pb-12">
        <PackingList tripId={id} tripName={trip.name} />
      </section>
    </main>
  );
}
