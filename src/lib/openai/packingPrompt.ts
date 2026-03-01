// [CYCL:489021c1] Builds the structured OpenAI prompt for packing list generation and validates the response
import { z } from "zod";

export const packingResponseSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string().min(1),
      items: z.array(z.object({ name: z.string().min(1) })).min(1),
    })
  ).min(1),
});

export type PackingResponse = z.infer<typeof packingResponseSchema>;

interface TripContext {
  destination: string;
  startDate?: string | null;
  endDate?: string | null;
  activities?: string[];
}

// Computes trip duration in days from ISO date strings
function tripDuration(startDate?: string | null, endDate?: string | null): number | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

export function buildPackingSystemPrompt(): string {
  return `You are a world-class travel packing advisor. Generate a comprehensive, categorized packing checklist for a trip.

Respond with ONLY valid JSON in this exact format:
{
  "categories": [
    {
      "name": "Category Name",
      "items": [
        { "name": "Item name" }
      ]
    }
  ]
}

Guidelines:
- Include 6-10 categories (e.g., Clothing, Toiletries, Documents, Electronics, Health & Safety, Money & Finance, Entertainment, Miscellaneous)
- Each category should have 4-12 relevant items
- Tailor items to the destination, climate, duration, and activities
- Be specific and practical — include items travelers often forget
- Do not include commentary, markdown, or any text outside the JSON object`;
}

export function buildPackingUserPrompt(trip: TripContext): string {
  const duration = tripDuration(trip.startDate, trip.endDate);
  const activitiesText =
    trip.activities && trip.activities.length > 0
      ? `Planned activities: ${trip.activities.join(", ")}.`
      : "No specific activities planned.";

  const durationText = duration
    ? `Trip duration: ${duration} day${duration !== 1 ? "s" : ""}.`
    : "Trip duration: unknown.";

  const dateText =
    trip.startDate
      ? `Travel dates: ${trip.startDate}${trip.endDate ? ` to ${trip.endDate}` : ""}.`
      : "Travel dates: not specified.";

  return `Generate a packing checklist for a trip to ${trip.destination}.
${dateText}
${durationText}
${activitiesText}

Return only the JSON object.`;
}
