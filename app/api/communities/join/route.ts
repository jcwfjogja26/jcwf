import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/participant-session";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const participant = await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const communityId = body.communityId;

    if (!communityId) {
      return NextResponse.json(
        { error: "Community ID is required" },
        { status: 400 }
      );
    }

    // Pastikan community masih aktif
    const { data: community, error: communityError } =
      await supabaseServer
        .from("communities")
        .select("id, name, status")
        .eq("id", communityId)
        .eq("status", "active")
        .single();

    if (communityError || !community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Cek apakah sudah join
    const { data: existingMember } = await supabaseServer
      .from("community_members")
      .select("id")
      .eq("community_id", communityId)
      .eq("participant_id", participant.id)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json({
        success: true,
        joined: true,
        message: "Already joined this community",
      });
    }

    // Join community
    const { error: insertError } = await supabaseServer
      .from("community_members")
      .insert({
        community_id: communityId,
        participant_id: participant.id,
      });

    if (insertError) {
      console.error("Join community error:", insertError);

      return NextResponse.json(
        { error: "Failed to join community" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      joined: true,
      message: "Successfully joined community",
    });
  } catch (error) {
    console.error("Join community API error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}