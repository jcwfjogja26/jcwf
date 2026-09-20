import { NextResponse } from "next/server";
import { deleteParticipantSession } from "@/lib/participant-session";

export async function POST() {
  try {
    await deleteParticipantSession();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal logout.",
      },
      { status: 500 }
    );
  }
}