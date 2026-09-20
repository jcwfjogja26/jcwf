import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getCurrentParticipant } from "@/lib/participant-session";

export async function GET() {
  try {
    const participant = await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        {
          message: "Silakan login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    const {
      data: registrations,
      error,
    } = await supabaseServer
      .from("activity_registrations")
      .select(
        `
        id,
        booking_code,
        quantity,
        total_amount,
        payment_status,
        status,
        registered_at,
        activity:activities (
          id,
          title,
          slug,
          description,
          category,
          event_date,
          start_time,
          end_time,
          location,
          price,
          capacity,
          image_url,
          status
        )
        `
      )
      .eq("participant_id", participant.id)
      .eq("payment_status", "paid")
      .neq("status", "cancelled")
      .order("registered_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "GET MY PLAN ERROR:",
        error
      );

      return NextResponse.json(
        {
          message:
            "Gagal mengambil My Plan.",
        },
        { status: 500 }
      );
    }

    const plan = (registrations ?? []).map(
      (registration) => ({
        registrationId: registration.id,
        bookingCode: registration.booking_code,
        quantity: registration.quantity,
        totalAmount: registration.total_amount,
        paymentStatus:
          registration.payment_status,
        registrationStatus:
          registration.status,
        registeredAt:
          registration.registered_at,
        activity: registration.activity,
      })
    );

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error(
      "MY PLAN SERVER ERROR:",
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