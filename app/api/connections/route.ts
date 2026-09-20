import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getCurrentParticipant } from "@/lib/participant-session";

export async function GET() {
  try {
    const participant = await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: connections, error } = await supabaseServer
      .from("participant_connections")
      .select(`
        id,
        created_at,
        connected_participant:participants!participant_connections_connected_participant_id_fkey (
          id,
          reconnect_id,
          full_name,
          city,
          interest_category
        )
      `)
      .eq("participant_id", participant.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Connections fetch error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load connections.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      connections: connections ?? [],
    });
  } catch (error) {
    console.error("Connections GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const participant = await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const connectedParticipantId = body?.participantId;

    if (!connectedParticipantId) {
      return NextResponse.json(
        {
          success: false,
          error: "Participant ID is required.",
        },
        { status: 400 }
      );
    }

    if (connectedParticipantId === participant.id) {
      return NextResponse.json(
        {
          success: false,
          error: "You cannot connect with yourself.",
        },
        { status: 400 }
      );
    }

    const { data: target, error: targetError } = await supabaseServer
      .from("participants")
      .select("id")
      .eq("id", connectedParticipantId)
      .maybeSingle();

    if (targetError) {
      console.error("Target participant error:", targetError);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to find participant.",
        },
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

    const { data: existing } = await supabaseServer
      .from("participant_connections")
      .select("id")
      .eq("participant_id", participant.id)
      .eq("connected_participant_id", connectedParticipantId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyConnected: true,
        message: "Already connected.",
      });
    }

    const { data: connection, error } = await supabaseServer
      .from("participant_connections")
      .insert({
        participant_id: participant.id,
        connected_participant_id: connectedParticipantId,
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("Create connection error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create connection.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      connection,
      message: "Connection created successfully.",
    });
  } catch (error) {
    console.error("Connections POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}