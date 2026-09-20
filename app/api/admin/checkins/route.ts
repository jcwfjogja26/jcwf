import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { createSupabaseServerClient } from "@/lib/supabase-admin-auth";

export async function GET() {
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
          message: "Unauthorized",
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
          message:
            "Gagal memverifikasi akses admin.",
        },
        { status: 500 }
      );
    }

    if (!adminUser || !adminUser.is_active) {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        { status: 403 }
      );
    }

    // ==========================================
    // 1. GET CHECK-IN RECORDS
    // ==========================================

    const {
      data: checkins,
      error: checkinsError,
    } = await supabaseServer
      .from("daily_ticket_checkins")
      .select(
        "id, ticket_id, participant_id, event_date, checked_in_at, created_at"
      )
      .order("checked_in_at", {
        ascending: false,
      });

    if (checkinsError) {
      console.error(
        "GET CHECKINS ERROR:",
        checkinsError
      );

      return NextResponse.json(
        {
          message:
            "Gagal mengambil data check-in.",
          error: checkinsError.message,
        },
        { status: 500 }
      );
    }

    if (!checkins || checkins.length === 0) {
      return NextResponse.json({
        success: true,
        checkins: [],
      });
    }

    // ==========================================
    // 2. GET TICKETS
    // ==========================================

    const ticketIds = [
      ...new Set(
        checkins.map(
          (checkin) => checkin.ticket_id
        )
      ),
    ];

    const {
      data: tickets,
      error: ticketsError,
    } = await supabaseServer
      .from("daily_tickets")
      .select(
        "id, ticket_code, event_date, status"
      )
      .in("id", ticketIds);

    if (ticketsError) {
      console.error(
        "GET TICKETS ERROR:",
        ticketsError
      );

      return NextResponse.json(
        {
          message:
            "Gagal mengambil data ticket.",
          error: ticketsError.message,
        },
        { status: 500 }
      );
    }

    // ==========================================
    // 3. GET PARTICIPANTS
    // ==========================================

    const participantIds = [
      ...new Set(
        checkins.map(
          (checkin) =>
            checkin.participant_id
        )
      ),
    ];

    const {
      data: participants,
      error: participantsError,
    } = await supabaseServer
      .from("participants")
      .select(
        "id, full_name, reconnect_id, email, whatsapp"
      )
      .in("id", participantIds);

    if (participantsError) {
      console.error(
        "GET PARTICIPANTS ERROR:",
        participantsError
      );

      return NextResponse.json(
        {
          message:
            "Gagal mengambil data peserta.",
          error:
            participantsError.message,
        },
        { status: 500 }
      );
    }

    // ==========================================
    // 4. CREATE LOOKUP MAPS
    // ==========================================

    const ticketMap = new Map(
      (tickets ?? []).map((ticket) => [
        ticket.id,
        ticket,
      ])
    );

    const participantMap = new Map(
      (participants ?? []).map(
        (participant) => [
          participant.id,
          participant,
        ]
      )
    );

    // ==========================================
    // 5. COMBINE DATA
    // ==========================================

    const formattedCheckins =
      checkins.map((checkin) => {
        const ticket = ticketMap.get(
          checkin.ticket_id
        );

        const participant =
          participantMap.get(
            checkin.participant_id
          );

        return {
          id: checkin.id,

          ticketId:
            checkin.ticket_id,

          participantId:
            checkin.participant_id,

          eventDate:
            checkin.event_date,

          checkedInAt:
            checkin.checked_in_at,

          ticketCode:
            ticket?.ticket_code ?? "-",

          ticketStatus:
            ticket?.status ?? "-",

          fullName:
            participant?.full_name ?? "-",

          reconnectId:
            participant?.reconnect_id ?? "-",

          email:
            participant?.email ?? "-",

          whatsapp:
            participant?.whatsapp ?? "-",
        };
      });

    // ==========================================
    // 6. RESPONSE
    // ==========================================

    return NextResponse.json({
      success: true,
      checkins: formattedCheckins,
    });
  } catch (error) {
    console.error(
      "ADMIN CHECKINS SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Terjadi kesalahan pada server.",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}