import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/participant-session";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
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
    // 2. GET ALL ACTIVE COLLECTION CARDS
    // ============================================

    const { data: cards, error: cardsError } =
      await supabaseServer
        .from("collection_cards")
        .select(
          `
          id,
          name,
          slug,
          description,
          image_url,
          points,
          sort_order
        `
        )
        .eq("status", "active")
        .order("sort_order", { ascending: true });

    if (cardsError) {
      console.error(
        "Get collection cards error:",
        cardsError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengambil data collection.",
        },
        { status: 500 }
      );
    }

    // ============================================
    // 3. GET PARTICIPANT'S COLLECTION
    // ============================================

    const { data: collected, error: collectedError } =
      await supabaseServer
        .from("participant_collections")
        .select(
          `
          id,
          card_id,
          points_earned,
          collected_at,
          booth_qr_id
        `
        )
        .eq("participant_id", participant.id);

    if (collectedError) {
      console.error(
        "Get participant collection error:",
        collectedError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengambil koleksi kamu.",
        },
        { status: 500 }
      );
    }

    // ============================================
    // 4. CREATE QUICK LOOKUP
    // ============================================

    const collectedMap = new Map(
      (collected ?? []).map((item) => [
        item.card_id,
        item,
      ])
    );

    // ============================================
    // 5. MERGE ALL CARDS + USER COLLECTION
    // ============================================

    const collection = (cards ?? []).map((card) => {
      const owned = collectedMap.get(card.id);

      return {
        id: card.id,
        name: card.name,
        slug: card.slug,
        description: card.description,
        imageUrl: card.image_url,
        points: card.points,

        collected: Boolean(owned),

        collectedAt: owned?.collected_at ?? null,

        collectionId: owned?.id ?? null,

        pointsEarned: owned?.points_earned ?? 0,
      };
    });

    // ============================================
    // 6. PROGRESS
    // ============================================

    const totalCards = collection.length;

    const collectedCards = collection.filter(
      (card) => card.collected
    ).length;

    const progressPercentage =
      totalCards > 0
        ? Math.round(
            (collectedCards / totalCards) * 100
          )
        : 0;

    // ============================================
    // 7. RESPONSE
    // ============================================

    return NextResponse.json({
      success: true,

      progress: {
        collected: collectedCards,
        total: totalCards,
        percentage: progressPercentage,
      },

      cards: collection,
    });
  } catch (error) {
    console.error(
      "My Collection API error:",
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