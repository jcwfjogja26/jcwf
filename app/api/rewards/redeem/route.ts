import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/participant-session";
import { supabaseServer } from "@/lib/supabase-server";

function generateRedemptionCode() {
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();

  return `JCWF-${random}`;
}

export async function POST(request: Request) {
  try {
    const participant = await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          message: "Kamu harus login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const rewardId = body.rewardId?.trim();

    if (!rewardId) {
      return NextResponse.json(
        {
          success: false,
          message: "Reward wajib dipilih.",
        },
        { status: 400 }
      );
    }

    /*
     * Ambil reward.
     */
    const { data: reward, error: rewardError } = await supabaseServer
      .from("rewards")
      .select(
        `
          id,
          name,
          points_required,
          stock,
          status
        `
      )
      .eq("id", rewardId)
      .maybeSingle();

    if (rewardError) {
      console.error("REWARD REDEEM GET REWARD ERROR:", rewardError);

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengambil data reward.",
        },
        { status: 500 }
      );
    }

    if (!reward) {
      return NextResponse.json(
        {
          success: false,
          message: "Reward tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    if (reward.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: "Reward ini sedang tidak tersedia.",
        },
        { status: 400 }
      );
    }

    if (reward.stock <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Reward ini sudah habis.",
        },
        { status: 400 }
      );
    }

    /*
     * Hitung saldo points peserta dari seluruh transaksi.
     */
    const { data: transactions, error: transactionError } =
      await supabaseServer
        .from("points_transactions")
        .select("points")
        .eq("participant_id", participant.id);

    if (transactionError) {
      console.error(
        "REWARD REDEEM GET POINTS ERROR:",
        transactionError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengecek saldo points.",
        },
        { status: 500 }
      );
    }

    const currentPoints = (transactions || []).reduce(
      (total, transaction) => total + Number(transaction.points || 0),
      0
    );

    if (currentPoints < reward.points_required) {
      return NextResponse.json(
        {
          success: false,
          message: "Points kamu belum cukup untuk menukar reward ini.",
          currentPoints,
          requiredPoints: reward.points_required,
        },
        { status: 400 }
      );
    }

    /*
     * Pastikan participant belum punya redemption
     * pending untuk reward yang sama.
     */
    const { data: existingRedemption, error: existingError } =
      await supabaseServer
        .from("reward_redemptions")
        .select("id, redemption_code, status")
        .eq("participant_id", participant.id)
        .eq("reward_id", reward.id)
        .eq("status", "pending")
        .maybeSingle();

    if (existingError) {
      console.error(
        "REWARD REDEEM EXISTING ERROR:",
        existingError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengecek redemption sebelumnya.",
        },
        { status: 500 }
      );
    }

    if (existingRedemption) {
      return NextResponse.json(
        {
          success: false,
          alreadyRedeemed: true,
          message: "Kamu masih memiliki redemption yang belum diklaim.",
          redemption: {
            id: existingRedemption.id,
            code: existingRedemption.redemption_code,
            status: existingRedemption.status,
          },
        },
        { status: 409 }
      );
    }

    /*
     * Buat redemption.
     */
    const redemptionCode = generateRedemptionCode();

    const { data: redemption, error: redemptionError } =
      await supabaseServer
        .from("reward_redemptions")
        .insert({
          participant_id: participant.id,
          reward_id: reward.id,
          redemption_code: redemptionCode,
          points_spent: reward.points_required,
          status: "pending",
        })
        .select(
          `
            id,
            redemption_code,
            points_spent,
            status,
            redeemed_at
          `
        )
        .single();

    if (redemptionError) {
      console.error(
        "REWARD REDEEM INSERT ERROR:",
        redemptionError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gagal membuat redemption reward.",
        },
        { status: 500 }
      );
    }

    /*
     * Catat pengurangan points.
     */
    const { error: pointsError } = await supabaseServer
      .from("points_transactions")
      .insert({
        participant_id: participant.id,
        points: -reward.points_required,
        type: "reward_redemption",
        description: `Penukaran reward: ${reward.name}.`,
        reference_id: redemption.id,
      });

    if (pointsError) {
      console.error(
        "REWARD REDEEM POINTS ERROR:",
        pointsError
      );

      /*
       * Rollback redemption kalau transaksi points gagal.
       */
      await supabaseServer
        .from("reward_redemptions")
        .delete()
        .eq("id", redemption.id);

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengurangi points. Redemption dibatalkan.",
        },
        { status: 500 }
      );
    }

    /*
     * Kurangi stock.
     */
    const { data: updatedReward, error: stockError } =
      await supabaseServer
        .from("rewards")
        .update({
          stock: reward.stock - 1,
          status: reward.stock - 1 <= 0 ? "sold_out" : reward.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reward.id)
        .eq("stock", reward.stock)
        .select("id, stock, status")
        .maybeSingle();

    if (stockError || !updatedReward) {
      console.error(
        "REWARD REDEEM STOCK ERROR:",
        stockError
      );

      /*
       * Rollback points transaction.
       */
      await supabaseServer
        .from("points_transactions")
        .delete()
        .eq("reference_id", redemption.id)
        .eq("type", "reward_redemption");

      /*
       * Rollback redemption.
       */
      await supabaseServer
        .from("reward_redemptions")
        .delete()
        .eq("id", redemption.id);

      return NextResponse.json(
        {
          success: false,
          message: "Stock reward baru saja berubah. Silakan coba lagi.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Berhasil menukar ${reward.name}.`,
        redemption: {
          id: redemption.id,
          code: redemption.redemption_code,
          pointsSpent: redemption.points_spent,
          status: redemption.status,
          redeemedAt: redemption.redeemed_at,
        },
        reward: {
          id: reward.id,
          name: reward.name,
          pointsRequired: reward.points_required,
          remainingStock: updatedReward.stock,
        },
        points: {
          spent: reward.points_required,
          remaining: currentPoints - reward.points_required,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REWARD REDEEM SERVER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}