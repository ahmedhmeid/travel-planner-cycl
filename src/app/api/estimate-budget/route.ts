// [CYCL:d08c61c8] POST /api/estimate-budget — validates request, checks Supabase cache, falls back to Claude AI, returns structured line items
import { NextRequest, NextResponse } from "next/server";
import {
  getCachedEstimate,
  cacheEstimate,
  generateBudgetEstimate,
} from "@/lib/budget-estimator";

const VALID_STYLES = ["budget", "mid-range", "luxury"] as const;
type TravelStyle = (typeof VALID_STYLES)[number];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, travelers, duration, style } = body;

    // Validate required fields
    if (!destination || typeof destination !== "string") {
      return NextResponse.json(
        { error: "destination is required and must be a string" },
        { status: 400 }
      );
    }
    if (!travelers || typeof travelers !== "number" || travelers < 1) {
      return NextResponse.json(
        { error: "travelers must be a positive number" },
        { status: 400 }
      );
    }
    if (!duration || typeof duration !== "number" || duration < 1) {
      return NextResponse.json(
        { error: "duration must be a positive number (days)" },
        { status: 400 }
      );
    }
    if (!style || !VALID_STYLES.includes(style as TravelStyle)) {
      return NextResponse.json(
        { error: "style must be one of: budget, mid-range, luxury" },
        { status: 400 }
      );
    }

    const durationDays = Math.round(duration);
    const travelerCount = Math.round(travelers);

    // Check cache first (keyed on destination + style + duration, not travelers)
    const cached = await getCachedEstimate(destination, style, durationDays);
    const perPersonData = cached ?? await (async () => {
      // Generate via Claude and cache the result
      const generated = await generateBudgetEstimate(destination, style, durationDays);
      await cacheEstimate(destination, style, durationDays, generated);
      return generated;
    })();

    // Compute per-traveler totals client-side of the API (multiply by travelers)
    const lineItems = perPersonData.lineItems.map((item) => ({
      label: item.label,
      perPerson: item.perPerson,
      total: Math.round(item.perPerson * travelerCount),
    }));

    const grandTotal = Math.round(perPersonData.grandTotalPerPerson * travelerCount);

    return NextResponse.json({
      lineItems,
      grandTotal,
      grandTotalPerPerson: perPersonData.grandTotalPerPerson,
      currency: perPersonData.currency,
      travelers: travelerCount,
      fromCache: cached !== null,
    });
  } catch (err) {
    console.error("Error in POST /api/estimate-budget:", err);

    // Don't expose raw AI errors to the client
    const message =
      err instanceof Error && err.message.includes("Zod")
        ? "AI returned an unexpected response format. Please try again."
        : "Failed to generate budget estimate. Please try again.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
