import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/participant-session";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const participant = await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        { message: "Kamu belum login." },
        { status: 401 }
      );
    }

    // Ambil reward yang bisa dilihat participant
    // inactive tidak ditampilkan.
    const { data: rewards, error: rewardsError } = await supabaseServer
      .from("rewards")
      .select(
        `
        id,
        name,
        slug,
        description,
        image_url,
        points_required,
        stock,
        status
        `
      )
      .in("status", ["active", "sold_out"])
      .order("points_required", { ascending: true });

    if (rewardsError) {
      console.error("GET REWARDS ERROR:", rewardsError);

      return NextResponse.json(
        { message: "Gagal mengambil data rewards." },
        { status: 500 }
      );
    }

    // Hitung saldo points participant
    const { data: transactions, error: transactionsError } =
      await supabaseServer
        .from("points_transactions")
        .select("points")
        .eq("participant_id", participant.id);

    if (transactionsError) {
      console.error(
        "GET PARTICIPANT POINTS ERROR:",
        transactionsError
      );

      return NextResponse.json(
        { message: "Gagal mengambil saldo points." },
        { status: 500 }
      );
    }

    const currentPoints = (transactions ?? []).reduce(
      (total, transaction) => total + Number(transaction.points || 0),
      0
    );

    return NextResponse.json({
      success: true,
      points: currentPoints,
      rewards: (rewards ?? []).map((reward) => ({
        id: reward.id,
        name: reward.name,
        slug: reward.slug,
        description: reward.description,
        imageUrl: reward.image_url,
        pointsRequired: reward.points_required,
        stock: reward.stock,
        status: reward.status,
      })),
    });
  } catch (error) {
    console.error("REWARDS API ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}