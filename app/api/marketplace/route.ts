import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data: items, error } = await supabaseServer
      .from("marketplace_items")
      .select(
        `
        id,
        title,
        slug,
        category,
        vendor,
        description,
        price,
        stock,
        image_url,
        status
        `
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET MARKETPLACE ERROR:", error);

      return NextResponse.json(
        {
          message: "Gagal mengambil data marketplace.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      items: items ?? [],
    });
  } catch (error) {
    console.error("MARKETPLACE API ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}