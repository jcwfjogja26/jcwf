import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-admin-auth";
import { supabaseServer } from "@/lib/supabase-server";

async function getAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

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

function formatGalleryPost(post: any) {
  let imageUrl = post.image_url;

  if (!imageUrl && post.image_path) {
    const { data } = supabaseServer.storage
      .from("gallery")
      .getPublicUrl(post.image_path);

    imageUrl = data.publicUrl;
  }

  return {
    id: post.id,
    imageUrl,
    imagePath: post.image_path,
    caption: post.caption,
    status: post.status,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    participant: post.participants
      ? {
          id: post.participants.id,
          fullName: post.participants.full_name,
          reconnectId: post.participants.reconnect_id,
          email: post.participants.email,
        }
      : null,
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
      .from("gallery_posts")
      .select(`
        id,
        image_url,
        image_path,
        caption,
        status,
        created_at,
        updated_at,
        participants (
          id,
          full_name,
          reconnect_id,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ADMIN GALLERY GET ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengambil data gallery.",
        },
        { status: 500 }
      );
    }

    let posts = (data || []).map(formatGalleryPost);

    if (status) {
      posts = posts.filter((post) => post.status === status);
    }

    if (search) {
      const keyword = search.toLowerCase();

      posts = posts.filter((post) => {
        const fullName =
          post.participant?.fullName?.toLowerCase() || "";

        const reconnectId =
          post.participant?.reconnectId?.toLowerCase() || "";

        const email =
          post.participant?.email?.toLowerCase() || "";

        const caption =
          post.caption?.toLowerCase() || "";

        return (
          fullName.includes(keyword) ||
          reconnectId.includes(keyword) ||
          email.includes(keyword) ||
          caption.includes(keyword)
        );
      });
    }

    const summary = {
      total: posts.length,
      visible: posts.filter((post) => post.status === "visible").length,
      hidden: posts.filter((post) => post.status === "hidden").length,
      deleted: posts.filter((post) => post.status === "deleted").length,
    };

    return NextResponse.json({
      success: true,
      summary,
      posts,
    });
  } catch (error) {
    console.error("ADMIN GALLERY SERVER ERROR:", error);

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

    const caption =
      typeof body.caption === "string"
        ? body.caption.trim()
        : undefined;

    const status = body.status;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID gallery wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (
      status !== undefined &&
      !["visible", "hidden", "deleted"].includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Status gallery tidak valid.",
        },
        { status: 400 }
      );
    }

    if (caption !== undefined && caption.length > 300) {
      return NextResponse.json(
        {
          success: false,
          message: "Caption maksimal 300 karakter.",
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (caption !== undefined) {
      updateData.caption = caption || null;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const { data, error } = await supabaseServer
      .from("gallery_posts")
      .update(updateData)
      .eq("id", id)
      .select(`
        id,
        image_url,
        image_path,
        caption,
        status,
        created_at,
        updated_at,
        participants (
          id,
          full_name,
          reconnect_id,
          email
        )
      `)
      .maybeSingle();

    if (error) {
      console.error("ADMIN GALLERY PATCH ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Gagal memperbarui gallery.",
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Data gallery tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Gallery berhasil diperbarui.",
      post: formatGalleryPost(data),
    });
  } catch (error) {
    console.error("ADMIN GALLERY PATCH SERVER ERROR:", error);

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

    const body = await request.json();
    const id = body.id?.trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID gallery wajib diisi.",
        },
        { status: 400 }
      );
    }

    // Ambil data gallery terlebih dahulu
    const { data: post, error: fetchError } = await supabaseServer
      .from("gallery_posts")
      .select("id, participant_id, image_path")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error(
        "ADMIN GALLERY DELETE FETCH ERROR:",
        fetchError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengambil data gallery.",
        },
        { status: 500 }
      );
    }

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          message: "Data gallery tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    /*
     * Cari transaksi poin yang berasal dari upload gallery ini.
     *
     * Saat participant upload:
     * points = +10
     * type = "gallery_upload"
     * reference_id = gallery_posts.id
     */
    const { data: pointTransaction, error: pointFetchError } =
      await supabaseServer
        .from("points_transactions")
        .select("id, participant_id, points, type, reference_id")
        .eq("participant_id", post.participant_id)
        .eq("reference_id", post.id)
        .eq("type", "gallery_upload")
        .maybeSingle();

    if (pointFetchError) {
      console.error(
        "ADMIN GALLERY POINT FETCH ERROR:",
        pointFetchError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gagal memverifikasi poin gallery.",
        },
        { status: 500 }
      );
    }

    /*
     * Kalau transaksi +10 ditemukan, buat transaksi -10.
     *
     * Kita TIDAK menghapus transaksi +10.
     * Riwayat poin tetap tersimpan dan ada reversal -10.
     */
    if (pointTransaction) {
      const pointsToReverse = Math.abs(pointTransaction.points);

      const { error: reversePointError } = await supabaseServer
        .from("points_transactions")
        .insert({
          participant_id: post.participant_id,
          points: -pointsToReverse,
          type: "gallery_delete",
          description: "Pengurangan poin karena upload gallery dihapus admin.",
          reference_id: post.id,
        });

      if (reversePointError) {
        console.error(
          "ADMIN GALLERY POINT REVERSAL ERROR:",
          reversePointError
        );

        return NextResponse.json(
          {
            success: false,
            message: "Gagal mengurangi poin participant.",
          },
          { status: 500 }
        );
      }
    }

    // Hapus file dari Supabase Storage
    if (post.image_path) {
      const { error: storageError } = await supabaseServer.storage
        .from("gallery")
        .remove([post.image_path]);

      if (storageError) {
        console.error(
          "ADMIN GALLERY STORAGE DELETE ERROR:",
          storageError
        );
      }
    }

    // Hapus record gallery
    const { error: deleteError } = await supabaseServer
      .from("gallery_posts")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(
        "ADMIN GALLERY DELETE ERROR:",
        deleteError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gagal menghapus gallery.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: pointTransaction
        ? "Gallery berhasil dihapus dan poin participant dikurangi."
        : "Gallery berhasil dihapus.",
      pointsReversed: pointTransaction
        ? Math.abs(pointTransaction.points)
        : 0,
    });
  } catch (error) {
    console.error(
      "ADMIN GALLERY DELETE SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}