// [CYCL:489021c1] POST /api/trips — creates a new trip record in Supabase
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, name, start_date, end_date, activities } = body;

    if (!destination || !name) {
      return NextResponse.json(
        { error: "destination and name are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("trips")
      .insert({
        destination,
        name,
        start_date: start_date || null,
        end_date: end_date || null,
        activities: activities ?? [],
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating trip:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/trips:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
