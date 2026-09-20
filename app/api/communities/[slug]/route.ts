import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/participant-session";
import { supabaseServer } from "@/lib/supabase-server";

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { slug } = await params;

    const { data: community, error: communityError } =
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
          created_at,
          updated_at
        `
        )
        .eq("slug", slug)
        .eq("status", "active")
        .single();

    if (communityError || !community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Ambil semua member community
    const { data: memberRows, error: membersError } =
      await supabaseServer
        .from("community_members")
        .select(
          `
          id,
          joined_at,
          participant_id,
          participants (
            id,
            full_name,
            reconnect_id,
            city
          )
        `
        )
        .eq("community_id", community.id)
        .order("joined_at", {
          ascending: false,
        });

    if (membersError) {
      console.error("Community members error:", membersError);

      return NextResponse.json(
        { error: "Failed to load community members" },
        { status: 500 }
      );
    }

    const participant = await getCurrentParticipant();

    const joined = participant
      ? (memberRows ?? []).some(
          (member: any) =>
            member.participant_id === participant.id
        )
      : false;

    const members = (memberRows ?? [])
      .map((member: any) => {
        const participantData = Array.isArray(
          member.participants
        )
          ? member.participants[0]
          : member.participants;

        if (!participantData) {
          return null;
        }

        return {
          id: participantData.id,
          fullName: participantData.full_name,
          reconnectId: participantData.reconnect_id,
          city: participantData.city,
          joinedAt: member.joined_at,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      community: {
        id: community.id,
        name: community.name,
        slug: community.slug,
        description: community.description,
        category: community.category,
        imageUrl: community.image_url,
        instagramUrl: community.instagram_url,
        websiteUrl: community.website_url,
        status: community.status,
        createdAt: community.created_at,
        updatedAt: community.updated_at,
      },

      memberCount: members.length,

      members,

      joined,
    });
  } catch (error) {
    console.error("Community detail API error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}