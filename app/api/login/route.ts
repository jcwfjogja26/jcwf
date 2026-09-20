import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseServer } from "@/lib/supabase-server";
import { createParticipantSession } from "@/lib/participant-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, password } = body;

    // =========================
    // VALIDATION
    // =========================

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // =========================
    // FIND PARTICIPANT
    // =========================

    const {
      data: participant,
      error: participantError,
    } = await supabaseServer
      .from("participants")
      .select(
        `
        id,
        reconnect_id,
        full_name,
        email,
        password_hash
        `
      )
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (participantError) {
      console.error(
        "LOGIN PARTICIPANT ERROR:",
        participantError
      );

      return NextResponse.json(
        {
          message:
            "Terjadi kesalahan saat login.",
        },
        { status: 500 }
      );
    }

    // =========================
    // INVALID LOGIN
    // =========================

    if (!participant) {
      return NextResponse.json(
        {
          message:
            "Email atau password salah.",
        },
        { status: 401 }
      );
    }

    // =========================
    // CHECK PASSWORD
    // =========================

    const passwordValid =
      await bcrypt.compare(
        password,
        participant.password_hash
      );

    if (!passwordValid) {
      return NextResponse.json(
        {
          message:
            "Email atau password salah.",
        },
        { status: 401 }
      );
    }

    // =========================
    // CREATE SESSION
    // =========================

    await createParticipantSession(
      participant.id
    );

    // =========================
    // SUCCESS
    // =========================

    return NextResponse.json(
      {
        success: true,
        participant: {
          id: participant.id,
          reconnectId:
            participant.reconnect_id,
          fullName:
            participant.full_name,
          email: participant.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "LOGIN SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}