import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getCurrentParticipant } from "@/lib/participant-session";

function generateBookingCode() {
  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `JCWF-${random}`;
}

export async function POST(request: Request) {
  try {
    // 1. Pastikan participant sudah login
    const participant = await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        {
          message: "Silakan login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    // 2. Ambil activity ID
    const body = await request.json();

    const { activityId, quantity = 1 } = body;

    if (!activityId) {
      return NextResponse.json(
        {
          message: "Activity wajib dipilih.",
        },
        { status: 400 }
      );
    }

    // 3. Validasi quantity
    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        {
          message: "Jumlah tiket tidak valid.",
        },
        { status: 400 }
      );
    }

    // 4. Ambil activity dari database
    const {
      data: activity,
      error: activityError,
    } = await supabaseServer
      .from("activities")
      .select(
        `
        id,
        title,
        category,
        event_date,
        start_time,
        end_time,
        location,
        price,
        capacity,
        status
        `
      )
      .eq("id", activityId)
      .maybeSingle();

    if (activityError) {
      console.error(
        "GET ACTIVITY FOR BOOKING ERROR:",
        activityError
      );

      return NextResponse.json(
        {
          message:
            "Gagal mengambil data activity.",
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

    // 5. Pastikan activity masih aktif
    if (activity.status !== "active") {
      return NextResponse.json(
        {
          message:
            "Activity ini sudah tidak tersedia.",
        },
        { status: 400 }
      );
    }

    // 6. Cek apakah participant sudah punya booking aktif
    const {
      data: existingBooking,
      error: existingBookingError,
    } = await supabaseServer
      .from("activity_registrations")
      .select(
        `
        id,
        booking_code,
        quantity,
        total_amount,
        status,
        payment_status
        `
      )
      .eq("participant_id", participant.id)
      .eq("activity_id", activity.id)
      .neq("status", "cancelled")
      .maybeSingle();

    if (existingBookingError) {
      console.error(
        "CHECK EXISTING BOOKING ERROR:",
        existingBookingError
      );

      return NextResponse.json(
        {
          message:
            "Gagal mengecek booking sebelumnya.",
        },
        { status: 500 }
      );
    }

    if (existingBooking) {
      return NextResponse.json(
        {
          message:
            "Kamu sudah memiliki booking untuk activity ini.",
          booking: existingBooking,
        },
        { status: 409 }
      );
    }

    // 7. Cek kapasitas
    if (activity.capacity !== null) {
      const {
        count: bookedCount,
        error: bookedCountError,
      } = await supabaseServer
        .from("activity_registrations")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("activity_id", activity.id)
        .neq("status", "cancelled");

      if (bookedCountError) {
        console.error(
          "CHECK BOOKING CAPACITY ERROR:",
          bookedCountError
        );

        return NextResponse.json(
          {
            message:
              "Gagal mengecek kapasitas activity.",
          },
          { status: 500 }
        );
      }

      const remainingCapacity =
        activity.capacity - (bookedCount ?? 0);

      if (quantity > remainingCapacity) {
        return NextResponse.json(
          {
            message: `Sisa kapasitas hanya ${remainingCapacity} peserta.`,
          },
          { status: 409 }
        );
      }
    }

    // 8. Hitung total harga
    const totalAmount =
      activity.price * quantity;

    // 9. Generate booking code
    const bookingCode =
      generateBookingCode();

    // 10. Buat booking
    const {
      data: booking,
      error: bookingError,
    } = await supabaseServer
      .from("activity_registrations")
      .insert({
        participant_id: participant.id,
        activity_id: activity.id,
        booking_code: bookingCode,
        quantity,
        total_amount: totalAmount,
        status: "registered",
        payment_status: "pending",
      })
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
      .single();

    if (bookingError) {
      console.error(
        "CREATE ACTIVITY BOOKING ERROR:",
        bookingError
      );

      return NextResponse.json(
        {
          message:
            "Gagal membuat booking.",
        },
        { status: 500 }
      );
    }

    // 11. Buat payment dengan status PENDING
    const {
      data: payment,
      error: paymentError,
    } = await supabaseServer
      .from("activity_payments")
      .insert({
        booking_id: booking.id,
        payment_method: "qris",
        amount: totalAmount,
        status: "pending",
      })
      .select(
        `
        id,
        booking_id,
        payment_method,
        amount,
        status,
        created_at
        `
      )
      .single();

    if (paymentError) {
      console.error(
        "CREATE ACTIVITY PAYMENT ERROR:",
        paymentError
      );

      // Hapus booking jika payment gagal dibuat
      await supabaseServer
        .from("activity_registrations")
        .delete()
        .eq("id", booking.id);

      return NextResponse.json(
        {
          message:
            "Gagal membuat transaksi pembayaran.",
        },
        { status: 500 }
      );
    }

    // 12. Return data untuk checkout
    return NextResponse.json(
      {
        success: true,
        message:
          "Booking berhasil dibuat. Silakan lanjutkan pembayaran.",
        booking,
        payment,
        activity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ACTIVITY BOOKING SERVER ERROR:",
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