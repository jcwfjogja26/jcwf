import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data: communities, error } = await supabaseServer
      .from("communities")
      .select(`
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
      `)
      .eq("status", "active")
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error("Communities fetch error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load communities.",
        },
        {
          status: 500,
        }
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
          "Community members count error:",
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
      id: community.id,
      name: community.name,
      slug: community.slug,
      description: community.description,
      category: community.category,
      imageUrl: community.image_url,
      instagramUrl: community.instagram_url,
      websiteUrl: community.website_url,
      memberCount: memberCounts[community.id] ?? 0,
      createdAt: community.created_at,
    }));

    return NextResponse.json({
      success: true,
      communities: result,
    });
  } catch (error) {
    console.error("Communities unexpected error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}