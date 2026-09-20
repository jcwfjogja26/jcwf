import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseServer } from "@/lib/supabase-server";
import { createParticipantSession } from "@/lib/participant-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      fullName,
      whatsapp,
      email,
      city,
      interest,
      password,
      privacyConsent,
    } = body;

    // =========================
    // VALIDATION
    // =========================

    if (
      !fullName ||
      !whatsapp ||
      !email ||
      !city ||
      !interest ||
      !password
    ) {
      return NextResponse.json(
        {
          message: "Semua field wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!privacyConsent) {
      return NextResponse.json(
        {
          message:
            "Silakan setujui penggunaan data terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          message: "Password minimal 6 karakter.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // =========================
    // CHECK EXISTING EMAIL
    // =========================

    const {
      data: existingParticipant,
      error: existingError,
    } = await supabaseServer
      .from("participants")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingError) {
      console.error(
        "CHECK PARTICIPANT ERROR:",
        existingError
      );

      return NextResponse.json(
        {
          message:
            "Gagal mengecek data peserta.",
        },
        { status: 500 }
      );
    }

    if (existingParticipant) {
      return NextResponse.json(
        {
          message:
            "Email ini sudah terdaftar. Silakan login.",
        },
        { status: 409 }
      );
    }

    // =========================
    // HASH PASSWORD
    // =========================

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    // =========================
    // CREATE PARTICIPANT
    // =========================

    const {
      data: participant,
      error: insertError,
    } = await supabaseServer
      .from("participants")
      .insert({
        full_name: fullName.trim(),
        whatsapp: whatsapp.trim(),
        email: normalizedEmail,
        city: city.trim(),
        interest_category: interest,
        password_hash: passwordHash,
        privacy_consent: true,
        privacy_consent_at:
          new Date().toISOString(),
      })
      .select(
        "id, reconnect_id, full_name, email"
      )
      .single();

    if (insertError) {
      console.error(
        "CREATE PARTICIPANT ERROR:",
        insertError
      );

      return NextResponse.json(
        {
          message:
            "Gagal membuat akun. Silakan coba lagi.",
        },
        { status: 500 }
      );
    }

    // =========================
    // CREATE PARTICIPANT SESSION
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
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "REGISTER SERVER ERROR:",
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