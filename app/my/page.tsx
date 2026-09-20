import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentParticipant } from "@/lib/participant-session";
import { supabaseServer } from "@/lib/supabase-server";
import PassportQRCode from "@/components/home/PassportQRCode";
import DailyTicketSection from "@/components/home/DailyTicketSection";
import MyStoryCard from "@/components/my/MyStoryCard";
import MyCollectionCard from "@/components/my/MyCollectionCard";
import MyRewardsSection from "@/components/my/MyRewardsSection";

const pillars = {
  SELF: {
    label: "SELF",
    description: "Wellness & personal growth",
    className: "bg-sage text-forest",
  },
  OTHERS: {
    label: "OTHERS",
    description: "Connection & community",
    className: "bg-forest text-ivory",
  },
  NATURE: {
    label: "NATURE",
    description: "Nature & mindful living",
    className: "bg-[#E9E5D6] text-forest",
  },
  CULTURE: {
    label: "CULTURE",
    description: "Heritage & Jogja stories",
    className: "bg-[#EAD6C8] text-forest",
  },
} as const;

type PlanItem = {
  id: string;
  booking_code: string | null;
  quantity: number;
  total_amount: number;
  payment_status: string;
  status: string;
  registered_at: string;
  activity:
    | {
        id: string;
        title: string;
        slug: string;
        description: string | null;
        category: string;
        event_date: string;
        start_time: string;
        end_time: string;
        location: string;
        price: number;
        capacity: number | null;
        image_url: string | null;
        status: string;
      }
    | null;
};

type GalleryPost = {
  id: string;
  image_path: string | null;
  image_url: string | null;
  caption: string | null;
  created_at: string;
};

type MyCommunity = {
  id: string;
  joined_at: string;
  community:
    | {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        category: string;
        image_url: string | null;
        instagram_url: string | null;
        website_url: string | null;
        status: string;
      }
    | null;
};

type CheckIn = {
  id: string;
  check_in_date: string;
  checked_in_at: string;
};

type JourneyItem = {
  id: string;
  type:
    | "joined"
    | "community"
    | "activity"
    | "checkin"
    | "gallery";
  title: string;
  description: string;
  date: Date;
  points?: number;
};

const communityFallbackImages: Record<string, string> = {
  "Mind & Body": "/images/activity-wellness.jpg",
  "Healing & Therapy": "/images/activity-wellness.jpg",
  "Nature Connection": "/images/activity-culture.jpg",
  "Creative Experience": "/images/activity-community.jpg",
  "Culinary Wellness": "/images/activity-culinary.jpg",
};

function formatPlanDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  })
    .format(date)
    .toUpperCase();
}

function formatPlanTime(time: string) {
  return time.slice(0, 5).replace(":", ".");
}

function formatJourneyDate(date: Date | string) {
  const parsedDate =
    date instanceof Date ? date : new Date(date);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  })
    .format(parsedDate)
    .toUpperCase();
}

function getCheckInDay(date: string) {
  const days: Record<string, string> = {
    "2026-11-06": "Day 1",
    "2026-11-07": "Day 2",
    "2026-11-08": "Day 3",
  };

  return days[date] ?? "Festival Day";
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-forest/8 pb-4 last:border-0 last:pb-0">
      <span className="text-xs text-forest/40">{label}</span>

      <span className="max-w-[65%] break-words text-right text-sm font-medium text-forest">
        {value || "-"}
      </span>
    </div>
  );
}

function DashboardCard({
  eyebrow,
  title,
  description,
  className = "",
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-[2rem] bg-white p-7 shadow-[0_18px_50px_rgba(23,56,42,0.06)] sm:p-8 lg:p-10 ${className}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        {eyebrow}
      </p>

      <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] text-forest">
        {title}
      </h2>

      <p className="mt-3 max-w-md text-sm leading-6 text-forest/50">
        {description}
      </p>

      {children}
    </div>
  );
}

