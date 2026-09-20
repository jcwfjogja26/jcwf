import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getCurrentParticipant } from "@/lib/participant-session";

export async function GET(request: Request) {
  try {
    const participant = await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reconnectId = searchParams.get("reconnectId")?.trim();

    if (!reconnectId) {
      return NextResponse.json(
        { success: false, error: "Reconnect ID is required." },
        { status: 400 }
      );
    }

    const { data: target, error } = await supabaseServer
      .from("participants")
      .select(`
        id,
        reconnect_id,
        full_name,
        city,
        interest_category
      `)
      .eq("reconnect_id", reconnectId)
      .maybeSingle();

    if (error) {
      console.error("Connection search error:", error);

      return NextResponse.json(
        { success: false, error: "Failed to find participant." },
        { status: 500 }
      );
    }

    if (!target) {
      return NextResponse.json(
        {
          success: false,
          error: "Participant not found.",
        },
        { status: 404 }
      );
    }

    if (target.id === participant.id) {
      return NextResponse.json(
        {
          success: false,
          error: "You cannot connect with yourself.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      participant: {
        id: target.id,
        reconnectId: target.reconnect_id,
        fullName: target.full_name,
        city: target.city,
        interestCategory: target.interest_category,
      },
    });
  } catch (error) {
    console.error("Connection search unexpected error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}