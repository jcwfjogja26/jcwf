import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentParticipant } from "@/lib/participant-session";
import { supabaseServer } from "@/lib/supabase-server";

import PassportQRCode from "@/components/home/PassportQRCode";
import DailyTicketSection from "@/components/home/DailyTicketSection";
import MyStoryCard from "@/components/my/MyStoryCard";
import MyCollectionCard from "@/components/my/MyCollectionCard";
import MyCollectionStamps from "@/components/my/MyCollectionStamps";



/* =========================================================
   PILLARS
========================================================= */

const pillars = {
  SELF: {
    label: "SELF",
    description: "Wellness & personal growth",
    className: "bg-[#DCE9D8] text-[#315A3F]",
  },
  OTHERS: {
    label: "OTHERS",
    description: "Connection & community",
    className: "bg-[#315A3F] text-[#F8F5ED]",
  },
  NATURE: {
    label: "NATURE",
    description: "Nature & mindful living",
    className: "bg-[#E5EBDD] text-[#315A3F]",
  },
  CULTURE: {
    label: "CULTURE",
    description: "Heritage & Jogja stories",
    className: "bg-[#EEE0D3] text-[#315A3F]",
  },
} as const;

/* =========================================================
   TYPES
========================================================= */

type PlanItem = {
  id: string;
  booking_code: string | null;
  quantity: number;
  total_amount: number;
  payment_status: string;
  status: string;
  registered_at: string;
  activity: {
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
  } | null;
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
  community: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: string;
    image_url: string | null;
    instagram_url: string | null;
    website_url: string | null;
    status: string;
  } | null;
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

/* =========================================================
   FALLBACK IMAGES
========================================================= */

const communityFallbackImages: Record<string, string> = {
  "Mind & Body": "/images/activity-wellness.jpg",
  "Healing & Therapy": "/images/activity-wellness.jpg",
  "Nature Connection": "/images/activity-culture.jpg",
  "Creative Experience": "/images/activity-community.jpg",
  "Culinary Wellness": "/images/activity-culinary.jpg",
};

/* =========================================================
   HELPERS
========================================================= */

function formatPlanDate(dateString: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  })
    .format(new Date(dateString))
    .toUpperCase();
}

function formatPlanTime(time: string) {
  return time.slice(0, 5).replace(":", ".");
}

function formatJourneyDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  })
    .format(date)
    .toUpperCase();
}

function getCheckInDay(date: string) {
  const normalized = date.slice(0, 10);

  if (normalized === "2026-11-06") return "Day 1";
  if (normalized === "2026-11-07") return "Day 2";
  if (normalized === "2026-11-08") return "Day 3";

  return "JCWF";
}

/* =========================================================
   ICONS
========================================================= */