export default async function MyPage() {
  const participant = await getCurrentParticipant();

  if (!participant) {
    redirect("/login");
  }

  const pillar =
    pillars[
      participant.interest_category as keyof typeof pillars
    ] ?? pillars.CULTURE;

 /* =========================================================
   MY PLAN
========================================================= */

const {
  data: registrations,
  error: planError,
} = await supabaseServer
  .from("activity_registrations")
  .select(
    `
    id,
    booking_code,
    quantity,
    total_amount,
    payment_status,
    status,
    registered_at,
    activity:activities (
      id,
      title,
      slug,
      description,
      category,
      event_date,
      start_time,
      end_time,
      location,
      price,
      capacity,
      image_url,
      status
    )
    `
  )
  .eq("participant_id", participant.id)
  .in("payment_status", ["paid", "pending"])
  .neq("status", "cancelled")
  .order("registered_at", {
    ascending: false,
  });

if (planError) {
  console.error("GET MY PLAN PAGE ERROR:", planError);
}

const plan: PlanItem[] =
  (registrations ?? []) as unknown as PlanItem[];

  /* =========================================================
     MY GALLERY
  ========================================================= */

  const {
    data: galleryPosts,
    error: galleryError,
  } = await supabaseServer
    .from("gallery_posts")
    .select(
      `
      id,
      image_path,
      image_url,
      caption,
      created_at
      `
    )
    .eq("participant_id", participant.id)
    .eq("status", "visible")
    .order("created_at", {
      ascending: false,
    })
    .limit(6);

  if (galleryError) {
    console.error("GET MY GALLERY ERROR:", galleryError);
  }

  const myGallery: GalleryPost[] =
    (galleryPosts ?? []).map((post) => ({
      id: post.id,
      image_path: post.image_path,
      image_url: post.image_path
        ? supabaseServer.storage
            .from("gallery")
            .getPublicUrl(post.image_path).data.publicUrl
        : post.image_url,
      caption: post.caption,
      created_at: post.created_at,
    }));

  /* =========================================================
     MY POINTS
  ========================================================= */

  const {
    data: pointTransactions,
    error: pointsError,
  } = await supabaseServer
    .from("points_transactions")
    .select("points")
    .eq("participant_id", participant.id);

  if (pointsError) {
    console.error("GET MY POINTS ERROR:", pointsError);
  }

  const totalPoints =
    (pointTransactions ?? []).reduce(
      (total, transaction) =>
        total + (transaction.points ?? 0),
      0
    );

      /* =========================================================
     MY REWARD REDEMPTIONS
  ========================================================= */

  const {
    data: rewardRedemptions,
    error: rewardRedemptionsError,
  } = await supabaseServer
    .from("reward_redemptions")
    .select(
      `
      id,
      redemption_code,
      points_spent,
      status,
      redeemed_at,
      claimed_at,
      rewards (
        id,
        name,
        image_url
      )
      `
    )
    .eq("participant_id", participant.id)
    .order("redeemed_at", {
      ascending: false,
    });

  if (rewardRedemptionsError) {
    console.error(
      "GET MY REWARD REDEMPTIONS ERROR:",
      rewardRedemptionsError
    );
  }

  const myRewardRedemptions =
    (rewardRedemptions ?? []) as unknown as Array<{
      id: string;
      redemption_code: string;
      points_spent: number;
      status: "pending" | "claimed" | "cancelled";
      redeemed_at: string;
      claimed_at: string | null;
      rewards:
        | {
            id: string;
            name: string;
            image_url: string | null;
          }
        | null;
    }>;

  /* =========================================================
     MY COMMUNITIES
  ========================================================= */

  const {
    data: communityMemberships,
    error: communitiesError,
  } = await supabaseServer
    .from("community_members")
    .select(
      `
      id,
      joined_at,
      community:communities (
        id,
        name,
        slug,
        description,
        category,
        image_url,
        instagram_url,
        website_url,
        status
      )
      `
    )
    .eq("participant_id", participant.id)
    .order("joined_at", {
      ascending: false,
    });

  if (communitiesError) {
    console.error(
      "GET MY COMMUNITIES ERROR:",
      communitiesError
    );
  }

  const myCommunities: MyCommunity[] =
    (communityMemberships ?? []) as unknown as MyCommunity[];

  /* =========================================================
     COMMUNITY MEMBER COUNTS
  ========================================================= */

  const communityIds = myCommunities
    .map((item) => item.community?.id)
    .filter(Boolean) as string[];

  let communityMemberCounts: Record<string, number> = {};

  if (communityIds.length > 0) {
    const {
      data: memberRows,
      error: memberCountError,
    } = await supabaseServer
      .from("community_members")
      .select("community_id")
      .in("community_id", communityIds);

    if (memberCountError) {
      console.error(
        "GET COMMUNITY MEMBER COUNTS ERROR:",
        memberCountError
      );
    } else {
      communityMemberCounts =
        (memberRows ?? []).reduce(
          (counts, row) => {
            counts[row.community_id] =
              (counts[row.community_id] ?? 0) + 1;

            return counts;
          },
          {} as Record<string, number>
        );
    }
  }

  /* =========================================================
     MY CHECK-INS
  ========================================================= */

  const {
    data: checkInRows,
    error: checkInsError,
  } = await supabaseServer
    .from("check_ins")
    .select(
      `
      id,
      check_in_date,
      checked_in_at
      `
    )
    .eq("participant_id", participant.id)
    .order("check_in_date", {
      ascending: true,
    });

  if (checkInsError) {
    console.error("GET MY CHECK-INS ERROR:", checkInsError);
  }

  const checkIns: CheckIn[] =
    (checkInRows ?? []) as CheckIn[];

  /* =========================================================
     MY JOURNEY
  ========================================================= */

  const journeyItems: JourneyItem[] = [
    {
      id: "joined-jcwf",
      type: "joined",
      title: "Joined JCWF",
      description: "Account created",
      date: new Date(participant.created_at),
    } as JourneyItem,

    /* COMMUNITIES */
    ...myCommunities
      .filter((item) => item.community)
      .map(
        (item): JourneyItem => ({
          id: `community-${item.id}`,
          type: "community",
          title: "Joined a Community",
          description: item.community!.name,
          date: new Date(item.joined_at),
        })
      ),

    /* ACTIVITIES */
    ...plan
      .filter((item) => item.activity)
      .map(
        (item): JourneyItem => ({
          id: `activity-${item.id}`,
          type: "activity",
          title: "Booked an Activity",
          description: item.activity!.title,
          date: new Date(item.registered_at),
        })
      ),

    /* CHECK-INS */
    ...checkIns.map(
      (item): JourneyItem => ({
        id: `checkin-${item.id}`,
        type: "checkin",
        title: `Checked In · ${getCheckInDay(
          item.check_in_date
        )}`,
        description: "Loman Park Hotel · JCWF 2026",
        date: new Date(item.checked_in_at),
      })
    ),

    /* GALLERY */
    ...myGallery.map(
      (item): JourneyItem => ({
        id: `gallery-${item.id}`,
        type: "gallery",
        title: "Shared a Moment",
        description: "Uploaded a photo to JCWF Gallery",
        date: new Date(item.created_at),
        points: 10,
      })
    ),
  ].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  ) as JourneyItem[];

  return (
    <main className="min-h-screen bg-ivory text-forest">
      {/* =====================================================
          NAVBAR
      ====================================================== */}
      <header className="sticky top-0 z-50 border-b border-forest/5 bg-ivory/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 md:px-10 lg:px-14">
          <Link
            href="/"
            className="font-display text-[28px] font-semibold tracking-[-0.04em] text-forest"
          >
            JCWF
            <span className="text-gold">.</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm text-forest/55 transition hover:text-forest"
            >
              Explore
            </Link>

            <Link
              href="/#activities"
              className="text-sm text-forest/55 transition hover:text-forest"
            >
              Activities
            </Link>

            <Link
              href="/#marketplace"
              className="text-sm text-forest/55 transition hover:text-forest"
            >
              Marketplace
            </Link>

            <Link
                href="/connections"
                className="text-sm text-forest/55 transition hover:text-forest"
            >
                My Connections
            </Link>

          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-forest">
                {participant.full_name}
              </p>

              <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-forest/40">
                {participant.reconnect_id}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-sm font-semibold text-ivory">
              {participant.full_name
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-10 md:py-12 lg:px-14">
        {/* ===================================================
            WELCOME
        ==================================================== */}
        <section>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                My JCWF
              </p>

              <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] tracking-[-0.04em] text-forest sm:text-5xl md:text-6xl">
                Welcome,{" "}
                <span className="italic">
                  {participant.full_name.split(" ")[0]}.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-forest/55 md:text-base">
                Your personal space for exploring,
                collecting, and experiencing JCWF 2026.
              </p>
            </div>

            <Link
              href="/#activities"
              className="inline-flex w-fit items-center gap-3 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-ivory transition hover:-translate-y-0.5 hover:bg-gold hover:text-forest"
            >
              Explore JCWF
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* ===================================================
            DIGITAL PASSPORT + PROFILE
        ==================================================== */}
        <section className="mt-10 grid gap-5 lg:grid-cols-12">
          {/* PASSPORT CARD */}
          <div className="relative overflow-hidden rounded-[2rem] bg-forest p-7 text-ivory sm:p-8 lg:col-span-7 lg:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-gold/20" />

            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-gold/10" />

            <div className="relative z-10 flex flex-col justify-between gap-10 md:min-h-[360px]">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                    Your Digital Passport
                  </p>

                  <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] sm:text-4xl">
                    Reconnect ID
                  </h2>

                  <p className="mt-3 max-w-md text-sm leading-6 text-ivory/55">
                    Your unique identity throughout
                    your JCWF journey.
                  </p>
                </div>

                <span className="rounded-full bg-ivory/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory/70">
                  2026
                </span>
              </div>

              <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ivory/40">
                    Reconnect ID
                  </p>

                  <p className="mt-2 font-display text-3xl tracking-[0.04em] text-gold">
                    {participant.reconnect_id}
                  </p>

                  <div className="mt-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${pillar.className}`}
                    >
                      {pillar.label}
                    </span>

                    <p className="mt-2 text-xs text-ivory/45">
                      {pillar.description}
                    </p>
                  </div>
                </div>

                <PassportQRCode
                  value={participant.reconnect_id}
                />
              </div>
            </div>
          </div>

          {/* PROFILE */}
          <div className="rounded-[2rem] bg-white p-7 shadow-[0_18px_50px_rgba(23,56,42,0.06)] sm:p-8 lg:col-span-5 lg:p-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                  Your Profile
                </p>

                <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] text-forest">
                  {participant.full_name}
                </h2>
              </div>

              <button
                type="button"
                className="rounded-full bg-forest/5 px-4 py-2 text-xs font-semibold text-forest transition hover:bg-forest/10"
              >
                Edit
              </button>
            </div>

            <div className="mt-8 space-y-5">
              <ProfileRow
                label="Email"
                value={participant.email}
              />

              <ProfileRow
                label="WhatsApp"
                value={participant.whatsapp}
              />

              <ProfileRow
                label="City"
                value={participant.city}
              />

              <ProfileRow
                label="Primary Interest"
                value={pillar.label}
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            DAILY TICKET ACCESS
        ==================================================== */}
        <DailyTicketSection />

        {/* ===================================================
            MY COMMUNITIES
        ==================================================== */}
        <section className="mt-8">
          <div className="rounded-[24px] border border-forest/8 bg-white p-5 shadow-[0_12px_35px_rgba(23,56,42,0.04)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                  My Communities
                </p>

                <h2 className="mt-1 font-display text-xl tracking-[-0.03em] text-forest">
                  Communities you joined
                </h2>
              </div>

              <Link
                href="/communities"
                className="text-xs font-semibold text-forest/50 transition hover:text-forest"
              >
                View →
              </Link>
            </div>

            {myCommunities.length > 0 ? (
              <div className="space-y-3">
                {myCommunities
                  .filter(
                    (membership) =>
                      membership.community
                  )
                  .slice(0, 3)
                  .map((membership) => {
                    const community =
                      membership.community!;

                    const memberCount =
                      communityMemberCounts[
                        community.id
                      ] ?? 0;

                    const image =
                      community.image_url ||
                      communityFallbackImages[
                        community.category
                      ] ||
                      "/images/activity-community.jpg";

                    return (
                      <Link
                        key={membership.id}
                        href={`/communities/${community.slug}`}
                        className="group flex items-center gap-4 rounded-[18px] border border-forest/8 p-3 transition hover:border-forest/15 hover:bg-ivory/60"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[14px] bg-ivory">
                          <img
                            src={image}
                            alt={community.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-forest">
                            {community.name}
                          </h3>

                          <p className="mt-1 truncate text-xs text-forest/45">
                            {community.category} ·{" "}
                            {memberCount}{" "}
                            {memberCount === 1
                              ? "member"
                              : "members"}
                          </p>
                        </div>

                        <span className="shrink-0 text-lg text-forest/25 transition group-hover:translate-x-1 group-hover:text-forest">
                          →
                        </span>
                      </Link>
                    );
                  })}

                {myCommunities.length > 3 && (
                  <Link
                    href="/communities"
                    className="block pt-1 text-center text-xs font-semibold text-forest/45 transition hover:text-forest"
                  >
                    View all {myCommunities.length}{" "}
                    communities →
                  </Link>
                )}
              </div>
            ) : (
              <div className="rounded-[18px] border border-dashed border-forest/10 bg-ivory/40 px-5 py-7 text-center">
                <p className="text-sm text-forest/50">
                  You haven&apos;t joined any
                  communities yet.
                </p>

                <Link
                  href="/communities"
                  className="mt-3 inline-flex text-xs font-semibold text-forest underline underline-offset-4"
                >
                  Explore communities
                </Link>
              </div>
            )}
          </div>
        </section>

                {/* ===================================================
            DASHBOARD CARDS
        ==================================================== */}
        <section className="mt-5 grid gap-5 lg:grid-cols-12">
         {/* =================================================
    MY PLAN
================================================= */}
<div className="rounded-[2rem] bg-white p-7 shadow-[0_18px_50px_rgba(23,56,42,0.06)] sm:p-8 lg:col-span-4">
  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        My Plan
      </p>

      <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] text-forest">
        Your schedule
      </h2>
    </div>

    {plan.length > 0 && (
      <div className="flex h-9 min-w-9 items-center justify-center rounded-full bg-forest/5 px-2.5 text-[10px] font-semibold text-forest">
        {plan.length}
      </div>
    )}
  </div>

  <p className="mt-3 max-w-md text-sm leading-6 text-forest/50">
    Your booked activities for JCWF 2026, all in one place.
  </p>

  {plan.length === 0 ? (
    <div className="mt-7 rounded-2xl bg-ivory p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest text-lg text-ivory">
          +
        </div>

        <div>
          <p className="text-sm font-semibold text-forest">
            Plan your festival
          </p>

          <p className="mt-1 text-xs leading-5 text-forest/45">
            Choose activities and build your JCWF experience.
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="mt-7 space-y-3">
      {plan.slice(0, 3).map((item) => {
        if (!item.activity) return null;

        const isPending = item.payment_status === "pending";

        return (
          <Link
            key={item.id}
            href={`/activities/${item.activity.slug}/success?booking=${item.id}`}
            className="group block rounded-2xl bg-ivory p-4 transition hover:-translate-y-0.5 hover:bg-sage/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">
                  {item.activity.category}
                </p>

                <p className="mt-1 text-sm font-semibold text-forest">
                  {item.activity.title}
                </p>

                <p className="mt-1 text-xs text-forest/45">
                  {formatPlanDate(item.activity.event_date)} ·{" "}
                  {formatPlanTime(item.activity.start_time)} —{" "}
                  {formatPlanTime(item.activity.end_time)}
                </p>

                <p className="mt-1 truncate text-xs text-forest/40">
                  {item.activity.location}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${
                  isPending
                    ? "bg-gold/15 text-gold"
                    : "bg-forest text-ivory"
                }`}
              >
                {isPending ? "Pending" : "Paid"}
              </span>
            </div>

            {isPending && (
              <div className="mt-3 border-t border-forest/5 pt-3">
                <p className="text-[10px] font-medium text-gold">
                  Complete your payment →
                </p>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  )}

  <Link
  href="/activities"
  className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-forest transition hover:text-gold"
>
  Explore activities
  <span>→</span>
</Link>

  {plan.length > 3 && (
    <p className="mt-3 text-[11px] text-forest/35">
      +{plan.length - 3} more activities in your plan
    </p>
  )}
</div>

          {/* =================================================
              POINTS
          ================================================= */}
          <DashboardCard
            className="lg:col-span-4"
            eyebrow="My Points"
            title={`${totalPoints} points`}
            description="Collect points by participating in JCWF activities."
          >
            <div className="mt-7">
              <div className="h-2 overflow-hidden rounded-full bg-forest/8">
                <div
                  className="h-full rounded-full bg-gold transition-all"
                  style={{
                    width: `${Math.min(totalPoints, 100)}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex justify-between text-[11px] text-forest/40">
                <span>
                  {totalPoints === 0
                    ? "Start your journey"
                    : "Keep collecting points"}
                </span>

                <span>{totalPoints} pts</span>
              </div>
            </div>
          </DashboardCard>

          {/* =================================================
              MY COLLECTION
          ================================================= */}
          <div className="lg:col-span-4">
            <MyCollectionCard />
          </div>

          {/* =================================================
    MY CONNECTIONS
================================================= */}
<div className="lg:col-span-4">
  <div className="relative h-full min-h-[360px] overflow-hidden rounded-[2rem] bg-[#E9E5D6] p-7 shadow-[0_18px_50px_rgba(23,56,42,0.06)] sm:p-8">
    <div className="flex h-full flex-col">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
          My Connections
        </p>

        <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] text-forest">
          Meet your people.
        </h2>

        <p className="mt-3 max-w-md text-sm leading-6 text-forest/50">
          Connect with people you meet throughout your JCWF journey.
        </p>
      </div>

      <div className="mt-8 flex-1">
        <div className="rounded-2xl bg-white/70 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest text-xl text-ivory">
              ◎
            </div>

            <div>
              <p className="text-sm font-semibold text-forest">
                Connect by Reconnect ID
              </p>

              <p className="mt-1 text-xs leading-5 text-forest/45">
                Scan another participant&apos;s Reconnect ID to connect.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        

        <Link
          href="/connections"
          className="inline-flex items-center gap-3 rounded-full border border-forest/10 bg-white/60 px-5 py-3 text-xs font-semibold text-forest transition hover:bg-white"
        >
          My Connections
          <span>→</span>
        </Link>
      </div>
    </div>
  </div>
</div>

          {/* =================================================
    REWARDS
================================================= */}
<div className="lg:col-span-4">
  <div className="relative h-full min-h-[360px] overflow-hidden rounded-[2rem] bg-forest p-7 text-ivory shadow-[0_18px_50px_rgba(23,56,42,0.06)] sm:p-8">
    {/* Decorative glow */}
    <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

    <div className="relative flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
            Rewards
          </p>

          <h2 className="mt-4 font-display text-[2rem] leading-[1.05] tracking-[-0.04em] sm:text-[2.15rem]">
            Make your
            <br />
            points count.
          </h2>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-xl">
          🎁
        </div>
      </div>

      {/* Description */}
      <p className="mt-5 max-w-[270px] text-sm leading-6 text-ivory/50">
        Exchange your JCWF points for exclusive festival rewards.
      </p>

      {/* Available points */}
      <div className="mt-6 border-t border-ivory/10 pt-5">
        <p className="text-[9px] uppercase tracking-[0.18em] text-ivory/35">
          Available points
        </p>

        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-display text-4xl leading-none text-gold">
            {totalPoints}
          </span>

          <span className="text-[10px] uppercase tracking-[0.12em] text-ivory/35">
            pts
          </span>
        </div>
      </div>

      {/* Recent redemption history */}
      <div className="mt-6 flex-1">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ivory/35">
            Recent rewards
          </p>

          <Link
            href="/rewards"
            className="text-[10px] font-semibold text-gold transition hover:text-gold/80"
          >
            View all →
          </Link>
        </div>

        {myRewardRedemptions.length === 0 ? (
          <div className="rounded-2xl border border-ivory/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-lg">
                🎁
              </div>

              <div>
                <p className="text-xs font-semibold text-ivory/80">
                  No rewards redeemed yet
                </p>

                <p className="mt-1 text-[10px] leading-4 text-ivory/35">
                  Collect points and exchange them for rewards.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {myRewardRedemptions.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-ivory/10 bg-white/5 p-3 transition hover:bg-white/[0.08]"
              >
                <div className="flex items-center gap-3">
                  {/* Reward image */}
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-ivory/10">
                    {item.rewards?.image_url ? (
                      <img
                        src={item.rewards.image_url}
                        alt={item.rewards.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg">
                        🎁
                      </div>
                    )}
                  </div>

                  {/* Reward info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-ivory/90">
                      {item.rewards?.name ?? "JCWF Reward"}
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] ${
                          item.status === "pending"
                            ? "bg-gold/15 text-gold"
                            : item.status === "claimed"
                              ? "bg-white/10 text-ivory/65"
                              : "bg-red-400/10 text-red-300"
                        }`}
                      >
                        {item.status === "pending"
                          ? "Pending"
                          : item.status === "claimed"
                            ? "Claimed"
                            : "Cancelled"}
                      </span>

                      <span className="truncate text-[9px] text-ivory/30">
                        {formatJourneyDate(item.redeemed_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="mt-6 flex items-center justify-between border-t border-ivory/10 pt-5">
        <Link
          href="/rewards"
          className="group inline-flex items-center gap-2 text-xs font-semibold text-gold transition"
        >
          Explore Rewards
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>

        {myRewardRedemptions.length > 2 && (
          <span className="text-[9px] text-ivory/30">
            +{myRewardRedemptions.length - 2} more
          </span>
        )}
      </div>
    </div>
  </div>
</div>

{/* =================================================
    MY STORY
================================================= */}
<div className="lg:col-span-4">
  <MyStoryCard />
</div>


          {/* =================================================
              MOMENTS
          ================================================= */}
          <div className="overflow-hidden rounded-[2rem] bg-[#E9E5D6] p-7 sm:p-8 lg:col-span-7 lg:p-10">
            <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                  My Moments
                </p>

                <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] text-forest sm:text-4xl">
                  Capture the experience.
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-forest/50">
                  Upload your moments from JCWF and
                  become part of the festival story.
                </p>
              </div>

              <Link
                href="/my/gallery"
                className="inline-flex w-fit items-center gap-3 rounded-full bg-forest px-5 py-3 text-xs font-semibold text-ivory transition hover:bg-gold hover:text-forest"
              >
                My Gallery →
              </Link>
            </div>

            {myGallery.length > 0 ? (
              <div className="mt-8 grid grid-cols-3 gap-3">
                {myGallery.slice(0, 3).map((post) => (
                  <Link
                    key={post.id}
                    href="/my/gallery"
                    className="group relative aspect-[1.2] overflow-hidden rounded-2xl bg-sage"
                  >
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={
                          post.caption ||
                          "My JCWF moment"
                        }
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-forest/30">
                        No image
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/75 to-transparent p-3 pt-8">
                      {post.caption && (
                        <p className="line-clamp-2 text-[10px] leading-4 text-white">
                          {post.caption}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="aspect-[1.2] rounded-2xl bg-forest/8" />
                <div className="aspect-[1.2] rounded-2xl bg-gold/20" />
                <div className="aspect-[1.2] rounded-2xl bg-forest/8" />
              </div>
            )}
          </div>

          {/* =================================================
              MY JOURNEY
          ================================================= */}
          <div
            id="my-journey"
            className="rounded-[2rem] bg-white p-7 shadow-[0_18px_50px_rgba(23,56,42,0.06)] sm:p-8 lg:col-span-5 lg:p-10"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              My Journey
            </p>

            <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] text-forest">
              Your JCWF story.
            </h2>

            <p className="mt-4 text-sm leading-6 text-forest/50">
              Every experience becomes part of your
              personal festival journey.
            </p>

            <div className="mt-8">
              {journeyItems.length > 0 ? (
                <div className="relative">
                  <div className="absolute bottom-4 left-[15px] top-4 w-px bg-forest/10" />

                  <div className="space-y-6">
                    {journeyItems.map((item) => (
                      <div
                        key={item.id}
                        className="relative flex gap-4"
                      >
                        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest text-[11px] font-semibold text-ivory shadow-sm">
                          ✓
                        </div>

                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-forest">
                                {item.title}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-forest/45">
                                {item.description}
                              </p>

                              {item.points && (
                                <span className="mt-2 inline-flex rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-semibold text-gold">
                                  +{item.points} points
                                </span>
                              )}
                            </div>

                            <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.06em] text-forest/30">
                              {formatJourneyDate(item.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-ivory px-5 py-7 text-center">
                  <p className="text-sm text-forest/50">
                    Your journey will appear here as
                    you experience JCWF.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===================================================
            BOTTOM CTA
        ==================================================== */}
        <section className="mt-5 overflow-hidden rounded-[2rem] bg-forest p-7 text-ivory sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                6—8 November 2026
              </p>

              <h2 className="mt-3 max-w-2xl font-display text-3xl tracking-[-0.03em] sm:text-4xl">
                Reconnect with people,
                culture & wellbeing.
              </h2>
            </div>

            <Link
              href="/#activities"
              className="inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition hover:bg-ivory"
            >
              Explore the festival
              <span>→</span>
            </Link>
          </div>
        </section>
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="mx-auto max-w-[1440px] px-6 pb-10 pt-8 md:px-10 lg:px-14">
        <div className="flex flex-col justify-between gap-3 border-t border-forest/8 pt-6 text-xs text-forest/35 sm:flex-row">
          <p>
            JCWF 2026 · Jogja Cultural Wellness Festival
          </p>

          <p>
            Reconnecting — People, Culture & Wellbeing
          </p>
        </div>
      </footer>
    </main>
  );
}