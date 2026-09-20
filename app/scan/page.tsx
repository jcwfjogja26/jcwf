import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentParticipant } from "@/lib/participant-session";
import BoothScanner from "@/components/my/BoothScanner";

export default async function ScanPage() {
  const participant = await getCurrentParticipant();

  if (!participant) {
    redirect("/login?redirect=/scan");
  }

  return (
    <main className="min-h-screen bg-[#F7F3E8] px-5 py-10 text-[#17382A]">
      <div className="mx-auto max-w-lg">
        <Link
          href="/my"
          className="text-sm font-medium text-[#64756A]"
        >
          ← Back to My Journey
        </Link>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7A8C80]">
            My Collection
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Scan a Booth
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#64756A]">
            Scan the QR code at a JCWF booth to collect a new card
            and earn points.
          </p>
        </div>

        <div className="mt-8 rounded-[28px] bg-white p-5 shadow-sm">
          <BoothScanner />
        </div>

        <div className="mt-5 rounded-2xl bg-[#EAF1EB] p-4 text-sm leading-6 text-[#4F6557]">
          <strong className="text-[#17382A]">How it works</strong>
          <br />
          Find a booth → scan its QR code → collect the card → earn
          points.
        </div>
      </div>
    </main>
  );
}