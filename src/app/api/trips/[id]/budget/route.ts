// [CYCL:d08c61c8] POST /api/trips/[id]/budget — saves an estimate to the trip_budgets table
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: tripId } = await params;

  try {
    const body = await request.json();
    const { travelers, durationDays, style, lineItems, grandTotal, currency } = body;

    if (!travelers || !durationDays || !style || !lineItems || grandTotal === undefined) {
      return NextResponse.json(
        { error: "travelers, durationDays, style, lineItems, and grandTotal are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Verify trip exists
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("trip_budgets")
      .insert({
        trip_id: tripId,
        travelers,
        duration_days: durationDays,
        style,
        line_items: lineItems,
        grand_total: grandTotal,
        currency: currency ?? "USD",
        saved_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error saving budget:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/trips/[id]/budget:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
