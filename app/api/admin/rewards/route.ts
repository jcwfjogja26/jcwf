import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-admin-auth";
import { supabaseServer } from "@/lib/supabase-server";

async function getAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: adminUser, error: adminError } = await supabaseServer
    .from("admin_users")
    .select("id, full_name, email, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError || !adminUser || !adminUser.is_active) {
    return null;
  }

  return adminUser;
}

function formatReward(reward: any) {
  return {
    id: reward.id,
    name: reward.name,
    slug: reward.slug,
    description: reward.description,
    imageUrl: reward.image_url,
    pointsRequired: reward.points_required,
    stock: reward.stock,
    status: reward.status,
    createdAt: reward.created_at,
    updatedAt: reward.updated_at,
  };
}

export async function GET(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";

    const { data, error } = await supabaseServer
      .from("rewards")
      .select(
        `
          id,
          name,
          slug,
          description,
          image_url,
          points_required,
          stock,
          status,
          created_at,
          updated_at
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ADMIN REWARDS GET ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengambil data rewards.",
        },
        { status: 500 }
      );
    }

    let rewards = (data || []).map(formatReward);

    if (status) {
      rewards = rewards.filter((reward) => reward.status === status);
    }

    if (search) {
      const keyword = search.toLowerCase();

      rewards = rewards.filter((reward) => {
        return (
          reward.name?.toLowerCase().includes(keyword) ||
          reward.slug?.toLowerCase().includes(keyword) ||
          reward.description?.toLowerCase().includes(keyword)
        );
      });
    }

    const summary = {
      total: rewards.length,
      active: rewards.filter((reward) => reward.status === "active").length,
      inactive: rewards.filter((reward) => reward.status === "inactive").length,
      soldOut: rewards.filter((reward) => reward.status === "sold_out").length,
      totalStock: rewards.reduce(
        (total, reward) => total + Number(reward.stock || 0),
        0
      ),
    };

    return NextResponse.json({
      success: true,
      summary,
      rewards,
    });
  } catch (error) {
    console.error("ADMIN REWARDS SERVER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = body.name?.trim();
    const slug = body.slug?.trim().toLowerCase();
    const description = body.description?.trim() || null;
    const imageUrl = body.imageUrl?.trim() || null;
    const pointsRequired = Number(body.pointsRequired);
    const stock = Number(body.stock);
    const status = body.status || "active";

    if (!name || !slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama dan slug reward wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(pointsRequired) ||
      pointsRequired < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Points dan stock harus berupa angka valid.",
        },
        { status: 400 }
      );
    }

    if (!["active", "inactive", "sold_out"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status reward tidak valid.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("rewards")
      .insert({
        name,
        slug,
        description,
        image_url: imageUrl,
        points_required: pointsRequired,
        stock,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error("ADMIN REWARDS POST ERROR:", error);

      if (error.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            message: "Slug reward sudah digunakan.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Gagal membuat reward.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        reward: formatReward(data),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADMIN REWARDS POST SERVER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id = body.id?.trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID reward wajib diisi.",
        },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = body.name?.trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Nama reward tidak boleh kosong.",
          },
          { status: 400 }
        );
      }

      updates.name = name;
    }

    if (body.slug !== undefined) {
      const slug = body.slug?.trim().toLowerCase();

      if (!slug) {
        return NextResponse.json(
          {
            success: false,
            message: "Slug reward tidak boleh kosong.",
          },
          { status: 400 }
        );
      }

      updates.slug = slug;
    }

    if (body.description !== undefined) {
      updates.description = body.description?.trim() || null;
    }

    if (body.imageUrl !== undefined) {
      updates.image_url = body.imageUrl?.trim() || null;
    }

    if (body.pointsRequired !== undefined) {
      const pointsRequired = Number(body.pointsRequired);

      if (!Number.isInteger(pointsRequired) || pointsRequired < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Points required tidak valid.",
          },
          { status: 400 }
        );
      }

      updates.points_required = pointsRequired;
    }

    if (body.stock !== undefined) {
      const stock = Number(body.stock);

      if (!Number.isInteger(stock) || stock < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Stock tidak valid.",
          },
          { status: 400 }
        );
      }

      updates.stock = stock;
    }

    if (body.status !== undefined) {
      if (!["active", "inactive", "sold_out"].includes(body.status)) {
        return NextResponse.json(
          {
            success: false,
            message: "Status reward tidak valid.",
          },
          { status: 400 }
        );
      }

      updates.status = body.status;
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseServer
      .from("rewards")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("ADMIN REWARDS PATCH ERROR:", error);

      if (error.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            message: "Slug reward sudah digunakan.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Gagal memperbarui reward.",
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Reward tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      reward: formatReward(data),
    });
  } catch (error) {
    console.error("ADMIN REWARDS PATCH SERVER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID reward wajib diisi.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("rewards")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("ADMIN REWARDS DELETE ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Gagal menghapus reward.",
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Reward tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reward berhasil dihapus.",
    });
  } catch (error) {
    console.error("ADMIN REWARDS DELETE SERVER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}