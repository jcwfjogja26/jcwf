import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-admin-auth";
import { supabaseServer } from "@/lib/supabase-server";

async function getAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: admin, error: adminError } =
    await supabaseServer
      .from("admin_users")
      .select("id, full_name, email, role, is_active")
      .eq("id", user.id)
      .maybeSingle();

  if (
    adminError ||
    !admin ||
    !admin.is_active
  ) {
    return null;
  }

  return admin;
}

export async function GET(request: Request) {
  try {
    // ============================================
    // 1. CHECK ADMIN LOGIN
    // ============================================

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

    // ============================================
    // 2. READ QUERY
    // ============================================

    const { searchParams } = new URL(request.url);

    const search =
      searchParams.get("search")?.trim() || "";

    const cardId =
      searchParams.get("cardId")?.trim() || "";

    const boothId =
      searchParams.get("boothId")?.trim() || "";

    // ============================================
    // 3. GET COLLECTION HISTORY
    // ============================================

    let query = supabaseServer
      .from("participant_collections")
      .select(
        `
        id,
        points_earned,
        collected_at,

        participants (
          id,
          reconnect_id,
          full_name,
          email
        ),

        collection_cards (
          id,
          name,
          slug,
          image_url
        ),

        booth_qr_codes (
          id,
          code,
          booth_name,
          location
        )
        `
      )
      .order("collected_at", {
        ascending: false,
      });

    // ============================================
    // 4. FILTER CARD
    // ============================================

    if (cardId) {
      query = query.eq("card_id", cardId);
    }

    // ============================================
    // 5. FILTER BOOTH
    // ============================================

    if (boothId) {
      query = query.eq("booth_qr_id", boothId);
    }

    const {
      data: collections,
      error: collectionError,
    } = await query;

    if (collectionError) {
      console.error(
        "Get collection history error:",
        collectionError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Gagal mengambil collection history.",
        },
        { status: 500 }
      );
    }

    // ============================================
    // 6. FORMAT DATA
    // ============================================

    const formattedCollections =
      (collections ?? [])
        .map((item: any) => {
          const participant =
            Array.isArray(item.participants)
              ? item.participants[0]
              : item.participants;

          const card =
            Array.isArray(item.collection_cards)
              ? item.collection_cards[0]
              : item.collection_cards;

          const booth =
            Array.isArray(item.booth_qr_codes)
              ? item.booth_qr_codes[0]
              : item.booth_qr_codes;

          return {
            id: item.id,

            participant: participant
              ? {
                  id: participant.id,
                  reconnectId:
                    participant.reconnect_id,
                  fullName:
                    participant.full_name,
                  email:
                    participant.email,
                }
              : null,

            card: card
              ? {
                  id: card.id,
                  name: card.name,
                  slug: card.slug,
                  imageUrl: card.image_url,
                }
              : null,

            booth: booth
              ? {
                  id: booth.id,
                  code: booth.code,
                  name: booth.booth_name,
                  location: booth.location,
                }
              : null,

            pointsEarned:
              Number(item.points_earned) || 0,

            collectedAt: item.collected_at,
          };
        })
        .filter((item) => {
          // ========================================
          // SEARCH PARTICIPANT
          // ========================================

          if (!search) {
            return true;
          }

          const searchLower =
            search.toLowerCase();

          const fullName =
            item.participant?.fullName
              ?.toLowerCase() || "";

          const reconnectId =
            item.participant?.reconnectId
              ?.toLowerCase() || "";

          const email =
            item.participant?.email
              ?.toLowerCase() || "";

          const cardName =
            item.card?.name
              ?.toLowerCase() || "";

          const boothName =
            item.booth?.name
              ?.toLowerCase() || "";

          return (
            fullName.includes(searchLower) ||
            reconnectId.includes(searchLower) ||
            email.includes(searchLower) ||
            cardName.includes(searchLower) ||
            boothName.includes(searchLower)
          );
        });

    // ============================================
    // 7. SUMMARY
    // ============================================

    const totalCollections =
      formattedCollections.length;

    const totalPoints =
      formattedCollections.reduce(
        (sum, item) =>
          sum + item.pointsEarned,
        0
      );

    const uniqueParticipants =
      new Set(
        formattedCollections
          .map(
            (item) =>
              item.participant?.id
          )
          .filter(Boolean)
      ).size;

    const uniqueCards =
      new Set(
        formattedCollections
          .map(
            (item) =>
              item.card?.id
          )
          .filter(Boolean)
      ).size;

    return NextResponse.json({
      success: true,

      summary: {
        totalCollections,
        totalPoints,
        uniqueParticipants,
        uniqueCards,
      },

      collections:
        formattedCollections,
    });
  } catch (error) {
    console.error(
      "Admin collection history error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}