import { NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentParticipant } from "@/lib/participant-session";
import { supabaseServer } from "@/lib/supabase-server";

const FESTIVAL_DAYS = [
  "2026-11-06",
  "2026-11-07",
  "2026-11-08",
];

function generateTicketCode(eventDate: string) {
  const dayNumber =
    eventDate === "2026-11-06"
      ? "D1"
      : eventDate === "2026-11-07"
        ? "D2"
        : "D3";

  return `${dayNumber}-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
}

// GET — ambil tiket yang sudah dimiliki peserta
export async function GET() {
  try {
    const participant =
      await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    const { data: tickets, error } =
      await supabaseServer
        .from("daily_tickets")
        .select(
          "id, event_date, ticket_code, status, created_at"
        )
        .eq("participant_id", participant.id)
        .order("event_date", {
          ascending: true,
        });

    if (error) {
      console.error(
        "GET TICKETS ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengambil tiket.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tickets: tickets ?? [],
    });
  } catch (error) {
    console.error(
      "GET TICKETS SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

// POST — generate tiket untuk satu hari
export async function POST(request: Request) {
  try {
    const participant =
      await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const eventDate = body.eventDate;

    if (!FESTIVAL_DAYS.includes(eventDate)) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal festival tidak valid.",
        },
        { status: 400 }
      );
    }

    // Cek apakah tiket hari tersebut sudah ada
    const {
      data: existingTicket,
      error: existingError,
    } = await supabaseServer
      .from("daily_tickets")
      .select(
        "id, event_date, ticket_code, status, created_at"
      )
      .eq("participant_id", participant.id)
      .eq("event_date", eventDate)
      .maybeSingle();

    if (existingError) {
      console.error(
        "CHECK EXISTING TICKET ERROR:",
        existingError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengecek tiket.",
        },
        { status: 500 }
      );
    }

    // Kalau sudah punya → jangan bikin baru
    if (existingTicket) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        ticket: existingTicket,
      });
    }

    const ticketCode =
      generateTicketCode(eventDate);

    const {
      data: ticket,
      error: insertError,
    } = await supabaseServer
      .from("daily_tickets")
      .insert({
        participant_id: participant.id,
        event_date: eventDate,
        ticket_code: ticketCode,
        status: "active",
      })
      .select(
        "id, event_date, ticket_code, status, created_at"
      )
      .single();

    if (insertError) {
      console.error(
        "CREATE TICKET ERROR:",
        insertError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gagal membuat tiket.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        alreadyExists: false,
        ticket,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE TICKET SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}