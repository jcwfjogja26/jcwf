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

  const { data: adminUser, error: adminError } = await supabaseServer
    .from("admin_users")
    .select("id, full_name, email, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError || !adminUser || !adminUser.is_active) {
    return null;
  }

  return adminUser;
}

function formatTransaction(transaction: any) {
  return {
    id: transaction.id,
    points: transaction.points,
    type: transaction.type,
    description: transaction.description,
    referenceId: transaction.reference_id,
    createdAt: transaction.created_at,
    participant: transaction.participants
      ? {
          id: transaction.participants.id,
          fullName: transaction.participants.full_name,
          reconnectId: transaction.participants.reconnect_id,
          email: transaction.participants.email,
        }
      : null,
  };
}

export async function GET(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const type = searchParams.get("type") || "";
    const direction = searchParams.get("direction") || "";

    const { data, error } = await supabaseServer
      .from("points_transactions")
      .select(`
        id,
        participant_id,
        points,
        type,
        description,
        reference_id,
        created_at,
        participants (
          id,
          full_name,
          reconnect_id,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ADMIN POINTS GET ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengambil data points.",
        },
        { status: 500 }
      );
    }

    let transactions = (data || []).map(formatTransaction);

    if (type) {
      transactions = transactions.filter(
        (transaction) => transaction.type === type
      );
    }

    if (direction === "earned") {
      transactions = transactions.filter(
        (transaction) => transaction.points > 0
      );
    }

    if (direction === "deducted") {
      transactions = transactions.filter(
        (transaction) => transaction.points < 0
      );
    }

    if (search) {
      const keyword = search.toLowerCase();

      transactions = transactions.filter((transaction) => {
        const fullName =
          transaction.participant?.fullName?.toLowerCase() || "";

        const reconnectId =
          transaction.participant?.reconnectId?.toLowerCase() || "";

        const email =
          transaction.participant?.email?.toLowerCase() || "";

        const description =
          transaction.description?.toLowerCase() || "";

        const transactionType =
          transaction.type?.toLowerCase() || "";

        return (
          fullName.includes(keyword) ||
          reconnectId.includes(keyword) ||
          email.includes(keyword) ||
          description.includes(keyword) ||
          transactionType.includes(keyword)
        );
      });
    }

    const totalEarned = transactions
      .filter((transaction) => transaction.points > 0)
      .reduce(
        (total, transaction) => total + transaction.points,
        0
      );

    const totalDeducted = transactions
      .filter((transaction) => transaction.points < 0)
      .reduce(
        (total, transaction) =>
          total + Math.abs(transaction.points),
        0
      );

    const netPoints = totalEarned - totalDeducted;

    const uniqueParticipants = new Set(
      transactions
        .map(
          (transaction) =>
            transaction.participant?.id
        )
        .filter(Boolean)
    ).size;

    const transactionTypes = Array.from(
      new Set(
        (data || [])
          .map((transaction) => transaction.type)
          .filter(Boolean)
      )
    ).sort();

    return NextResponse.json({
      success: true,
      summary: {
        totalTransactions: transactions.length,
        totalEarned,
        totalDeducted,
        netPoints,
        uniqueParticipants,
      },
      transactionTypes,
      transactions,
    });
  } catch (error) {
    console.error("ADMIN POINTS SERVER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}