function Icon({
  name,
  size = 18,
  strokeWidth = 1.6,
}: {
  name:
    | "home"
    | "ticket"
    | "calendar"
    | "users"
    | "link"
    | "gift"
    | "collection"
    | "story"
    | "gallery"
    | "qr"
    | "map"
    | "spark"
    | "chevron"
    | "close"
    | "menu"
    | "user"
    | "logout";
  size?: number;
  strokeWidth?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v11h14V9" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );

    case "ticket":
      return (
        <svg {...common}>
          <path d="M3 8a2 2 0 0 0 0 4 2 2 0 0 0 0 4v3h18v-3a2 2 0 0 0-0-4 2 2 0 0 0-0-4V5H3Z" />
          <path d="M13 5v14" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="17" rx="3" />
          <path d="M16 2v4M8 2v4M3 9h18" />
          <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case "link":
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.54.54l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-2 2a5 5 0 0 0 7.07 7.07l1.15-1.15" />
        </svg>
      );

    case "gift":
      return (
        <svg {...common}>
          <path d="M20 12v8H4v-8" />
          <path d="M2 7h20v5H2z" />
          <path d="M12 7v13" />
          <path d="M12 7H7.5A2.5 2.5 0 1 1 10 4.5C10 6 12 7 12 7Z" />
          <path d="M12 7h4.5A2.5 2.5 0 1 0 14 4.5C14 6 12 7 12 7Z" />
        </svg>
      );

    case "collection":
      return (
        <svg {...common}>
          <path d="M5 4h14v16H5z" />
          <path d="M8 2h8v2H8z" />
          <path d="M8 9h8M8 13h5" />
        </svg>
      );

    case "story":
      return (
        <svg {...common}>
          <path d="M5 3h14a2 2 0 0 1 2 2v15H7a2 2 0 0 1-2-2V3Z" />
          <path d="M5 17a2 2 0 0 0 2 2h14" />
          <path d="M9 8h7M9 12h6" />
        </svg>
      );

    case "gallery":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <circle cx="8.5" cy="9" r="1.4" />
          <path d="m21 15-5-5L6 20" />
        </svg>
      );

    case "qr":
      return (
        <svg {...common}>
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
          <path d="M14 14h2v2h-2zM18 14h2v6h-6v-2M14 18h2" />
        </svg>
      );

    case "map":
      return (
        <svg {...common}>
          <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
          <path d="M9 3v15M15 6v15" />
        </svg>
      );

    case "spark":
      return (
        <svg {...common}>
          <path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z" />
        </svg>
      );

    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );

    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5M21 12H9" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-[15px] px-3 py-2.5 transition ${
        active
          ? "bg-[#E4EEE1] text-forest"
          : "text-forest/45 hover:bg-forest/[0.045] hover:text-forest"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] ${
          active
            ? "bg-white text-forest shadow-[0_4px_15px_rgba(49,90,63,0.06)]"
            : ""
        }`}
      >
        <Icon name={icon} size={17} />
      </span>

      <span className="text-[11px] font-medium">
        {label}
      </span>
    </Link>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#EDF2E9] text-forest">
        <Icon name={icon} size={16} />
      </div>

      <div>
        <p className="font-display text-[20px] leading-none tracking-[-0.04em] text-forest">
          {value}
        </p>

        <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.12em] text-forest/30">
          {label}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   STAMP
========================================================= */

function Stamp({
  label,
  active,
  points,
}: {
  label: string;
  active: boolean;
  points?: number;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative flex h-[58px] w-[58px] items-center justify-center rounded-full ${
          active
            ? "bg-[#DDEAD8] text-forest"
            : "bg-white/50 text-forest/15"
        }`}
      >
        <div
          className={`flex h-[45px] w-[45px] items-center justify-center rounded-full border ${
            active
              ? "border-forest/10"
              : "border-forest/8"
          }`}
        >
          <Icon name="spark" size={17} />
        </div>

        {active && points ? (
          <span className="absolute -bottom-1 rounded-full bg-gold px-2 py-0.5 text-[7px] font-bold text-forest">
            +{points}
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-[7px] font-semibold uppercase tracking-[0.1em] text-forest/35">
        {label}
      </p>
    </div>
  );
}


/* =========================================================
   PAGE
========================================================= */

