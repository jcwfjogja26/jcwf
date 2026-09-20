import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/participant-session";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const participant = await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseServer
      .from("my_stories")
      .select(
        `
          id,
          reflection,
          is_shared,
          share_token,
          shared_at,
          created_at,
          updated_at,
          status
        `
      )
      .eq("participant_id", participant.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/my-story error:", error);

      return NextResponse.json(
        { message: "Gagal mengambil My Stories." },
        { status: 500 }
      );
    }

    const stories = (data ?? []).map((story) => ({
      id: story.id,
      reflection: story.reflection,
      isShared: story.is_shared,
      shareToken: story.share_token,
      sharedAt: story.shared_at,
      createdAt: story.created_at,
      updatedAt: story.updated_at,
    }));

    return NextResponse.json({
      stories,
    });
  } catch (error) {
    console.error("GET /api/my-story unexpected error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil My Stories." },
      { status: 500 }
    );
  }
}

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
    const reflection =
      typeof body.reflection === "string"
        ? body.reflection.trim()
        : "";

    if (!reflection) {
      return NextResponse.json(
        { message: "Reflection tidak boleh kosong." },
        { status: 400 }
      );
    }

    if (reflection.length > 1000) {
      return NextResponse.json(
        { message: "Reflection maksimal 1000 karakter." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("my_stories")
      .insert({
        participant_id: participant.id,
        reflection,
        is_shared: false,
        status: "active",
      })
      .select(
        `
          id,
          reflection,
          is_shared,
          share_token,
          shared_at,
          created_at,
          updated_at,
          status
        `
      )
      .single();

    if (error) {
      console.error("POST /api/my-story error:", error);

      return NextResponse.json(
        { message: "Gagal membuat My Story." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      story: {
        id: data.id,
        reflection: data.reflection,
        isShared: data.is_shared,
        shareToken: data.share_token,
        sharedAt: data.shared_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error("POST /api/my-story unexpected error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat membuat My Story." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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

    const reflection =
      typeof body.reflection === "string"
        ? body.reflection.trim()
        : "";

    if (!storyId) {
      return NextResponse.json(
        { message: "Story ID wajib diisi." },
        { status: 400 }
      );
    }

    if (!reflection) {
      return NextResponse.json(
        { message: "Reflection tidak boleh kosong." },
        { status: 400 }
      );
    }

    if (reflection.length > 1000) {
      return NextResponse.json(
        { message: "Reflection maksimal 1000 karakter." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("my_stories")
      .update({
        reflection,
        updated_at: new Date().toISOString(),
      })
      .eq("id", storyId)
      .eq("participant_id", participant.id)
      .eq("status", "active")
      .select(
        `
          id,
          reflection,
          is_shared,
          share_token,
          shared_at,
          created_at,
          updated_at,
          status
        `
      )
      .single();

    if (error) {
      console.error("PATCH /api/my-story error:", error);

      return NextResponse.json(
        { message: "Story tidak ditemukan atau gagal diperbarui." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      story: {
        id: data.id,
        reflection: data.reflection,
        isShared: data.is_shared,
        shareToken: data.share_token,
        sharedAt: data.shared_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error("PATCH /api/my-story unexpected error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengedit My Story." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const { data, error } = await supabaseServer
      .from("my_stories")
      .update({
        status: "deleted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", storyId)
      .eq("participant_id", participant.id)
      .eq("status", "active")
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { message: "Story tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE /api/my-story unexpected error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat menghapus My Story." },
      { status: 500 }
    );
  }
}