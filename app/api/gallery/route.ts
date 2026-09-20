import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("gallery_posts")
      .select(`
        id,
        image_path,
        caption,
        created_at,
        participant:participants (
          full_name,
          reconnect_id
        )
      `)
      .eq("status", "visible")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Gallery fetch error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load gallery.",
        },
        {
          status: 500,
        }
      );
    }

    const posts = (data ?? []).map((post) => {
      const participant = Array.isArray(post.participant)
        ? post.participant[0]
        : post.participant;

      let imageUrl = "";

      if (post.image_path) {
        const { data: publicUrlData } =
          supabaseServer.storage
            .from("gallery")
            .getPublicUrl(post.image_path);

        imageUrl = publicUrlData.publicUrl;
      }

      return {
        id: post.id,

        // URL gambar dari Supabase Storage
        imageUrl,

        // Tetap kirim path untuk debugging/backup
        imagePath: post.image_path,

        caption: post.caption,

        createdAt: post.created_at,

        participant: participant
          ? {
              fullName: participant.full_name,
              reconnectId: participant.reconnect_id,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Gallery unexpected error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}