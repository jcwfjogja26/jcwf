import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentParticipant } from "@/lib/participant-session";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const participant = await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const storyId =
      typeof body.storyId === "string"
        ? body.storyId
        : "";

    if (!storyId) {
      return NextResponse.json(
        { message: "Story ID wajib diisi." },
        { status: 400 }
      );
    }

    // Pastikan story benar-benar milik participant yang sedang login
    const { data: story, error: storyError } =
      await supabaseServer
        .from("my_stories")
        .select(
          "id, participant_id, is_shared, share_token, shared_at"
        )
        .eq("id", storyId)
        .eq("participant_id", participant.id)
        .eq("status", "active")
        .maybeSingle();

    if (storyError) {
      console.error(
        "Fetch story for sharing error:",
        storyError
      );

      return NextResponse.json(
        { message: "Gagal mengambil story." },
        { status: 500 }
      );
    }

    if (!story) {
      return NextResponse.json(
        { message: "Story tidak ditemukan." },
        { status: 404 }
      );
    }

    // Kalau sudah pernah di-share,
    // gunakan token yang sama supaya link lama tetap valid.
    const shareToken =
      story.share_token || randomUUID();

    const now = new Date().toISOString();

    const { data: updatedStory, error: updateError } =
      await supabaseServer
        .from("my_stories")
        .update({
          is_shared: true,
          share_token: shareToken,
          shared_at: story.shared_at || now,
          updated_at: now,
        })
        .eq("id", story.id)
        .eq("participant_id", participant.id)
        .select(
          "id, is_shared, share_token, shared_at"
        )
        .single();

    if (updateError) {
      console.error(
        "Update story share error:",
        updateError
      );

      return NextResponse.json(
        { message: "Gagal membagikan story." },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const shareUrl =
      `${baseUrl}/story/${updatedStory.share_token}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      shareToken: updatedStory.share_token,
      isShared: updatedStory.is_shared,
      sharedAt: updatedStory.shared_at,
    });
  } catch (error) {
    console.error(
      "POST /api/my-story/share unexpected error:",
      error
    );

    return NextResponse.json(
      { message: "Terjadi kesalahan saat membagikan story." },
      { status: 500 }
    );
  }
}