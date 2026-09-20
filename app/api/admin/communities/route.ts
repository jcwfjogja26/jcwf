import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-admin-auth";
import { supabaseServer } from "@/lib/supabase-server";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  const { data: admin, error } = await supabaseServer
    .from("admin_users")
    .select("id, full_name, email, role, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !admin) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "Forbidden." },
        { status: 403 }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}

/**
 * GET
 * Semua community, termasuk inactive.
 */
export async function GET() {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const { data: communities, error } = await supabaseServer
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
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("ADMIN COMMUNITIES GET ERROR:", error);

      return NextResponse.json(
        {
          message: "Gagal mengambil data communities.",
        },
        { status: 500 }
      );
    }

    const communityIds =
      communities?.map((community) => community.id) ?? [];

    let memberCounts: Record<string, number> = {};

    if (communityIds.length > 0) {
      const { data: members, error: membersError } =
        await supabaseServer
          .from("community_members")
          .select("community_id")
          .in("community_id", communityIds);

      if (membersError) {
        console.error(
          "ADMIN COMMUNITY MEMBERS COUNT ERROR:",
          membersError
        );
      } else {
        memberCounts = (members ?? []).reduce(
          (acc, member) => {
            acc[member.community_id] =
              (acc[member.community_id] ?? 0) + 1;

            return acc;
          },
          {} as Record<string, number>
        );
      }
    }

    const result = (communities ?? []).map((community) => ({
      ...community,
      member_count: memberCounts[community.id] ?? 0,
    }));

    return NextResponse.json({
      success: true,
      communities: result,
    });
  } catch (error) {
    console.error("ADMIN COMMUNITIES GET UNEXPECTED ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST
 * Create community.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const slug = String(body.slug ?? "").trim().toLowerCase();
    const category = String(body.category ?? "").trim();

    const description =
      body.description === null ||
      body.description === undefined
        ? null
        : String(body.description).trim();

    const image_url =
      body.image_url === null ||
      body.image_url === undefined ||
      body.image_url === ""
        ? null
        : String(body.image_url).trim();

    const instagram_url =
      body.instagram_url === null ||
      body.instagram_url === undefined ||
      body.instagram_url === ""
        ? null
        : String(body.instagram_url).trim();

    const website_url =
      body.website_url === null ||
      body.website_url === undefined ||
      body.website_url === ""
        ? null
        : String(body.website_url).trim();

    const status =
      body.status === "inactive"
        ? "inactive"
        : "active";

    if (!name || !slug || !category) {
      return NextResponse.json(
        {
          message:
            "Name, slug, dan category wajib diisi.",
        },
        { status: 400 }
      );
    }

    const { data: existing } = await supabaseServer
      .from("communities")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          message:
            "Slug community sudah digunakan.",
        },
        { status: 409 }
      );
    }

    const { data: community, error } =
      await supabaseServer
        .from("communities")
        .insert({
          name,
          slug,
          description,
          category,
          image_url,
          instagram_url,
          website_url,
          status,
        })
        .select()
        .single();

    if (error) {
      console.error(
        "ADMIN COMMUNITIES POST ERROR:",
        error
      );

      return NextResponse.json(
        {
          message:
            error.message ||
            "Gagal membuat community.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        community,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ADMIN COMMUNITIES POST UNEXPECTED ERROR:",
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