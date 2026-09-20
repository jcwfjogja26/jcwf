import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-admin-auth";
import { supabaseServer } from "@/lib/supabase-server";

async function getAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: admin, error: adminError } = await supabaseServer
    .from("admin_users")
    .select("id, full_name, email, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError || !admin || !admin.is_active) {
    return null;
  }

  return admin;
}

function formatRedemption(item: any) {
  return {
    id: item.id,
    redemptionCode: item.redemption_code,
    pointsSpent: item.points_spent,
    status: item.status,
    redeemedAt: item.redeemed_at,
    claimedAt: item.claimed_at,
    createdAt: item.created_at,
    updatedAt: item.updated_at,

    participant: item.participants
      ? {
          id: item.participants.id,
          fullName: item.participants.full_name,
          reconnectId: item.participants.reconnect_id,
          email: item.participants.email,
          whatsapp: item.participants.whatsapp,
        }
      : null,

    reward: item.rewards
      ? {
          id: item.rewards.id,
          name: item.rewards.name,
          slug: item.rewards.slug,
          imageUrl: item.rewards.image_url,
          pointsRequired: item.rewards.points_required,
        }
      : null,
  };
}

export async function GET(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";

    const { data, error } = await supabaseServer
      .from("reward_redemptions")
      .select(
        `
        id,
        redemption_code,
        points_spent,
        status,
        redeemed_at,
        claimed_at,
        created_at,
        updated_at,
        participants (
          id,
          full_name,
          reconnect_id,
          email,
          whatsapp
        ),
        rewards (
          id,
          name,
          slug,
          image_url,
          points_required
        )
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET ADMIN REDEMPTIONS ERROR:", error);

      return NextResponse.json(
        { message: "Gagal mengambil data redemption." },
        { status: 500 }
      );
    }

    let redemptions = data ?? [];

    if (status) {
      redemptions = redemptions.filter(
        (item: any) => item.status === status
      );
    }

    if (search) {
      const keyword = search.toLowerCase();

      redemptions = redemptions.filter((item: any) => {
        const participant = item.participants;
        const reward = item.rewards;

        return (
          item.redemption_code?.toLowerCase().includes(keyword) ||
          participant?.full_name?.toLowerCase().includes(keyword) ||
          participant?.reconnect_id?.toLowerCase().includes(keyword) ||
          participant?.email?.toLowerCase().includes(keyword) ||
          reward?.name?.toLowerCase().includes(keyword)
        );
      });
    }

    const summary = {
      total: redemptions.length,
      pending: redemptions.filter(
        (item: any) => item.status === "pending"
      ).length,
      claimed: redemptions.filter(
        (item: any) => item.status === "claimed"
      ).length,
      cancelled: redemptions.filter(
        (item: any) => item.status === "cancelled"
      ).length,
      totalPointsSpent: redemptions.reduce(
        (total: number, item: any) =>
          total + Number(item.points_spent || 0),
        0
      ),
    };

    return NextResponse.json({
      success: true,
      summary,
      redemptions: redemptions.map(formatRedemption),
    });
  } catch (error) {
    console.error("ADMIN REDEMPTIONS API ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const redemptionId = body.id;
    const status = body.status;

    if (!redemptionId || !status) {
      return NextResponse.json(
        { message: "ID redemption dan status wajib diisi." },
        { status: 400 }
      );
    }

    if (!["pending", "claimed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { message: "Status redemption tidak valid." },
        { status: 400 }
      );
    }

    const { data: existing, error: existingError } =
      await supabaseServer
        .from("reward_redemptions")
        .select("id, status")
        .eq("id", redemptionId)
        .maybeSingle();

    if (existingError) {
      console.error(
        "GET EXISTING REDEMPTION ERROR:",
        existingError
      );

      return NextResponse.json(
        { message: "Gagal mengambil redemption." },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json(
        { message: "Redemption tidak ditemukan." },
        { status: 404 }
      );
    }

    const updateData: {
      status: string;
      claimed_at?: string | null;
    } = {
      status,
    };

    if (status === "claimed") {
      updateData.claimed_at = new Date().toISOString();
    } else if (existing.status === "claimed") {
      updateData.claimed_at = null;
    }

    const { data: updated, error: updateError } =
      await supabaseServer
        .from("reward_redemptions")
        .update(updateData)
        .eq("id", redemptionId)
        .select(
          `
          id,
          redemption_code,
          points_spent,
          status,
          redeemed_at,
          claimed_at,
          created_at,
          updated_at,
          participants (
            id,
            full_name,
            reconnect_id,
            email,
            whatsapp
          ),
          rewards (
            id,
            name,
            slug,
            image_url,
            points_required
          )
          `
        )
        .single();

    if (updateError) {
      console.error(
        "UPDATE REDEMPTION ERROR:",
        updateError
      );

      return NextResponse.json(
        { message: "Gagal memperbarui status redemption." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      redemption: formatRedemption(updated),
    });
  } catch (error) {
    console.error(
      "ADMIN REDEMPTION PATCH ERROR:",
      error
    );

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}