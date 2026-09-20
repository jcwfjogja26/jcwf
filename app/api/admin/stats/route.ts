import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { createSupabaseServerClient } from "@/lib/supabase-admin-auth";

const FESTIVAL_DAYS = [
  "2026-11-06",
  "2026-11-07",
  "2026-11-08",
];

export async function GET() {
  try {
    // =========================
    // CHECK ADMIN AUTH
    // =========================
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

    // =========================
    // CHECK ADMIN ACCESS
    // =========================
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

    // =========================
    // TOTAL PARTICIPANTS
    // =========================
    const {
      count: totalParticipants,
      error: participantsError,
    } = await supabaseServer
      .from("participants")
      .select("id", {
        count: "exact",
        head: true,
      });

    if (participantsError) {
      console.error(
        "GET PARTICIPANTS COUNT ERROR:",
        participantsError
      );

      return NextResponse.json(
        {
          message:
            "Gagal mengambil jumlah peserta.",
        },
        { status: 500 }
      );
    }

    // =========================
    // TOTAL DAILY TICKETS
    // =========================
    const {
      count: totalTickets,
      error: ticketsError,
    } = await supabaseServer
      .from("daily_tickets")
      .select("id", {
        count: "exact",
        head: true,
      });

    if (ticketsError) {
      console.error(
        "GET TICKETS COUNT ERROR:",
        ticketsError
      );

      return NextResponse.json(
        {
          message:
            "Gagal mengambil jumlah ticket.",
        },
        { status: 500 }
      );
    }

    // =========================
    // TOTAL CHECK-INS
    // =========================
    const {
      count: totalCheckins,
      error: checkinsError,
    } = await supabaseServer
      .from("daily_ticket_checkins")
      .select("id", {
        count: "exact",
        head: true,
      });

    if (checkinsError) {
      console.error(
        "GET CHECKINS COUNT ERROR:",
        checkinsError
      );

      return NextResponse.json(
        {
          message:
            "Gagal mengambil jumlah check-in.",
        },
        { status: 500 }
      );
    }

    // =========================
    // CHECK-IN PER DAY
    // =========================
    const dayStats: Record<string, number> = {};

    for (const date of FESTIVAL_DAYS) {
      const { count, error } =
        await supabaseServer
          .from("daily_ticket_checkins")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("event_date", date);

      if (error) {
        console.error(
          `GET CHECKINS ${date} ERROR:`,
          error
        );

        return NextResponse.json(
          {
            message:
              "Gagal mengambil statistik harian.",
          },
          { status: 500 }
        );
      }

      dayStats[date] = count ?? 0;
    }

    // =========================
    // CHECK-IN RATE
    // =========================
    const participants =
      totalParticipants ?? 0;

    const checkins =
      totalCheckins ?? 0;

    const checkinRate =
      participants > 0
        ? Math.round(
            (checkins / participants) * 100
          )
        : 0;

    return NextResponse.json({
      success: true,

      stats: {
        totalParticipants:
          participants,

        totalTickets:
          totalTickets ?? 0,

        totalCheckins:
          checkins,

        checkinRate,

        days: {
          day1:
            dayStats["2026-11-06"],

          day2:
            dayStats["2026-11-07"],

          day3:
            dayStats["2026-11-08"],
        },
      },
    });
  } catch (error) {
    console.error(
      "ADMIN STATS SERVER ERROR:",
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