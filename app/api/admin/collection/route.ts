import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getAdmin() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: admin } = await supabaseServer
    .from("admin_users")
    .select("id, role, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  return admin;
}

/* =========================================================
   GET
   ========================================================= */

export async function GET() {
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

    const [{ data: cards, error: cardsError }, { data: qrCodes, error: qrError }] =
      await Promise.all([
        supabaseServer
          .from("collection_cards")
          .select(
            `
            id,
            name,
            slug,
            description,
            image_url,
            points,
            sort_order,
            status,
            created_at,
            updated_at
          `
          )
          .order("sort_order", {
            ascending: true,
          })
          .order("created_at", {
            ascending: true,
          }),

        supabaseServer
          .from("booth_qr_codes")
          .select(
            `
            id,
            code,
            booth_name,
            location,
            status,
            card_id,
            created_at,
            updated_at,
            collection_cards (
              id,
              name,
              slug,
              points,
              image_url
            )
          `
          )
          .order("created_at", {
            ascending: true,
          }),
      ]);

    if (cardsError) {
      console.error(
        "Admin collection cards error:",
        cardsError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengambil data collection cards.",
        },
        { status: 500 }
      );
    }

    if (qrError) {
      console.error(
        "Admin collection QR error:",
        qrError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengambil data QR booth.",
        },
        { status: 500 }
      );
    }

    const formattedCards = (cards ?? []).map((card) => ({
      id: card.id,
      name: card.name,
      slug: card.slug,
      description: card.description,
      imageUrl: card.image_url,
      points: card.points,
      sortOrder: card.sort_order,
      status: card.status,
      createdAt: card.created_at,
      updatedAt: card.updated_at,
    }));

    const formattedQRs = (qrCodes ?? []).map((item) => {
      const card = Array.isArray(item.collection_cards)
        ? item.collection_cards[0]
        : item.collection_cards;

      return {
        id: item.id,
        code: item.code,
        boothName: item.booth_name,
        location: item.location,
        status: item.status,
        cardId: item.card_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,

        card: card
          ? {
              id: card.id,
              name: card.name,
              slug: card.slug,
              points: card.points,
              imageUrl: card.image_url,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      cards: formattedCards,
      qrCodes: formattedQRs,
    });
  } catch (error) {
    console.error(
      "Admin collection GET error:",
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

/* =========================================================
   POST
   ========================================================= */

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
    const type = body.type;

    /* -------------------------
       CREATE CARD
       ------------------------- */

    if (type === "card") {
      const name = String(body.name ?? "").trim();
      const slug = String(body.slug ?? "").trim();
      const description = String(
        body.description ?? ""
      ).trim();

      const imageUrl =
        body.imageUrl
          ? String(body.imageUrl).trim()
          : null;

      const points = Number(body.points ?? 0);
      const sortOrder = Number(
        body.sortOrder ?? 0
      );

      const status =
        body.status === "inactive"
          ? "inactive"
          : "active";

      if (!name || !slug) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Nama dan slug card wajib diisi.",
          },
          { status: 400 }
        );
      }

      if (
        !Number.isFinite(points) ||
        points < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Points tidak valid.",
          },
          { status: 400 }
        );
      }

      const { data, error } =
        await supabaseServer
          .from("collection_cards")
          .insert({
            name,
            slug,
            description:
              description || null,
            image_url: imageUrl,
            points,
            sort_order: sortOrder,
            status,
          })
          .select()
          .single();

      if (error) {
        console.error(
          "Create collection card error:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            message:
              error.code === "23505"
                ? "Slug card sudah digunakan."
                : "Gagal membuat collection card.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        card: data,
      });
    }

    /* -------------------------
       CREATE BOOTH QR
       ------------------------- */

    if (type === "qr") {
      const cardId = String(
        body.cardId ?? ""
      ).trim();

      const boothName = String(
        body.boothName ?? ""
      ).trim();

      const location = body.location
        ? String(body.location).trim()
        : null;

      const code = String(
        body.code ?? ""
      ).trim();

      const status =
        body.status === "inactive"
          ? "inactive"
          : "active";

      if (
        !cardId ||
        !boothName ||
        !code
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Card, nama booth, dan code wajib diisi.",
          },
          { status: 400 }
        );
      }

      const { data: card } =
        await supabaseServer
          .from("collection_cards")
          .select("id")
          .eq("id", cardId)
          .maybeSingle();

      if (!card) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Collection card tidak ditemukan.",
          },
          { status: 400 }
        );
      }

      const { data, error } =
        await supabaseServer
          .from("booth_qr_codes")
          .insert({
            card_id: cardId,
            booth_name: boothName,
            location,
            code,
            status,
          })
          .select()
          .single();

      if (error) {
        console.error(
          "Create booth QR error:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            message:
              error.code === "23505"
                ? "Code QR sudah digunakan."
                : "Gagal membuat booth QR.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        qrCode: data,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Tipe data tidak valid.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "Admin collection POST error:",
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

/* =========================================================
   PATCH
   ========================================================= */

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
    const type = body.type;
    const id = String(body.id ?? "").trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID wajib diisi.",
        },
        { status: 400 }
      );
    }

    /* -------------------------
       UPDATE CARD
       ------------------------- */

    if (type === "card") {
      const name = String(body.name ?? "").trim();
      const slug = String(body.slug ?? "").trim();
      const description = String(
        body.description ?? ""
      ).trim();

      const imageUrl =
        body.imageUrl
          ? String(body.imageUrl).trim()
          : null;

      const points = Number(body.points ?? 0);
      const sortOrder = Number(
        body.sortOrder ?? 0
      );

      const status =
        body.status === "inactive"
          ? "inactive"
          : "active";

      if (!name || !slug) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Nama dan slug card wajib diisi.",
          },
          { status: 400 }
        );
      }

      const { data, error } =
        await supabaseServer
          .from("collection_cards")
          .update({
            name,
            slug,
            description:
              description || null,
            image_url: imageUrl,
            points,
            sort_order: sortOrder,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

      if (error) {
        console.error(
          "Update collection card error:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            message:
              error.code === "23505"
                ? "Slug card sudah digunakan."
                : "Gagal mengubah collection card.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        card: data,
      });
    }

    /* -------------------------
       UPDATE QR
       ------------------------- */

    if (type === "qr") {
      const cardId = String(
        body.cardId ?? ""
      ).trim();

      const boothName = String(
        body.boothName ?? ""
      ).trim();

      const location = body.location
        ? String(body.location).trim()
        : null;

      const code = String(
        body.code ?? ""
      ).trim();

      const status =
        body.status === "inactive"
          ? "inactive"
          : "active";

      if (
        !cardId ||
        !boothName ||
        !code
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Card, nama booth, dan code wajib diisi.",
          },
          { status: 400 }
        );
      }

      const { data, error } =
        await supabaseServer
          .from("booth_qr_codes")
          .update({
            card_id: cardId,
            booth_name: boothName,
            location,
            code,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

      if (error) {
        console.error(
          "Update booth QR error:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            message:
              error.code === "23505"
                ? "Code QR sudah digunakan."
                : "Gagal mengubah booth QR.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        qrCode: data,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Tipe data tidak valid.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "Admin collection PATCH error:",
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

/* =========================================================
   DELETE
   ========================================================= */

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

    const type = body.type;
    const id = String(body.id ?? "").trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID wajib diisi.",
        },
        { status: 400 }
      );
    }

    /* -------------------------
       DELETE QR
       ------------------------- */

    if (type === "qr") {
      const { error } =
        await supabaseServer
          .from("booth_qr_codes")
          .delete()
          .eq("id", id);

      if (error) {
        console.error(
          "Delete booth QR error:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Gagal menghapus booth QR.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
      });
    }

    /* -------------------------
       DELETE CARD
       ------------------------- */

    if (type === "card") {
      const { count } =
        await supabaseServer
          .from("booth_qr_codes")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("card_id", id);

      if ((count ?? 0) > 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Card masih digunakan oleh booth QR. Hapus atau pindahkan QR tersebut terlebih dahulu.",
          },
          { status: 400 }
        );
      }

      const { error } =
        await supabaseServer
          .from("collection_cards")
          .delete()
          .eq("id", id);

      if (error) {
        console.error(
          "Delete collection card error:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Gagal menghapus collection card.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Tipe data tidak valid.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "Admin collection DELETE error:",
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