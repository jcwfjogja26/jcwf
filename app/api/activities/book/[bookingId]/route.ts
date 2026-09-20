import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getCurrentParticipant } from "@/lib/participant-session";

type RouteContext = {
  params: Promise<{
    bookingId: string;
  }>;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    console.log("========================================");
    console.log("[BOOKING API] START");
    console.log("========================================");

    // ==========================================
    // 1. CHECK PARTICIPANT LOGIN
    // ==========================================

    const participant = await getCurrentParticipant();

    console.log("[BOOKING API] PARTICIPANT:", participant
      ? {
          id: participant.id,
          email: participant.email,
          full_name: participant.full_name,
        }
      : null
    );

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          message: "Participant belum login.",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // 2. GET BOOKING ID
    // ==========================================

    const { bookingId } = await context.params;

    console.log("[BOOKING API] BOOKING ID:", bookingId);

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID tidak diberikan.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 3. VALIDATE UUID
    // ==========================================

    if (!UUID_REGEX.test(bookingId)) {
      console.error(
        "[BOOKING API] INVALID UUID:",
        bookingId
      );

      return NextResponse.json(
        {
          success: false,
          message: "Format Booking ID tidak valid.",
          bookingId,
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 4. GET BOOKING
    // ==========================================

    console.log(
      "[BOOKING API] Fetching activity_registrations..."
    );

    const {
      data: rawBooking,
      error: rawBookingError,
    } = await supabaseServer
      .from("activity_registrations")
      .select(
        `
        id,
        participant_id,
        activity_id,
        booking_code,
        quantity,
        total_amount,
        status,
        payment_status,
        registered_at
        `
      )
      .eq("id", bookingId)
      .limit(1)
      .maybeSingle();

    console.log(
      "[BOOKING API] RAW BOOKING:",
      rawBooking
    );

    console.log(
      "[BOOKING API] RAW BOOKING ERROR:",
      rawBookingError
    );

    if (rawBookingError) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal mencari booking.",
          error: rawBookingError.message,
          details: rawBookingError.details,
          hint: rawBookingError.hint,
          code: rawBookingError.code,
        },
        { status: 500 }
      );
    }

    if (!rawBooking) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booking tidak ditemukan di database.",
          bookingId,
        },
        { status: 404 }
      );
    }

    // ==========================================
    // 5. CHECK BOOKING OWNER
    // ==========================================

    console.log(
      "[BOOKING API] BOOKING PARTICIPANT:",
      rawBooking.participant_id
    );

    console.log(
      "[BOOKING API] CURRENT PARTICIPANT:",
      participant.id
    );

    if (
      rawBooking.participant_id !== participant.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booking ini bukan milik participant yang sedang login.",
          bookingParticipantId:
            rawBooking.participant_id,
          currentParticipantId:
            participant.id,
        },
        { status: 403 }
      );
    }

    // ==========================================
    // 6. GET ACTIVITY
    // ==========================================

    console.log(
      "[BOOKING API] Fetching activity..."
    );

    const {
      data: activity,
      error: activityError,
    } = await supabaseServer
      .from("activities")
      .select(
        `
        id,
        title,
        slug,
        category,
        description,
        event_date,
        start_time,
        end_time,
        location,
        price,
        capacity,
        image_url,
        status
        `
      )
      .eq("id", rawBooking.activity_id)
      .limit(1)
      .maybeSingle();

    console.log(
      "[BOOKING API] ACTIVITY:",
      activity
    );

    console.log(
      "[BOOKING API] ACTIVITY ERROR:",
      activityError
    );

    if (activityError) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengambil activity.",
          error: activityError.message,
          details: activityError.details,
          hint: activityError.hint,
          code: activityError.code,
        },
        { status: 500 }
      );
    }

    if (!activity) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Activity dari booking tidak ditemukan.",
          activityId: rawBooking.activity_id,
        },
        { status: 404 }
      );
    }

    // ==========================================
    // 7. GET PAYMENT
    // ==========================================

    console.log(
      "[BOOKING API] Fetching payment..."
    );

    const {
      data: payments,
      error: paymentError,
    } = await supabaseServer
      .from("activity_payments")
      .select(
        `
        id,
        booking_id,
        payment_method,
        amount,
        status,
        paid_at,
        created_at,
        updated_at
        `
      )
      .eq("booking_id", rawBooking.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(1);

    console.log(
      "[BOOKING API] PAYMENTS:",
      payments
    );

    console.log(
      "[BOOKING API] PAYMENT ERROR:",
      paymentError
    );

    if (paymentError) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengambil payment.",
          error: paymentError.message,
          details: paymentError.details,
          hint: paymentError.hint,
          code: paymentError.code,
        },
        { status: 500 }
      );
    }

    const payment =
      payments && payments.length > 0
        ? payments[0]
        : null;

    // ==========================================
    // 8. SUCCESS
    // ==========================================

    console.log(
      "[BOOKING API] SUCCESS"
    );

    return NextResponse.json({
      success: true,

      booking: {
        ...rawBooking,
        activity,
      },

      payment,
    });
  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "[BOOKING API] FATAL ERROR:",
      error
    );

    console.error(
      "========================================"
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan pada booking API.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}