import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { createSupabaseServerClient } from "@/lib/supabase-admin-auth";

const VALID_DATES = [
  "2026-11-06",
  "2026-11-07",
  "2026-11-08",
];

function getTicketDay(eventDate: string) {
  const dayMap: Record<string, string> = {
    "2026-11-06": "D1",
    "2026-11-07": "D2",
    "2026-11-08": "D3",
  };

  return dayMap[eventDate] ?? null;
}

function getTodayJakarta() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function POST(request: Request) {
  try {
    // ==========================================
    // 0. CHECK ADMIN AUTH
    // ==========================================

    const supabaseAuth =
      await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          status: "UNAUTHORIZED",
          message: "Silakan login sebagai admin.",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // 0.1 CHECK ADMIN ACCESS
    // ==========================================

    const { data: adminUser, error: adminError } =
      await supabaseServer
        .from("admin_users")
        .select("id, role, is_active")
        .eq("id", user.id)
        .maybeSingle();

    if (adminError) {
      console.error(
        "GET ADMIN USER ERROR:",
        adminError
      );

      return NextResponse.json(
        {
          success: false,
          status: "ERROR",
          message:
            "Gagal memverifikasi akses admin.",
        },
        { status: 500 }
      );
    }

    if (!adminUser || !adminUser.is_active) {
      return NextResponse.json(
        {
          success: false,
          status: "FORBIDDEN",
          message:
            "Kamu tidak memiliki akses admin.",
        },
        { status: 403 }
      );
    }

    // ==========================================
    // 1. READ REQUEST
    // ==========================================

    const body = await request.json();

    const rawCode = body.ticketCode;

    if (!rawCode || typeof rawCode !== "string") {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID",
          message: "QR code tidak valid.",
        },
        { status: 400 }
      );
    }

    const ticketCode =
      rawCode.trim().toUpperCase();

    // ==========================================
    // 2. BASIC FORMAT VALIDATION
    // ==========================================

    /*
     * D1-XXXXXXXX
     * D2-XXXXXXXX
     * D3-XXXXXXXX
     */

    const codeMatch = ticketCode.match(
      /^(D[123])-[A-Z0-9]+$/
    );

    if (!codeMatch) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID",
          message:
            "Format ticket tidak dikenali.",
        },
        { status: 400 }
      );
    }

    const scannedDay = codeMatch[1];

    // ==========================================
    // 3. GET TICKET
    // ==========================================

    const {
      data: ticket,
      error: ticketError,
    } = await supabaseServer
      .from("daily_tickets")
      .select(
        `
        id,
        participant_id,
        event_date,
        ticket_code,
        status,
        created_at,
        participants (
          id,
          full_name,
          email,
          whatsapp,
          reconnect_id
        )
        `
      )
      .eq("ticket_code", ticketCode)
      .maybeSingle();

    if (ticketError) {
      console.error(
        "SCANNER TICKET ERROR:",
        ticketError
      );

      return NextResponse.json(
        {
          success: false,
          status: "ERROR",
          message:
            "Gagal mengecek ticket.",
        },
        { status: 500 }
      );
    }

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          status: "NOT_FOUND",
          message:
            "Ticket tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // 4. VALIDATE EVENT DATE
    // ==========================================

    const eventDate =
      ticket.event_date as string;

    if (!VALID_DATES.includes(eventDate)) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID",
          message:
            "Tanggal ticket tidak valid.",
        },
        { status: 400 }
      );
    }

    const ticketDay =
      getTicketDay(eventDate);

    // ==========================================
    // 5. VALIDATE TICKET PREFIX
    // ==========================================

    /*
     * D1 code harus berasal dari D1,
     * D2 dari D2,
     * D3 dari D3.
     */

    if (ticketDay !== scannedDay) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID",
          message:
            "Kode ticket dan tanggal ticket tidak cocok.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 6. DETERMINE TODAY
    // ==========================================

    const testDate = body.testDate;

    const today =
      process.env.NODE_ENV !== "production" &&
      typeof testDate === "string" &&
      VALID_DATES.includes(testDate)
        ? testDate
        : getTodayJakarta();

    // ==========================================
    // 7. AUTOMATIC DATE VALIDATION
    // ==========================================

    if (today !== eventDate) {
      let message =
        "Ticket belum berlaku.";

      if (today > eventDate) {
        message =
          "Ticket ini sudah lewat.";
      }

      return NextResponse.json({
        success: false,
        status:
          today > eventDate
            ? "EXPIRED"
            : "NOT_TODAY",
        message,
        ticket: {
          ticketCode:
            ticket.ticket_code,
          day: ticketDay,
          eventDate,
        },
      });
    }

    // ==========================================
    // 8. CHECK TICKET STATUS
    // ==========================================

    if (ticket.status !== "active") {
      return NextResponse.json({
        success: false,
        status: "INACTIVE",
        message:
          "Ticket tidak aktif.",
        ticket: {
          ticketCode:
            ticket.ticket_code,
          day: ticketDay,
          eventDate,
        },
      });
    }

    // ==========================================
    // 9. CHECK EXISTING CHECK-IN
    // ==========================================

    const { data: existingCheckin } =
      await supabaseServer
        .from("daily_ticket_checkins")
        .select(
          "id, checked_in_at"
        )
        .eq("ticket_id", ticket.id)
        .maybeSingle();

    if (existingCheckin) {
      const participant =
        Array.isArray(
          ticket.participants
        )
          ? ticket.participants[0]
          : ticket.participants;

      return NextResponse.json({
        success: false,
        status:
          "ALREADY_CHECKED_IN",
        message:
          "Ticket sudah digunakan untuk check-in.",
        ticket: {
          ticketCode:
            ticket.ticket_code,
          day: ticketDay,
          eventDate,
          checkedInAt:
            existingCheckin.checked_in_at,
        },
        participant,
      });
    }

    // ==========================================
    // 10. REGISTER CHECK-IN
    // ==========================================

    const { error: checkinError } =
      await supabaseServer
        .from("daily_ticket_checkins")
        .insert({
          ticket_id: ticket.id,
          participant_id:
            ticket.participant_id,
          event_date: eventDate,
        });

    if (checkinError) {
      /*
       * Handles race condition if two scanners
       * scan the same ticket at almost the same time.
       */

      if (checkinError.code === "23505") {
        return NextResponse.json({
          success: false,
          status:
            "ALREADY_CHECKED_IN",
          message:
            "Ticket baru saja digunakan oleh scanner lain.",
        });
      }

      console.error(
        "CHECK-IN ERROR:",
        checkinError
      );

      return NextResponse.json(
        {
          success: false,
          status: "ERROR",
          message:
            "Gagal menyimpan check-in.",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // 11. SUCCESS
    // ==========================================

    const participant =
      Array.isArray(
        ticket.participants
      )
        ? ticket.participants[0]
        : ticket.participants;

    return NextResponse.json({
      success: true,
      status: "VALID",
      message:
        "Check-in berhasil.",
      ticket: {
        ticketCode:
          ticket.ticket_code,
        day: ticketDay,
        eventDate,
        checkedInAt:
          new Date().toISOString(),
      },
      participant,
    });
  } catch (error) {
    console.error(
      "SCANNER SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        status: "ERROR",
        message:
          "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}