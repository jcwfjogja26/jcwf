import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getCurrentParticipant } from "@/lib/participant-session";

export async function POST(request: Request) {
  try {
    // =========================
    // CHECK PARTICIPANT SESSION
    // =========================

    const participant = await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        {
          message: "Silakan login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    // =========================
    // GET REQUEST BODY
    // =========================

    const body = await request.json();

    const { activityId } = body;

    if (!activityId) {
      return NextResponse.json(
        {
          message: "Activity wajib dipilih.",
        },
        { status: 400 }
      );
    }

    // =========================
    // CHECK ACTIVITY
    // =========================

    const { data: activity, error: activityError } =
      await supabaseServer
        .from("activities")
        .select(
          `
          id,
          title,
          event_date,
          start_time,
          end_time,
          location,
          capacity,
          status
          `
        )
        .eq("id", activityId)
        .maybeSingle();

    if (activityError) {
      console.error(
        "CHECK ACTIVITY ERROR:",
        activityError
      );

      return NextResponse.json(
        {
          message:
            "Terjadi kesalahan saat mengambil activity.",
        },
        { status: 500 }
      );
    }

    if (!activity) {
      return NextResponse.json(
        {
          message: "Activity tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // =========================
    // CHECK ACTIVITY STATUS
    // =========================

    if (activity.status !== "active") {
      return NextResponse.json(
        {
          message:
            "Activity ini sudah tidak tersedia.",
        },
        { status: 400 }
      );
    }

    // =========================
    // CHECK EXISTING REGISTRATION
    // =========================

    const {
      data: existingRegistration,
      error: existingError,
    } = await supabaseServer
      .from("activity_registrations")
      .select("id, status")
      .eq("participant_id", participant.id)
      .eq("activity_id", activity.id)
      .maybeSingle();

    if (existingError) {
      console.error(
        "CHECK EXISTING REGISTRATION ERROR:",
        existingError
      );

      return NextResponse.json(
        {
          message:
            "Terjadi kesalahan saat mengecek pendaftaran.",
        },
        { status: 500 }
      );
    }

    if (
      existingRegistration &&
      existingRegistration.status !== "cancelled"
    ) {
      return NextResponse.json(
        {
          message:
            "Kamu sudah terdaftar di activity ini.",
          registration:
            existingRegistration,
        },
        { status: 409 }
      );
    }

    // =========================
    // CHECK CAPACITY
    // =========================

    if (activity.capacity !== null) {
      const {
        count: registeredCount,
        error: countError,
      } = await supabaseServer
        .from("activity_registrations")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("activity_id", activity.id)
        .eq("status", "registered");

      if (countError) {
        console.error(
          "CHECK ACTIVITY CAPACITY ERROR:",
          countError
        );

        return NextResponse.json(
          {
            message:
              "Terjadi kesalahan saat mengecek kapasitas.",
          },
          { status: 500 }
        );
      }

      if (
        (registeredCount ?? 0) >= activity.capacity
      ) {
        return NextResponse.json(
          {
            message:
              "Activity ini sudah penuh.",
          },
          { status: 409 }
        );
      }
    }

    // =========================
    // REGISTER ACTIVITY
    // =========================

    let registration;

    if (
      existingRegistration &&
      existingRegistration.status === "cancelled"
    ) {
      const { data, error } =
        await supabaseServer
          .from("activity_registrations")
          .update({
            status: "registered",
            registered_at:
              new Date().toISOString(),
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", existingRegistration.id)
          .select(
            `
            id,
            participant_id,
            activity_id,
            status,
            registered_at,
            updated_at
            `
          )
          .single();

      if (error) {
        console.error(
          "REACTIVATE ACTIVITY REGISTRATION ERROR:",
          error
        );

        return NextResponse.json(
          {
            message:
              "Gagal mendaftarkan activity.",
          },
          { status: 500 }
        );
      }

      registration = data;
    } else {
      const { data, error } =
        await supabaseServer
          .from("activity_registrations")
          .insert({
            participant_id: participant.id,
            activity_id: activity.id,
            status: "registered",
          })
          .select(
            `
            id,
            participant_id,
            activity_id,
            status,
            registered_at,
            updated_at
            `
          )
          .single();

      if (error) {
        console.error(
          "CREATE ACTIVITY REGISTRATION ERROR:",
          error
        );

        return NextResponse.json(
          {
            message:
              "Gagal mendaftarkan activity.",
          },
          { status: 500 }
        );
      }

      registration = data;
    }

    // =========================
    // SUCCESS
    // =========================

    return NextResponse.json(
      {
        success: true,
        message:
          "Berhasil mendaftar activity.",
        registration,
        activity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ACTIVITY REGISTER SERVER ERROR:",
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
