import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/participant-session";

export async function GET() {
  try {
    const participant =
      await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json({
        authenticated: false,
      });
    }

    return NextResponse.json({
      authenticated: true,
      participant: {
        id: participant.id,
        fullName: participant.full_name,
        reconnectId: participant.reconnect_id,
        email: participant.email,
      },
    });
  } catch (error) {
    console.error(
      "GET CURRENT PARTICIPANT ERROR:",
      error
    );

    return NextResponse.json({
      authenticated: false,
    });
  }
}