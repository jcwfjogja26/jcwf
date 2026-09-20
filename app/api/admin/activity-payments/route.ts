import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-admin-auth";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    // 1. Cek session admin
    const supabaseAuth = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // 2. Cek admin_users
    const { data: admin, error: adminError } = await supabaseServer
      .from("admin_users")
      .select("id, full_name, email, role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (adminError) {
      console.error("[ADMIN ACTIVITY PAYMENTS] Admin lookup error:", adminError);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to verify admin access",
          error: adminError.message,
        },
        { status: 500 }
      );
    }

    if (!admin || !admin.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access denied",
        },
        { status: 403 }
      );
    }

    // 3. Ambil semua activity registrations
    const { data: bookings, error: bookingError } = await supabaseServer
      .from("activity_registrations")
      .select(`
        id,
        booking_code,
        participant_id,
        quantity,
        total_amount,
        payment_status,
        status,
        registered_at,
        activity:activities (
          id,
          title,
          slug,
          category,
          event_date,
          start_time,
          end_time,
          location,
          price
        )
      `)
      .order("registered_at", { ascending: false });

    if (bookingError) {
      console.error(
        "[ADMIN ACTIVITY PAYMENTS] Booking query error:",
        bookingError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch activity bookings",
          error: bookingError.message,
        },
        { status: 500 }
      );
    }

    // 4. Ambil participant
    const participantIds = [
      ...new Set(
        (bookings ?? [])
          .map((booking) => booking.participant_id)
          .filter(Boolean)
      ),
    ];

    let participants: any[] = [];

    if (participantIds.length > 0) {
      const { data, error: participantError } = await supabaseServer
        .from("participants")
        .select(`
          id,
          reconnect_id,
          full_name,
          email,
          whatsapp
        `)
        .in("id", participantIds);

      if (participantError) {
        console.error(
          "[ADMIN ACTIVITY PAYMENTS] Participant query error:",
          participantError
        );

        return NextResponse.json(
          {
            success: false,
            message: "Failed to fetch participants",
            error: participantError.message,
          },
          { status: 500 }
        );
      }

      participants = data ?? [];
    }

    // 5. Ambil payment records
    const bookingIds = (bookings ?? []).map((booking) => booking.id);

    let payments: any[] = [];

    if (bookingIds.length > 0) {
      const { data, error: paymentError } = await supabaseServer
        .from("activity_payments")
        .select(`
          id,
          booking_id,
          payment_method,
          amount,
          status,
          verification_status,
          paid_at,
          verified_at,
          verified_by,
          created_at,
          updated_at
        `)
        .in("booking_id", bookingIds)
        .order("created_at", { ascending: false });

      if (paymentError) {
        console.error(
          "[ADMIN ACTIVITY PAYMENTS] Payment query error:",
          paymentError
        );

        return NextResponse.json(
          {
            success: false,
            message: "Failed to fetch payment records",
            error: paymentError.message,
          },
          { status: 500 }
        );
      }

      payments = data ?? [];
    }

    // 6. Gabungkan data
    const participantMap = new Map(
      participants.map((participant) => [participant.id, participant])
    );

    const paymentMap = new Map();

    for (const payment of payments) {
      // Ambil payment terbaru untuk setiap booking
      if (!paymentMap.has(payment.booking_id)) {
        paymentMap.set(payment.booking_id, payment);
      }
    }

    const result = (bookings ?? []).map((booking) => ({
      ...booking,
      participant:
        participantMap.get(booking.participant_id) ?? null,
      payment:
        paymentMap.get(booking.id) ?? null,
    }));

    return NextResponse.json({
      success: true,
      bookings: result,
    });
  } catch (error) {
    console.error("[ADMIN ACTIVITY PAYMENTS] Unexpected error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}