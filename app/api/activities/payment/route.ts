import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getCurrentParticipant } from "@/lib/participant-session";

export async function POST(request: Request) {
  try {
    // 1. Pastikan participant sudah login
    const participant =
      await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        {
          message:
            "Silakan login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    // 2. Ambil booking ID
    const body = await request.json();

    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        {
          message:
            "Booking ID wajib diberikan.",
        },
        { status: 400 }
      );
    }

    // 3. Cari booking milik participant
    const {
      data: booking,
      error: bookingError,
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
        payment_status
        `
      )
      .eq("id", bookingId)
      .eq(
        "participant_id",
        participant.id
      )
      .maybeSingle();

    if (bookingError) {
      console.error(
        "GET BOOKING FOR PAYMENT ERROR:",
        bookingError
      );

      return NextResponse.json(
        {
          message:
            "Gagal mengambil data booking.",
        },
        { status: 500 }
      );
    }

    if (!booking) {
      return NextResponse.json(
        {
          message:
            "Booking tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // 4. Cek apakah sudah dibayar
    if (
      booking.payment_status === "paid"
    ) {
      return NextResponse.json({
        success: true,
        message:
          "Booking ini sudah dibayar.",
        booking,
      });
    }

    // 5. Ambil payment
    const {
      data: payment,
      error: paymentError,
    } = await supabaseServer
      .from("activity_payments")
      .select(
        `
        id,
        booking_id,
        payment_method,
        amount,
        status
        `
      )
      .eq("booking_id", booking.id)
      .eq("status", "pending")
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (paymentError) {
      console.error(
        "GET PAYMENT FOR PAYMENT ERROR:",
        paymentError
      );

      return NextResponse.json(
        {
          message:
            "Gagal mengambil transaksi pembayaran.",
        },
        { status: 500 }
      );
    }

    if (!payment) {
      return NextResponse.json(
        {
          message:
            "Transaksi pembayaran tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // 6. Update payment menjadi PAID
    const {
      data: updatedPayment,
      error: updatePaymentError,
    } = await supabaseServer
      .from("activity_payments")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id)
      .select(
        `
        id,
        booking_id,
        payment_method,
        amount,
        status,
        paid_at,
        updated_at
        `
      )
      .single();

    if (updatePaymentError) {
      console.error(
        "UPDATE PAYMENT ERROR:",
        updatePaymentError
      );

      return NextResponse.json(
        {
          message:
            "Gagal memperbarui status pembayaran.",
        },
        { status: 500 }
      );
    }

    // 7. Update booking menjadi PAID
    const {
      data: updatedBooking,
      error: updateBookingError,
    } = await supabaseServer
      .from("activity_registrations")
      .update({
        payment_status: "paid",
        status: "registered",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id)
      .eq(
        "participant_id",
        participant.id
      )
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
        registered_at,
        updated_at
        `
      )
      .single();

    if (updateBookingError) {
      console.error(
        "UPDATE BOOKING PAYMENT STATUS ERROR:",
        updateBookingError
      );

      // Rollback payment jika booking gagal di-update
      await supabaseServer
        .from("activity_payments")
        .update({
          status: "pending",
          paid_at: null,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", payment.id);

      return NextResponse.json(
        {
          message:
            "Gagal memperbarui status booking.",
        },
        { status: 500 }
      );
    }

    // 8. Payment berhasil
    return NextResponse.json({
      success: true,
      message:
        "Pembayaran berhasil dikonfirmasi.",
      booking: updatedBooking,
      payment: updatedPayment,
    });
  } catch (error) {
    console.error(
      "ACTIVITY PAYMENT SERVER ERROR:",
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