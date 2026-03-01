// [CYCL:26141bd3] PATCH + DELETE handlers for /api/user/destinations/[code]
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const DEFAULT_USER_ID = "anonymous";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["wishlist", "visited"].includes(status)) {
      return NextResponse.json(
        { error: "status must be 'wishlist' or 'visited'" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("user_destinations")
      .update({ status })
      .eq("user_id", DEFAULT_USER_ID)
      .eq("country_code", code.toUpperCase())
      .select()
      .single();

    if (error) {
      console.error("Supabase error updating destination:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in PATCH /api/user/destinations/[code]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("user_destinations")
      .delete()
      .eq("user_id", DEFAULT_USER_ID)
      .eq("country_code", code.toUpperCase());

    if (error) {
      console.error("Supabase error removing destination:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Error in DELETE /api/user/destinations/[code]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
