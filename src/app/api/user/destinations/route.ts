// [CYCL:26141bd3] GET + POST handlers for /api/user/destinations — bucket list entries
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const DEFAULT_USER_ID = "anonymous";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("user_destinations")
      .select("*")
      .eq("user_id", DEFAULT_USER_ID)
      .order("added_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching destinations:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("Error in GET /api/user/destinations:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country_code, status } = body;

    if (!country_code || !status) {
      return NextResponse.json(
        { error: "country_code and status are required" },
        { status: 400 }
      );
    }

    if (!["wishlist", "visited"].includes(status)) {
      return NextResponse.json(
        { error: "status must be 'wishlist' or 'visited'" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("user_destinations")
      .upsert(
        { user_id: DEFAULT_USER_ID, country_code: country_code.toUpperCase(), status },
        { onConflict: "user_id,country_code" }
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding destination:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/user/destinations:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
