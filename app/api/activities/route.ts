import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data: activities, error } = await supabaseServer
      .from("activities")
      .select(
        `
        id,
        title,
        slug,
        description,
        category,
        event_date,
        start_time,
        end_time,
        location,
        price,
        capacity,
        image_url,
        status
        `
      )
      .eq("status", "active")
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("GET ACTIVITIES ERROR:", error);

      return NextResponse.json(
        {
          message: "Gagal mengambil data aktivitas.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      activities: activities ?? [],
    });
  } catch (error) {
    console.error("ACTIVITIES API ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}