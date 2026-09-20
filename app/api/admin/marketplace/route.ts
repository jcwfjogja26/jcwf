import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-admin-auth";
import { supabaseServer } from "@/lib/supabase-server";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, response: NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    ) };
  }

  const { data: admin, error } = await supabaseServer
    .from("admin_users")
    .select("id, full_name, email, role, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !admin) {
    return { user: null, response: NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    ) };
  }

  return { user, response: null };
}

export async function GET() {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const { data: items, error } = await supabaseServer
      .from("marketplace_items")
      .select(`
        id,
        title,
        slug,
        category,
        vendor,
        description,
        price,
        stock,
        image_url,
        status,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ADMIN MARKETPLACE GET ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Gagal mengambil data marketplace.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      items: items ?? [],
    });
  } catch (error) {
    console.error("ADMIN MARKETPLACE GET UNEXPECTED ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const body = await request.json();

    const {
      title,
      slug,
      category,
      vendor,
      description,
      price,
      stock,
      image_url,
      status,
    } = body;

    if (!title || !slug || !category || !vendor) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, slug, category, dan vendor wajib diisi.",
        },
        { status: 400 }
      );
    }

    const allowedCategories = [
      "FOOD",
      "CRAFT",
      "WELLNESS",
      "LOCAL",
    ];

    const allowedStatuses = [
      "active",
      "sold_out",
      "inactive",
    ];

    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: "Kategori tidak valid.",
        },
        { status: 400 }
      );
    }

    const finalStatus = status ?? "active";

    if (!allowedStatuses.includes(finalStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: "Status tidak valid.",
        },
        { status: 400 }
      );
    }

    const normalizedSlug = String(slug)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const { data: existingSlug } = await supabaseServer
      .from("marketplace_items")
      .select("id")
      .eq("slug", normalizedSlug)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "Slug sudah digunakan.",
        },
        { status: 409 }
      );
    }

    const { data: item, error } = await supabaseServer
      .from("marketplace_items")
      .insert({
        title: String(title).trim(),
        slug: normalizedSlug,
        category,
        vendor: String(vendor).trim(),
        description: description
          ? String(description).trim()
          : null,
        price: Number(price) || 0,
        stock:
          stock === null ||
          stock === undefined ||
          stock === ""
            ? null
            : Number(stock),
        image_url: image_url
          ? String(image_url).trim()
          : null,
        status: finalStatus,
      })
      .select()
      .single();

    if (error) {
      console.error("ADMIN MARKETPLACE POST ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Gagal menambahkan produk.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        item,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADMIN MARKETPLACE POST UNEXPECTED ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}