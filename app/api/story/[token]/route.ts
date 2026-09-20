import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json(
        {
          message: "Story tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const { data: story, error } =
      await supabaseServer
        .from("my_stories")
        .select(
          `
            id,
            reflection,
            is_shared,
            shared_at,
            created_at,
            participants (
              full_name,
              reconnect_id
            )
          `
        )
        .eq("share_token", token)
        .eq("is_shared", true)
        .maybeSingle();

    if (error) {
      console.error("Get shared story error:", error);

      return NextResponse.json(
        {
          message: "Gagal mengambil story.",
        },
        {
          status: 500,
        }
      );
    }

    if (!story) {
      return NextResponse.json(
        {
          message: "Story tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const participant = Array.isArray(
      story.participants
    )
      ? story.participants[0]
      : story.participants;

    return NextResponse.json({
      story: {
        id: story.id,
        reflection: story.reflection,
        sharedAt: story.shared_at,
        createdAt: story.created_at,
        participant: participant
          ? {
              fullName: participant.full_name,
              reconnectId: participant.reconnect_id,
            }
          : null,
      },
    });
  } catch (error) {
    console.error(
      "Shared story route error:",
      error
    );

    return NextResponse.json(
      {
        message: "Terjadi kesalahan.",
      },
      {
        status: 500,
      }
    );
  }
}