// [CYCL:41e8dbe1] POST /api/trips/[id]/packing-list/items — adds a single custom item to an existing packing list
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: tripId } = await params;

  try {
    const body = await request.json();
    const { list_id, category, name, is_custom } = body;

    if (!list_id || !category || !name) {
      return NextResponse.json(
        { error: "list_id, category, and name are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Verify the list belongs to this trip
    const { data: list, error: listError } = await supabase
      .from("packing_lists")
      .select("id")
      .eq("id", list_id)
      .eq("trip_id", tripId)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: "Packing list not found for this trip" },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("packing_items")
      .insert({
        list_id,
        category: category.trim(),
        name: name.trim(),
        checked: false,
        is_custom: is_custom ?? true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/trips/[id]/packing-list/items:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
