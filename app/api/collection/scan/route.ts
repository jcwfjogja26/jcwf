import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/participant-session";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    // ============================================
    // 1. CHECK PARTICIPANT LOGIN
    // ============================================

    const participant = await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          message: "Kamu harus login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    // ============================================
    // 2. READ QR CODE
    // ============================================

    const body = await request.json();

    const code =
      typeof body.code === "string"
        ? body.code.trim()
        : "";

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: "QR code tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // 3. FIND BOOTH QR
    // ============================================

    const { data: boothQr, error: boothError } =
      await supabaseServer
        .from("booth_qr_codes")
        .select(
          `
          id,
          code,
          booth_name,
          location,
          status,
          card_id,
          collection_cards (
            id,
            name,
            slug,
            description,
            image_url,
            points,
            status
          )
        `
        )
        .eq("code", code)
        .eq("status", "active")
        .maybeSingle();

    if (boothError) {
      console.error("Find booth QR error:", boothError);

      return NextResponse.json(
        {
          success: false,
          message: "Terjadi kesalahan saat membaca QR.",
        },
        { status: 500 }
      );
    }

    if (!boothQr) {
      return NextResponse.json(
        {
          success: false,
          message: "QR booth tidak dikenali atau sudah tidak aktif.",
        },
        { status: 404 }
      );
    }

    // ============================================
    // 4. VALIDATE COLLECTION CARD
    // ============================================

    const card = Array.isArray(boothQr.collection_cards)
      ? boothQr.collection_cards[0]
      : boothQr.collection_cards;

    if (!card || card.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: "Kartu koleksi ini tidak tersedia.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // 5. CHECK DUPLICATE COLLECTION
    // ============================================

    const { data: existingCollection, error: existingError } =
      await supabaseServer
        .from("participant_collections")
        .select("id, collected_at")
        .eq("participant_id", participant.id)
        .eq("card_id", card.id)
        .maybeSingle();

    if (existingError) {
      console.error(
        "Check existing collection error:",
        existingError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gagal memeriksa koleksi kamu.",
        },
        { status: 500 }
      );
    }

    // ============================================
    // 6. DUPLICATE
    // ============================================

    if (existingCollection) {
      return NextResponse.json(
        {
          success: false,
          alreadyCollected: true,
          message: "Kartu ini sudah kamu punya.",
          card: {
            id: card.id,
            name: card.name,
            slug: card.slug,
            imageUrl: card.image_url,
          },
        },
        { status: 409 }
      );
    }

    // ============================================
    // 7. INSERT COLLECTION
    // ============================================

    const points = Number(card.points) || 0;

    const { data: collection, error: collectionError } =
      await supabaseServer
        .from("participant_collections")
        .insert({
          participant_id: participant.id,
          card_id: card.id,
          booth_qr_id: boothQr.id,
          points_earned: points,
        })
        .select(
          `
          id,
          collected_at,
          points_earned
        `
        )
        .single();

    if (collectionError) {
      // Unique constraint protection:
      // Kalau dua request masuk hampir bersamaan,
      // request kedua tetap dianggap duplicate.

      if (collectionError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            alreadyCollected: true,
            message: "Kartu ini sudah kamu punya.",
          },
          { status: 409 }
        );
      }

      console.error(
        "Insert collection error:",
        collectionError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gagal menyimpan kartu koleksi.",
        },
        { status: 500 }
      );
    }

    // ============================================
    // 8. ADD POINTS TRANSACTION
    // ============================================

    if (points > 0) {
      const { error: pointsError } =
        await supabaseServer
          .from("points_transactions")
          .insert({
            participant_id: participant.id,
            points,
            type: "collection",
            description: `Collected ${card.name} card`,
            reference_id: collection.id,
          });

      if (pointsError) {
        console.error(
          "Insert points transaction error:",
          pointsError
        );

        // Rollback collection jika points gagal
        await supabaseServer
          .from("participant_collections")
          .delete()
          .eq("id", collection.id);

        return NextResponse.json(
          {
            success: false,
            message: "Gagal menambahkan poin.",
          },
          { status: 500 }
        );
      }
    }

    // ============================================
    // 9. SUCCESS RESPONSE
    // ============================================

    return NextResponse.json({
      success: true,
      alreadyCollected: false,

      message: `Selamat! Kamu mendapatkan kartu ${card.name} +${points} points.`,

      card: {
        id: card.id,
        name: card.name,
        slug: card.slug,
        description: card.description,
        imageUrl: card.image_url,
        points,
      },

      booth: {
        id: boothQr.id,
        name: boothQr.booth_name,
        location: boothQr.location,
      },

      collection: {
        id: collection.id,
        collectedAt: collection.collected_at,
      },

      pointsEarned: points,
    });
  } catch (error) {
    console.error("Collection scan error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}