export default async function MyPage() {
  const participant = await getCurrentParticipant();

  if (!participant) {
    redirect("/login");
  }

  const pillar =
    pillars[
      participant.interest_category as keyof typeof pillars
    ] ?? pillars.CULTURE;

  /* =======================================================
     PLAN
  ======================================================== */

  const { data: registrations } = await supabaseServer
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

  const plan: PlanItem[] =
    (registrations ?? []) as unknown as PlanItem[];

  /* =======================================================
     GALLERY
  ======================================================== */

  const { data: galleryPosts } = await supabaseServer
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

  const myGallery: GalleryPost[] = (
    galleryPosts ?? []
  ).map((post) => ({
    id: post.id,
    image_path: post.image_path,
    image_url: post.image_path
      ? supabaseServer.storage
          .from("gallery")
          .getPublicUrl(post.image_path).data
          .publicUrl
      : post.image_url,
    caption: post.caption,
    created_at: post.created_at,
  }));

  /* =======================================================
     POINTS
  ======================================================== */

  const { data: pointTransactions } =
    await supabaseServer
      .from("points_transactions")
      .select("points")
      .eq("participant_id", participant.id);

  const totalPoints = (
    pointTransactions ?? []
  ).reduce(
    (total, transaction) =>
      total + (transaction.points ?? 0),
    0
  );

  /* =======================================================
     REWARDS
  ======================================================== */

  const { data: rewardRedemptions } =
    await supabaseServer
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

  const myRewardRedemptions =
    (rewardRedemptions ?? []) as unknown as Array<{
      id: string;
      redemption_code: string;
      points_spent: number;
      status:
        | "pending"
        | "claimed"
        | "cancelled";
      redeemed_at: string;
      claimed_at: string | null;
      rewards: {
        id: string;
        name: string;
        image_url: string | null;
      } | null;
    }>;

  /* =======================================================
     COMMUNITIES
  ======================================================== */

  const { data: communityMemberships } =
    await supabaseServer
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

  const myCommunities: MyCommunity[] =
    (communityMemberships ??
      []) as unknown as MyCommunity[];

  /* =======================================================
     COMMUNITY MEMBER COUNTS
  ======================================================== */

  const communityIds = myCommunities
    .map((item) => item.community?.id)
    .filter(Boolean) as string[];

  let communityMemberCounts: Record<
    string,
    number
  > = {};

  if (communityIds.length > 0) {
    const { data: memberRows } =
      await supabaseServer
        .from("community_members")
        .select("community_id")
        .in("community_id", communityIds);

    communityMemberCounts = (
      memberRows ?? []
    ).reduce(
      (counts, row) => {
        counts[row.community_id] =
          (counts[row.community_id] ?? 0) + 1;

        return counts;
      },
      {} as Record<string, number>
    );
  }

  /* =======================================================
     CHECK INS
  ======================================================== */

  const { data: checkInRows } =
    await supabaseServer
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

  const checkIns: CheckIn[] =
    (checkInRows ?? []) as CheckIn[];

  /* =======================================================
     JOURNEY
  ======================================================== */

  const journeyItems = [
    {
      id: "joined-jcwf",
      type: "joined" as const,
      title: "Joined JCWF",
      description: "Account created",
      date: new Date(participant.created_at),
    },

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
    (a, b) =>
      a.date.getTime() - b.date.getTime()
  ) as JourneyItem[];

  const nextPlanItem =
    plan.find(
      (item) =>
        item.activity &&
        item.activity.status !== "cancelled"
    ) ?? null;

  const nextActivity =
    nextPlanItem?.activity ?? null;

  /* =======================================================
     RETURN
  ======================================================== */

  return (
    <main className="min-h-screen bg-[#F5F3EB] text-[#315A3F]">
      {/* ===================================================
          SIDEBAR CONTROLLER
      ==================================================== */}

      <input
        id="sidebar-toggle"
        type="checkbox"
        className="peer sr-only"
      />

      {/* Hamburger */}

      <label
        htmlFor="sidebar-toggle"
        className="fixed left-4 top-4 z-[70] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#315A3F] shadow-[0_8px_30px_rgba(49,90,63,0.08)] backdrop-blur-xl transition hover:bg-white lg:left-6 lg:top-6"
        aria-label="Toggle navigation"
      >
        <span className="block peer-checked:hidden">
          <Icon name="menu" size={19} />
        </span>

        <span className="hidden">
          <Icon name="close" size={19} />
        </span>
      </label>

      {/* Mobile overlay */}

      <label
        htmlFor="sidebar-toggle"
        className="fixed inset-0 z-[55] hidden bg-[#315A3F]/15 backdrop-blur-[2px] peer-checked:block lg:hidden"
        aria-label="Close navigation"
      />

      {/* ===================================================
          SIDEBAR
      ==================================================== */}

      <aside className="fixed inset-y-0 left-0 z-[60] w-[230px] -translate-x-full bg-[#F8F7F1] px-4 pb-5 pt-5 shadow-[15px_0_45px_rgba(49,90,63,0.06)] transition-transform duration-300 peer-checked:translate-x-0 md:w-[238px] lg:translate-x-0 lg:peer-checked:-translate-x-full">
        {/* Brand */}

        <div className="flex h-12 items-center justify-between px-2">
         

          <label
            htmlFor="sidebar-toggle"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#315A3F]/35 transition hover:bg-[#315A3F]/5 hover:text-[#315A3F]"
          >
            <Icon name="close" size={16} />
          </label>
        </div>

        {/* Profile */}

        <div className="mt-5 rounded-[18px] bg-white/75 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#315A3F] text-[11px] font-semibold text-[#F8F7F1]">
              {participant.full_name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-[#315A3F]">
                {participant.full_name}
              </p>

              <p className="mt-0.5 truncate text-[8px] uppercase tracking-[0.13em] text-[#315A3F]/30">
                {participant.reconnect_id}
              </p>
            </div>
          </div>
        </div>

        {/* Main menu */}

        <div className="mt-6">
          <p className="px-3 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#315A3F]/25">
            My JCWF
          </p>

          <nav className="mt-2 space-y-1">
            <SidebarItem
              href="/my"
              icon="home"
              label="Overview"
              active
            />

            <SidebarItem
              href="/activities"
              icon="calendar"
              label="Activities"
            />

            <SidebarItem
              href="/communities"
              icon="users"
              label="Communities"
            />

            <SidebarItem
              href="/connections"
              icon="link"
              label="Connections"
            />

            <SidebarItem
              href="/rewards"
              icon="gift"
              label="Rewards"
            />
          </nav>
        </div>

        {/* Personal */}

        <div className="mt-6">
          <p className="px-3 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#315A3F]/25">
            Personal
          </p>

          <nav className="mt-2 space-y-1">
            <SidebarItem
              href="/my/gallery"
              icon="gallery"
              label="Gallery"
            />

            <a
              href="/my/collection"
              className="flex items-center gap-3 rounded-[15px] px-3 py-2.5 text-[#315A3F]/45 transition hover:bg-[#315A3F]/[0.045] hover:text-[#315A3F]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-[11px]">
                <Icon name="collection" size={17} />
              </span>

              <span className="text-[11px] font-medium">
                Collection
              </span>
            </a>

            <a
              href="/my/story"
              className="flex items-center gap-3 rounded-[15px] px-3 py-2.5 text-[#315A3F]/45 transition hover:bg-[#315A3F]/[0.045] hover:text-[#315A3F]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-[11px]">
                <Icon name="story" size={17} />
              </span>

              <span className="text-[11px] font-medium">
                My Story
              </span>
            </a>
          </nav>
        </div>

        {/* Footer */}

        <div className="absolute bottom-5 left-4 right-4">
          <div className="mb-3 flex items-center justify-center gap-2 rounded-[15px] bg-[#E8EFE4] px-3 py-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D3A84F]" />

            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#315A3F]/45">
              JCWF 06 — 08 Nov 2026
            </span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-3 rounded-[15px] px-3 py-2.5 text-[#315A3F]/30 transition hover:bg-[#315A3F]/[0.045] hover:text-[#315A3F]"
          >
            <span className="flex h-8 w-8 items-center justify-center">
              <Icon name="logout" size={16} />
            </span>

            <span className="text-[11px] font-medium">
              Back to festival
            </span>
          </Link>
        </div>
      </aside>

      {/* ===================================================
          CONTENT
      ==================================================== */}

      <div className="ml-0 min-h-screen transition-[margin] duration-300 lg:ml-[238px] lg:peer-checked:ml-0">
        <div className="mx-auto max-w-[1080px] px-5 pb-12 pt-24 sm:px-8 lg:px-10 lg:pt-10">
          {/* =================================================
              HEADER
          ================================================== */}

          <header className="flex items-end justify-between gap-5">
            <div className="pl-0 lg:pl-0">
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#C69A45]">
                Participant space
              </p>

              <h1 className="mt-2 font-display text-[2.3rem] leading-[0.95] tracking-[-0.06em] text-[#315A3F] sm:text-[2.8rem]">
                Hello,{" "}
                <span className="italic">
                  {participant.full_name.split(
                    " "
                  )[0]}
                  .
                </span>
              </h1>

              <p className="mt-3 max-w-md text-[11px] leading-5 text-[#315A3F]/35">
                Your essentials for JCWF 2026, kept simple.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full bg-white/70 px-3 py-2 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D3A84F]" />

              <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#315A3F]/40">
                {pillar.label}
              </span>
            </div>
          </header>

          {/* =================================================
              PASSPORT + STATS
          ================================================== */}

          <section className="mt-7 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Passport */}

            <div className="relative min-h-[174px] overflow-hidden rounded-[28px] bg-[#315A3F] p-5 text-[#F8F7F1] shadow-[0_18px_50px_rgba(49,90,63,0.08)] sm:p-6">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#D3A84F]/[0.06]" />

              <div className="relative flex h-full items-center justify-between gap-5">
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#D3A84F]">
                    Digital Passport
                  </p>

                  <p className="mt-4 font-display text-[25px] tracking-[0.03em]">
                    {participant.reconnect_id}
                  </p>

                  <p className="mt-1 text-[9px] text-white/35">
                    {participant.full_name}
                  </p>

                  <span
                    className={`mt-5 inline-flex rounded-full px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.12em] ${pillar.className}`}
                  >
                    {pillar.label}
                  </span>
                </div>

                <div className="rounded-[17px] bg-white p-2 shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                  <PassportQRCode
                    value={participant.reconnect_id}
                  />
                </div>
              </div>
            </div>

            {/* Stats */}

            <div className="rounded-[28px] bg-[#E8EFE4] p-5 sm:p-6">
              <div className="grid h-full grid-cols-3 items-center gap-3">
                <Stat
                  icon="calendar"
                  label="Activities"
                  value={plan.length}
                />

                <Stat
                  icon="spark"
                  label="Points"
                  value={totalPoints}
                />

                <Stat
                  icon="users"
                  label="Communities"
                  value={myCommunities.length}
                />
              </div>
            </div>
          </section>

          {/* =================================================
              NEXT ACTIVITY
          ================================================== */}

          <section className="mt-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.19em] text-[#C69A45]">
                  Upcoming
                </p>

                <h2 className="mt-1 font-display text-[20px] tracking-[-0.04em] text-[#315A3F]">
                  Your next activity
                </h2>
              </div>

              <Link
                href="/activities"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#315A3F]/35 shadow-[0_6px_20px_rgba(49,90,63,0.04)] transition hover:text-[#315A3F]"
                aria-label="Activities"
              >
                <Icon name="calendar" size={14} />
              </Link>
            </div>

            {nextActivity ? (
              <Link
                href={`/activities/${nextActivity.slug}/success?booking=${nextPlanItem?.id ?? ""}`}
                className="mt-3 block rounded-[24px] bg-white p-3.5 shadow-[0_10px_35px_rgba(49,90,63,0.045)] transition hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-[62px] w-[62px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[18px] bg-[#DDE9D9] text-[#315A3F]">
                    <span className="text-[7px] font-bold uppercase tracking-[0.1em]">
                      {formatPlanDate(
                        nextActivity.event_date
                      ).slice(3)}
                    </span>

                    <span className="mt-0.5 font-display text-[22px] leading-none">
                      {formatPlanDate(
                        nextActivity.event_date
                      ).slice(0, 2)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[7px] font-bold uppercase tracking-[0.13em] text-[#C69A45]">
                        {nextActivity.category}
                      </span>

                      {nextPlanItem?.payment_status ===
                        "pending" && (
                        <span className="rounded-full bg-[#F3E5C9] px-2 py-0.5 text-[7px] font-semibold text-[#A2782F]">
                          Pending
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1 truncate text-[13px] font-semibold text-[#315A3F]">
                      {nextActivity.title}
                    </h3>

                    <p className="mt-1 truncate text-[9px] text-[#315A3F]/35">
                      {formatPlanTime(
                        nextActivity.start_time
                      )}{" "}
                      · {nextActivity.location}
                    </p>
                  </div>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F4ED] text-[#315A3F]/30">
                    <Icon name="chevron" size={14} />
                  </span>
                </div>
              </Link>
            ) : (
              <div className="mt-3 rounded-[24px] bg-white p-5 shadow-[0_10px_35px_rgba(49,90,63,0.04)]">
                <p className="text-xs text-[#315A3F]/40">
                  No activity booked yet.
                </p>

                <Link
                  href="/activities"
                  className="mt-2 inline-flex text-[9px] font-semibold text-[#C69A45]"
                >
                  Explore activities
                </Link>
              </div>
            )}
          </section>

          {/* =================================================
              DAILY TICKET
          ================================================== */}

          <section
            id="daily-ticket"
            className="mt-3"
          >
            <div className="rounded-[24px] bg-white p-4 shadow-[0_10px_35px_rgba(49,90,63,0.045)]">
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-[#E8EFE4] text-[#315A3F]">
                    <Icon name="ticket" size={15} />
                  </span>

                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#C69A45]">
                      Daily access
                    </p>

                    <p className="mt-0.5 text-[11px] font-semibold text-[#315A3F]">
                      Festival ticket
                    </p>
                  </div>
                </div>

                <span className="text-[7px] font-semibold uppercase tracking-[0.12em] text-[#315A3F]/25">
                  06 — 08 NOV
                </span>
              </div>

              <div className="overflow-hidden rounded-[18px]">
                <DailyTicketSection />
              </div>
            </div>
          </section>

          {/* =================================================
              COMMUNITIES + CONNECTIONS
          ================================================== */}

          <section className="mt-3 grid gap-3 md:grid-cols-2">
            {/* Communities */}

            <div className="rounded-[24px] bg-white p-5 shadow-[0_10px_35px_rgba(49,90,63,0.045)]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#DDE9D9] text-[#315A3F]">
                  <Icon name="users" size={16} />
                </div>

                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#C69A45]">
                    Communities
                  </p>

                  <p className="mt-0.5 text-[12px] font-semibold text-[#315A3F]">
                    {myCommunities.length} joined
                  </p>
                </div>
              </div>

              {myCommunities.length > 0 ? (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {myCommunities
                    .filter((item) => item.community)
                    .slice(0, 3)
                    .map((membership) => {
                      const community =
                        membership.community!;

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
                          className="flex min-w-[150px] items-center gap-2.5 rounded-[15px] bg-[#F2F5EF] p-2.5"
                        >
                          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-[10px]">
                            <img
                              src={image}
                              alt={community.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[9px] font-semibold text-[#315A3F]">
                              {community.name}
                            </p>

                            <p className="mt-0.5 text-[7px] text-[#315A3F]/30">
                              {communityMemberCounts[
                                community.id
                              ] ?? 0}{" "}
                              members
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              ) : (
                <Link
                  href="/communities"
                  className="mt-4 block rounded-[15px] bg-[#F2F5EF] p-3 text-[9px] text-[#315A3F]/40"
                >
                  Discover a community for you.
                </Link>
              )}
            </div>

            {/* Connections */}

            <div className="rounded-[24px] bg-[#E8EFE4] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white text-[#315A3F]">
                  <Icon name="link" size={16} />
                </div>

                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#C69A45]">
                    Connections
                  </p>

                  <p className="mt-0.5 text-[12px] font-semibold text-[#315A3F]">
                    Reconnect with people
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-[15px] bg-white/65 p-3">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.12em] text-[#315A3F]/25">
                    Your ID
                  </p>

                  <p className="mt-1 font-display text-[17px] tracking-[0.04em] text-[#315A3F]">
                    {participant.reconnect_id}
                  </p>
                </div>

                <Link
                  href="/connections"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#315A3F] text-[#F8F7F1]"
                  aria-label="Open connections"
                >
                  <Icon name="qr" size={14} />
                </Link>
              </div>
            </div>
          </section>

          {/* =================================================
              REWARDS — SMALL
          ================================================== */}

          <section className="mt-3">
            <div className="flex items-center justify-between rounded-[24px] bg-[#315A3F] px-5 py-4 text-[#F8F7F1] shadow-[0_10px_35px_rgba(49,90,63,0.06)]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#D3A84F] text-[#315A3F]">
                  <Icon name="gift" size={16} />
                </div>

                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#D3A84F]">
                    Rewards
                  </p>

                  <p className="mt-0.5 text-[11px] font-medium">
                    {totalPoints} points available
                  </p>
                </div>
              </div>

              <Link
                href="/rewards"
                className="rounded-full bg-white/10 px-3.5 py-2 text-[8px] font-semibold text-white/75 transition hover:bg-white/15 hover:text-white"
              >
                View rewards
              </Link>
            </div>
          </section>

          

<div className="mt-3 grid gap-3 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">

  {/* COLLECTION */}
  <div className="min-w-0">
    <MyCollectionStamps />
  </div>

  {/* MY STORY */}
  <div className="min-w-0">
    <MyStoryCard />
  </div>

</div>

{/* =================================================
    SMALL FOOTER
================================================== */}

<footer className="mt-8 px-1">
            <div className="flex flex-col gap-1 text-[7px] uppercase tracking-[0.14em] text-[#315A3F]/20 sm:flex-row sm:items-center sm:justify-between">
              <span>
                JCWF 2026 · Jogja Cultural Wellness Festival
              </span>

              <span>
                People · Culture · Wellbeing
              </span>
            </div>
          </footer>
        </div>
      </div>
    </main>
    
 );
}
