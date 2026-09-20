import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const EVENT_START = new Date("2026-11-06T00:00:00+07:00");
const EVENT_END = new Date("2026-11-08T23:59:59+07:00");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reconnectId = body.reconnectId?.trim();

    if (!reconnectId) {
      return NextResponse.json(
        {
          success: false,
          message: "QR tidak valid.",
        },
        { status: 400 }
      );
    }

    // =========================
    // CHECK EVENT DATE
    // =========================

    const now = new Date();

    if (now < EVENT_START || now > EVENT_END) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Check-in belum dibuka atau acara sudah selesai.",
        },
        { status: 400 }
      );
    }

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
        city,
        interest_category
        `
      )
      .eq("reconnect_id", reconnectId)
      .maybeSingle();

    if (participantError) {
      console.error(
        "CHECKIN PARTICIPANT ERROR:",
        participantError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Gagal mencari data peserta.",
        },
        { status: 500 }
      );
    }

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Peserta dengan Reconnect ID tersebut tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // =========================
    // CURRENT DATE — WIB
    // =========================

    const today = new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).format(now);

    // =========================
    // CHECK DUPLICATE
    // =========================

    const {
      data: existingCheckIn,
      error: existingError,
    } = await supabaseServer
      .from("check_ins")
      .select(
        "id, check_in_date, checked_in_at"
      )
      .eq("participant_id", participant.id)
      .eq("check_in_date", today)
      .maybeSingle();

    if (existingError) {
      console.error(
        "CHECK EXISTING CHECKIN ERROR:",
        existingError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Gagal mengecek status check-in.",
        },
        { status: 500 }
      );
    }

    if (existingCheckIn) {
      return NextResponse.json(
        {
          success: false,
          alreadyCheckedIn: true,
          message:
            "Peserta sudah melakukan check-in hari ini.",
          participant: {
            id: participant.id,
            reconnectId:
              participant.reconnect_id,
            fullName:
              participant.full_name,
            email: participant.email,
            city: participant.city,
            interest:
              participant.interest_category,
          },
          checkIn: {
            date: existingCheckIn.check_in_date,
            checkedInAt:
              existingCheckIn.checked_in_at,
          },
        },
        { status: 409 }
      );
    }

    // =========================
    // CREATE CHECK-IN
    // =========================

    const {
      data: checkIn,
      error: checkInError,
    } = await supabaseServer
      .from("check_ins")
      .insert({
        participant_id: participant.id,
        check_in_date: today,
      })
      .select(
        "id, check_in_date, checked_in_at"
      )
      .single();

    if (checkInError) {
      console.error(
        "CREATE CHECKIN ERROR:",
        checkInError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Gagal melakukan check-in.",
        },
        { status: 500 }
      );
    }

    // =========================
    // SUCCESS
    // =========================

    return NextResponse.json(
      {
        success: true,
        message:
          "Check-in berhasil! Selamat datang di JCWF.",
        participant: {
          id: participant.id,
          reconnectId:
            participant.reconnect_id,
          fullName:
            participant.full_name,
          email: participant.email,
          city: participant.city,
          interest:
            participant.interest_category,
        },
        checkIn: {
          id: checkIn.id,
          date: checkIn.check_in_date,
          checkedInAt:
            checkIn.checked_in_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CHECKIN SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}