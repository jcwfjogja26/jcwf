import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-admin-auth";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("ADMIN LOGOUT ERROR:", error);

      return NextResponse.json(
        {
          message: "Gagal logout.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("ADMIN LOGOUT SERVER ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat logout.",
      },
      { status: 500 }
    );
  }
}