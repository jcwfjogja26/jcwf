import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-admin-auth";
import { supabaseServer } from "@/lib/supabase-server";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized." },
      { status: 401 }
    );
  }

  const { data: admin, error } = await supabaseServer
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !admin) {
    return NextResponse.json(
      { message: "Forbidden." },
      { status: 403 }
    );
  }

  return null;
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET single community
 */
export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const { id } = await context.params;

    const { data: community, error } =
      await supabaseServer
        .from("communities")
        .select(
          `
          id,
          name,
          slug,
          description,
          category,
          image_url,
          instagram_url,
          website_url,
          status,
          created_at
          `
        )
        .eq("id", id)
        .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          message:
            "Gagal mengambil community.",
        },
        { status: 500 }
      );
    }

    if (!community) {
      return NextResponse.json(
        {
          message: "Community tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const { count } = await supabaseServer
      .from("community_members")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("community_id", id);

    return NextResponse.json({
      success: true,
      community: {
        ...community,
        member_count: count ?? 0,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN COMMUNITY GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH
 * Update community.
 */
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const { id } = await context.params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      updates.name = String(body.name).trim();
    }

    if (body.slug !== undefined) {
      updates.slug = String(body.slug)
        .trim()
        .toLowerCase();
    }

    if (body.description !== undefined) {
      updates.description =
        body.description === ""
          ? null
          : String(body.description).trim();
    }

    if (body.category !== undefined) {
      updates.category = String(
        body.category
      ).trim();
    }

    if (body.image_url !== undefined) {
      updates.image_url =
        body.image_url === ""
          ? null
          : String(body.image_url).trim();
    }

    if (body.instagram_url !== undefined) {
      updates.instagram_url =
        body.instagram_url === ""
          ? null
          : String(body.instagram_url).trim();
    }

    if (body.website_url !== undefined) {
      updates.website_url =
        body.website_url === ""
          ? null
          : String(body.website_url).trim();
    }

    if (body.status !== undefined) {
      if (
        body.status !== "active" &&
        body.status !== "inactive"
      ) {
        return NextResponse.json(
          {
            message: "Status tidak valid.",
          },
          { status: 400 }
        );
      }

      updates.status = body.status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          message: "Tidak ada data yang diubah.",
        },
        { status: 400 }
      );
    }

    if (updates.slug) {
      const { data: duplicate } =
        await supabaseServer
          .from("communities")
          .select("id")
          .eq("slug", updates.slug)
          .neq("id", id)
          .maybeSingle();

      if (duplicate) {
        return NextResponse.json(
          {
            message:
              "Slug community sudah digunakan.",
          },
          { status: 409 }
        );
      }
    }

    const { data: community, error } =
      await supabaseServer
        .from("communities")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
      console.error(
        "ADMIN COMMUNITY PATCH ERROR:",
        error
      );

      return NextResponse.json(
        {
          message:
            error.message ||
            "Gagal mengubah community.",
        },
        { status: 500 }
      );
    }

    if (!community) {
      return NextResponse.json(
        {
          message: "Community tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      community,
    });
  } catch (error) {
    console.error(
      "ADMIN COMMUNITY PATCH UNEXPECTED ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE
 */
export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const { id } = await context.params;

    const { data: community } =
      await supabaseServer
        .from("communities")
        .select("id, name")
        .eq("id", id)
        .maybeSingle();

    if (!community) {
      return NextResponse.json(
        {
          message: "Community tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const { error } = await supabaseServer
      .from("communities")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "ADMIN COMMUNITY DELETE ERROR:",
        error
      );

      return NextResponse.json(
        {
          message:
            error.message ||
            "Gagal menghapus community.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Community berhasil dihapus.",
    });
  } catch (error) {
    console.error(
      "ADMIN COMMUNITY DELETE UNEXPECTED ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}