// [CYCL:d08c61c8] Budget estimator helpers: prompt construction, response parsing, and Supabase cache read/write
import { z } from "zod";
import { getAnthropicClient } from "@/lib/openai/client";
import { getSupabaseAdmin } from "@/lib/supabase";

// ─── Zod schema for AI response ──────────────────────────────────────────────

export const budgetLineItemSchema = z.object({
  label: z.string().min(1),
  perPerson: z.number().nonnegative(),
});

export const budgetResponseSchema = z.object({
  lineItems: z.array(budgetLineItemSchema).min(1),
  grandTotalPerPerson: z.number().nonnegative(),
  currency: z.literal("USD"),
});

export type BudgetLineItem = z.infer<typeof budgetLineItemSchema>;
export type BudgetResponse = z.infer<typeof budgetResponseSchema>;

// ─── Prompt builders ─────────────────────────────────────────────────────────

export function buildBudgetSystemPrompt(): string {
  return `You are a travel cost expert. Estimate realistic trip costs for the given destination.

Respond with ONLY valid JSON in this exact format:
{
  "lineItems": [
    { "label": "Flights (round-trip)", "perPerson": 650 },
    { "label": "Accommodation", "perPerson": 420 },
    { "label": "Food & Dining", "perPerson": 210 },
    { "label": "Local Transport", "perPerson": 80 },
    { "label": "Activities & Tours", "perPerson": 150 },
    { "label": "Miscellaneous", "perPerson": 60 }
  ],
  "grandTotalPerPerson": 1570,
  "currency": "USD"
}

Rules:
- Always include exactly these 6 categories (Flights, Accommodation, Food & Dining, Local Transport, Activities & Tours, Miscellaneous)
- perPerson values are in USD and cover the FULL trip duration
- grandTotalPerPerson MUST equal the sum of all perPerson values
- Scale costs to the travel style (budget = hostels/economy, mid-range = 3-star/regular, luxury = 5-star/business class)
- Use realistic, current market estimates — not extremes
- Return ONLY the JSON object — no markdown, no commentary`;
}

export function buildBudgetUserPrompt(
  destination: string,
  style: string,
  durationDays: number
): string {
  return `Estimate trip costs for the following:
- Destination: ${destination}
- Trip duration: ${durationDays} day${durationDays !== 1 ? "s" : ""}
- Travel style: ${style}

Return the JSON cost breakdown per person for the entire trip.`;
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

const CACHE_TTL_HOURS = 24;

export async function getCachedEstimate(
  destination: string,
  style: string,
  durationDays: number
): Promise<BudgetResponse | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("budget_estimates")
      .select("line_items, grand_total_per_person, currency, created_at")
      .eq("destination", destination)
      .eq("style", style)
      .eq("duration_days", durationDays)
      .single();

    if (error || !data) return null;

    // Check 24h TTL
    const cachedAt = new Date(data.created_at as string);
    const ageHours = (Date.now() - cachedAt.getTime()) / (1000 * 60 * 60);
    if (ageHours > CACHE_TTL_HOURS) return null;

    const lineItems = data.line_items as BudgetLineItem[];
    return {
      lineItems,
      grandTotalPerPerson: data.grand_total_per_person as number,
      currency: "USD",
    };
  } catch {
    return null;
  }
}

export async function cacheEstimate(
  destination: string,
  style: string,
  durationDays: number,
  result: BudgetResponse
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("budget_estimates").upsert(
      {
        destination,
        style,
        duration_days: durationDays,
        line_items: result.lineItems,
        grand_total_per_person: result.grandTotalPerPerson,
        currency: result.currency,
        created_at: new Date().toISOString(),
      },
      { onConflict: "destination,style,duration_days" }
    );
  } catch (err) {
    console.error("Failed to cache budget estimate:", err);
    // Non-fatal — proceed without caching
  }
}

// ─── AI generation ────────────────────────────────────────────────────────────

export async function generateBudgetEstimate(
  destination: string,
  style: string,
  durationDays: number
): Promise<BudgetResponse> {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    system: buildBudgetSystemPrompt(),
    messages: [
      {
        role: "user",
        content: buildBudgetUserPrompt(destination, style, durationDays),
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  const rawJson = textBlock?.type === "text" ? textBlock.text : null;

  if (!rawJson) {
    throw new Error("Claude returned an empty response");
  }

  // Strip markdown code fences if present
  const cleaned = rawJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  const parsed = budgetResponseSchema.parse(JSON.parse(cleaned));
  return parsed;
}
