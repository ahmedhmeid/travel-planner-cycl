// [CYCL:489021c1] PATCH + DELETE /api/trips/[id]/packing-list/[itemId]
// PATCH: updates a single item's checked state or name
// DELETE: removes a single item from the packing list
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

type RouteParams = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { itemId } = await params;

  try {
    const body = await request.json();
    const updates: { checked?: boolean; name?: string } = {};

    if (typeof body.checked === "boolean") updates.checked = body.checked;
    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("packing_items")
      .update(updates)
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in PATCH /api/trips/[id]/packing-list/[itemId]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { itemId } = await params;

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("packing_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /api/trips/[id]/packing-list/[itemId]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
