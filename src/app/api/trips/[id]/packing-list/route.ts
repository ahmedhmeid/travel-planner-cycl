// [CYCL:489021c1] GET + POST /api/trips/[id]/packing-list
// GET: returns the full packing list with items grouped by category
// POST: calls Anthropic Claude to generate a new list, stores in DB, and returns it
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAnthropicClient } from "@/lib/openai/client";
import {
  buildPackingSystemPrompt,
  buildPackingUserPrompt,
  packingResponseSchema,
} from "@/lib/openai/packingPrompt";
import type { PackingCategory, PackingItem, PackingListWithItems } from "@/types/packing";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id: tripId } = await params;

  try {
    const supabase = getSupabaseAdmin();

    // Fetch the packing list for this trip
    const { data: list, error: listError } = await supabase
      .from("packing_lists")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (listError) {
      if (listError.code === "PGRST116") {
        // No list found
        return NextResponse.json(null, { status: 200 });
      }
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    // Fetch all items for this list
    const { data: items, error: itemsError } = await supabase
      .from("packing_items")
      .select("*")
      .eq("list_id", list.id)
      .order("category")
      .order("name");

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Group items by category
    const categoryMap = new Map<string, PackingItem[]>();
    for (const item of (items ?? [])) {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, []);
      }
      categoryMap.get(item.category)!.push(item as PackingItem);
    }

    const categories: PackingCategory[] = Array.from(categoryMap.entries()).map(
      ([name, catItems]) => ({ name, items: catItems })
    );

    const result: PackingListWithItems = { ...list, categories };
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error in GET /api/trips/[id]/packing-list:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: tripId } = await params;

  try {
    const supabase = getSupabaseAdmin();

    // Fetch trip metadata for the prompt
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Check for custom items to preserve during regeneration
    const { data: existingList } = await supabase
      .from("packing_lists")
      .select("id")
      .eq("trip_id", tripId)
      .limit(1)
      .single();

    let customItems: { category: string; name: string }[] = [];
    if (existingList) {
      const { data: customs } = await supabase
        .from("packing_items")
        .select("category, name")
        .eq("list_id", existingList.id)
        .eq("is_custom", true);
      customItems = customs ?? [];

      // Delete old packing list (cascades to items)
      await supabase.from("packing_lists").delete().eq("id", existingList.id);
    }

    // Call Anthropic Claude to generate packing list
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: buildPackingSystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildPackingUserPrompt({
            destination: trip.name,
            startDate: trip.start_date,
            endDate: trip.end_date,
            activities: trip.activities,
          }),
        },
      ],
    });

    // Extract text content from the response
    const textBlock = message.content.find((block) => block.type === "text");
    const rawJson = textBlock?.type === "text" ? textBlock.text : null;

    if (!rawJson) {
      return NextResponse.json(
        { error: "Claude returned an empty response" },
        { status: 502 }
      );
    }

    // Parse and validate with Zod
    let parsed;
    try {
      parsed = packingResponseSchema.parse(JSON.parse(rawJson));
    } catch {
      console.error("Claude response failed Zod validation:", rawJson);
      return NextResponse.json(
        { error: "Claude response did not match expected schema" },
        { status: 502 }
      );
    }

    // Create new packing list
    const { data: newList, error: listInsertError } = await supabase
      .from("packing_lists")
      .insert({ trip_id: tripId })
      .select()
      .single();

    if (listInsertError || !newList) {
      return NextResponse.json(
        { error: "Failed to create packing list" },
        { status: 500 }
      );
    }

    // Build items array from Claude response + preserved custom items
    const itemsToInsert: {
      list_id: string;
      category: string;
      name: string;
      checked: boolean;
      is_custom: boolean;
    }[] = [];

    for (const category of parsed.categories) {
      for (const item of category.items) {
        itemsToInsert.push({
          list_id: newList.id,
          category: category.name,
          name: item.name,
          checked: false,
          is_custom: false,
        });
      }
    }

    // Re-add preserved custom items
    for (const custom of customItems) {
      itemsToInsert.push({
        list_id: newList.id,
        category: custom.category,
        name: custom.name,
        checked: false,
        is_custom: true,
      });
    }

    const { data: insertedItems, error: itemsInsertError } = await supabase
      .from("packing_items")
      .insert(itemsToInsert)
      .select();

    if (itemsInsertError) {
      return NextResponse.json(
        { error: "Failed to insert packing items" },
        { status: 500 }
      );
    }

    // Group items by category for the response
    const categoryMap = new Map<string, PackingItem[]>();
    for (const item of (insertedItems ?? [])) {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, []);
      }
      categoryMap.get(item.category)!.push(item as PackingItem);
    }

    const categories: PackingCategory[] = Array.from(categoryMap.entries()).map(
      ([name, catItems]) => ({ name, items: catItems })
    );

    const result: PackingListWithItems = { ...newList, categories };
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/trips/[id]/packing-list:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
