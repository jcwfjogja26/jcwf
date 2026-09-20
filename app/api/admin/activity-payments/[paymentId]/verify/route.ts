import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-admin-auth";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(
  request: Request,
  context: {
    params: Promise<{ paymentId: string }>;
  }
) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Pastikan user adalah admin aktif
    const { data: adminUser, error: adminError } = await supabaseServer
      .from("admin_users")
      .select("id, role, is_active")
      .eq("id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (adminError) {
      console.error("[VERIFY] Admin check error:", adminError);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to verify admin access",
        },
        { status: 500 }
      );
    }

    if (!adminUser) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have admin access",
        },
        { status: 403 }
      );
    }

    const { paymentId } = await context.params;

    // Pastikan payment ada
    const { data: payment, error: paymentError } = await supabaseServer
      .from("activity_payments")
      .select("id, verification_status")
      .eq("id", paymentId)
      .maybeSingle();

    if (paymentError) {
      console.error("[VERIFY] Payment fetch error:", paymentError);

      return NextResponse.json(
        {
          success: false,
          message: paymentError.message,
        },
        { status: 500 }
      );
    }

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment not found",
        },
        { status: 404 }
      );
    }

    if (payment.verification_status === "verified") {
      return NextResponse.json({
        success: true,
        message: "Payment is already verified",
      });
    }

    // HANYA update status verifikasi
    const { data: updatedPayment, error: updateError } =
      await supabaseServer
        .from("activity_payments")
        .update({
          verification_status: "verified",
          verified_at: new Date().toISOString(),
          verified_by: user.id,
        })
        .eq("id", paymentId)
        .select()
        .single();

    if (updateError) {
      console.error("[VERIFY] Update error:", updateError);

      return NextResponse.json(
        {
          success: false,
          message: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("[VERIFY] Unexpected error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}