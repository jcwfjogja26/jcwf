"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import AdminShell from "@/components/admin/AdminShell";

type ScanStatus =
  | "idle"
  | "scanning"
  | "valid"
  | "already"
  | "invalid"
  | "expired"
  | "wrong_day"
  | "error";

type ScanResult = {
  status: string;
  message?: string;

  ticket?: {
    id: string;
    ticketCode: string;
    eventDate: string;
    dayLabel?: string;
    title?: string;
  };

  participant?: {
    id: string;
    fullName: string;
    reconnectId: string;
    email?: string;
  };

  checkedInAt?: string;
};

const FESTIVAL_DAYS = [
  {
    key: "D1",
    label: "DAY 01",
    date: "06 NOV",
    title: "Reconnect",
  },
  {
    key: "D2",
    label: "DAY 02",
    date: "07 NOV",
    title: "Experience",
  },
  {
    key: "D3",
    label: "DAY 03",
    date: "08 NOV",
    title: "Celebrate",
  },
];

export default function ScannerPage() {
  const scannerRef =
    useRef<Html5Qrcode | null>(null);

  const scannerRegionId = "jcwf-qr-reader";

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [status, setStatus] =
    useState<ScanStatus>("idle");

  const [result, setResult] =
    useState<ScanResult | null>(null);

  const [showHelp, setShowHelp] =
    useState(false);

  const [showMenu, setShowMenu] =
    useState(false);

  const [checkedIn, setCheckedIn] =
    useState(0);

  const [totalRegistered, setTotalRegistered] =
    useState(1000);

  /* =========================
     STOP CAMERA
  ========================= */

  const stopScanner = useCallback(
    async () => {
      const scanner = scannerRef.current;

      if (!scanner) {
        setCameraOpen(false);
        return;
      }

      try {
        await scanner.stop();
      } catch (error) {
        console.error(
          "STOP SCANNER ERROR:",
          error
        );
      }

      try {
        scanner.clear();
      } catch (error) {
        console.error(
          "CLEAR SCANNER ERROR:",
          error
        );
      }

      scannerRef.current = null;
      setCameraOpen(false);
    },
    []
  );

  /* =========================
     HANDLE QR RESULT
  ========================= */

  const handleScan = useCallback(
    async (decodedText: string) => {
      if (isProcessing) return;

      setIsProcessing(true);

      try {
        await stopScanner();

        const response = await fetch(
          "/api/admin/scanner",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              ticketCode:
                decodedText.trim(),
            }),
          }
        );

        const data = await response.json();

        setResult(data);

        switch (data.status) {
          case "VALID":
            setStatus("valid");

            setCheckedIn(
              (previous) =>
                previous + 1
            );

            break;

          case "ALREADY_CHECKED_IN":
            setStatus("already");
            break;

          case "NOT_TODAY":
            setStatus("wrong_day");
            break;

          case "EXPIRED":
            setStatus("expired");
            break;

          default:
            setStatus("invalid");
            break;
        }
      } catch (error) {
        console.error(
          "SCAN ERROR:",
          error
        );

        setStatus("error");

        setResult({
          status: "ERROR",
          message:
            "Terjadi kesalahan saat memproses ticket.",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, stopScanner]
  );

  /* =========================
     START CAMERA
  ========================= */

  const startScanner = useCallback(
    async () => {
      if (scannerRef.current) {
        return;
      }

      setResult(null);
      setStatus("scanning");
      setCameraOpen(true);

      try {
        const scanner =
          new Html5Qrcode(
            scannerRegionId
          );

        scannerRef.current = scanner;

        await scanner.start(
          {
            facingMode: "environment",
          },
          {
            fps: 10,

            qrbox: {
              width: 250,
              height: 250,
            },

            aspectRatio: 1,
          },
          handleScan,
          () => {
            // Continuous QR scan errors
            // are intentionally ignored.
          }
        );
      } catch (error) {
        console.error(
          "START CAMERA ERROR:",
          error
        );

        scannerRef.current = null;

        setCameraOpen(false);
        setStatus("error");

        setResult({
          status: "ERROR",
          message:
            "Kamera tidak dapat dibuka. Pastikan izin kamera sudah diberikan.",
        });
      }
    },
    [handleScan]
  );

  /* =========================
     CLEANUP
  ========================= */

  useEffect(() => {
    return () => {
      const scanner =
        scannerRef.current;

      if (scanner) {
        scanner
          .stop()
          .catch(() => {});
      }
    };
  }, []);

  /* =========================
     SCAN AGAIN
  ========================= */

  const scanAnother = () => {
    setResult(null);
    setStatus("idle");

    startScanner();
  };

  /* =========================
     STATS
  ========================= */

  const percentage =
    totalRegistered > 0
      ? Math.min(
          100,
          Math.round(
            (checkedIn /
              totalRegistered) *
              100
          )
        )
      : 0;

  /* =========================
     RESULT CONFIG
  ========================= */

  const getStatusConfig = () => {
    switch (status) {
      case "valid":
        return {
          icon: "✓",
          title:
            "Check-in Successful",
          description:
            "Ticket berhasil digunakan untuk masuk.",
          className:
            "bg-[#E4F1E4] text-[#17382A]",
        };

      case "already":
        return {
          icon: "!",
          title:
            "Already Checked In",
          description:
            "Ticket ini sudah digunakan sebelumnya.",
          className:
            "bg-[#FFF3D6] text-[#8A641B]",
        };

      case "wrong_day":
        return {
          icon: "!",
          title: "Wrong Day",
          description:
            "Ticket ini bukan untuk hari festival saat ini.",
          className:
            "bg-[#FFF3D6] text-[#8A641B]",
        };

      case "expired":
        return {
          icon: "!",
          title: "Ticket Expired",
          description:
            "Ticket ini sudah tidak dapat digunakan.",
          className:
            "bg-[#F9E3DF] text-[#8D4636]",
        };

      case "invalid":
        return {
          icon: "×",
          title: "Invalid Ticket",
          description:
            "QR code tidak dikenali sebagai ticket JCWF.",
          className:
            "bg-[#F9E3DF] text-[#8D4636]",
        };

      default:
        return {
          icon: "!",
          title:
            "Something Went Wrong",
          description:
            result?.message ||
            "Silakan coba lagi.",
          className:
            "bg-[#F9E3DF] text-[#8D4636]",
        };
    }
  };

  const statusConfig =
    getStatusConfig();

  return (
      <main className="min-h-screen bg-[#F7F3E8] text-[#17382A]">
        {/* HEADER */}

        <header className="sticky top-0 z-40 border-b border-[#17382A]/10 bg-[#F7F3E8]/95 backdrop-blur-md">
          <div className="mx-auto flex h-[76px] max-w-[1200px] items-center justify-between px-5 sm:px-8">
            {/* BRAND */}

            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#17382A] text-lg text-[#F7F3E8] transition hover:scale-105"
              >
                ←
              </Link>

              <div>
                <p className="font-display text-xl font-semibold">
                  JCWF
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-55">
                  Scanner
                </p>
              </div>
            </div>

            {/* HEADER ACTIONS */}

            <div className="flex items-center gap-2">
              {/* HOW TO USE */}

              <button
                type="button"
                onClick={() =>
                  setShowHelp(true)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#17382A]/15 text-lg font-semibold transition hover:bg-[#17382A] hover:text-[#F7F3E8]"
                aria-label="How to use"
              >
                ?
              </button>

              {/* MENU */}

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowMenu(
                      (previous) =>
                        !previous
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#17382A]/15 transition hover:bg-[#17382A] hover:text-[#F7F3E8]"
                  aria-label="Open menu"
                >
                  <span className="text-lg">
                    ☰
                  </span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-2xl border border-[#17382A]/10 bg-white p-2 shadow-xl">
                    <Link
                      href="/admin/scanner"
                      onClick={() =>
                        setShowMenu(false)
                      }
                      className="block rounded-xl bg-[#17382A]/5 px-4 py-3 text-sm font-semibold"
                    >
                      Scanner
                    </Link>

                    <Link
                      href="/admin/checkins"
                      onClick={() =>
                        setShowMenu(false)
                      }
                      className="block rounded-xl px-4 py-3 text-sm transition hover:bg-[#17382A]/5"
                    >
                      Check-in List
                    </Link>

                    <Link
                      href="/admin"
                      onClick={() =>
                        setShowMenu(false)
                      }
                      className="block rounded-xl px-4 py-3 text-sm transition hover:bg-[#17382A]/5"
                    >
                      Dashboard
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <section className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 sm:py-10">
          {/* TITLE */}

          <div className="mb-7">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
              Gate Check-in
            </p>

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
                  Scan & Welcome
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#17382A]/65">
                  Scan the participant&apos;s
                  daily ticket to confirm
                  their access to JCWF 2026.
                </p>
              </div>

              <div className="rounded-full bg-[#17382A] px-4 py-2 text-xs font-semibold text-[#F7F3E8]">
                06–08 NOV 2026
              </div>
            </div>
          </div>

          {/* STATS */}

          <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Checked In"
              value={checkedIn}
            />

            <StatCard
              label="Total Registered"
              value={
                totalRegistered
              }
            />

            <StatCard
              label="Remaining"
              value={Math.max(
                totalRegistered -
                  checkedIn,
                0
              )}
            />

            {/* RATE */}

            <div className="rounded-[24px] bg-[#17382A] p-5 text-[#F7F3E8] shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-60">
                Check-in Rate
              </p>

              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="font-display text-4xl font-semibold">
                  {percentage}%
                </p>

                <div className="relative mb-1 h-12 w-12">
                  <svg
                    viewBox="0 0 40 40"
                    className="h-full w-full -rotate-90"
                  >
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-[#F7F3E8]/15"
                    />

                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="100.5"
                      strokeDashoffset={
                        100.5 -
                        (100.5 *
                          percentage) /
                          100
                      }
                      className="text-[#C89B3C] transition-all duration-500"
                    />
                  </svg>
                </div>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#F7F3E8]/15">
                <div
                  className="h-full rounded-full bg-[#C89B3C] transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* MAIN GRID */}

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* SCANNER */}

            <div className="overflow-hidden rounded-[32px] bg-[#17382A] p-5 text-[#F7F3E8] shadow-xl sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C89B3C]">
                    Ticket Scanner
                  </p>

                  <h2 className="mt-1 font-display text-2xl font-semibold">
                    Scan QR Ticket
                  </h2>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F3E8]/10 text-lg">
                  ⌁
                </div>
              </div>

              {/* CAMERA */}

              <div className="relative overflow-hidden rounded-[26px] bg-[#0D241B]">
                {!cameraOpen && (
                  <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center sm:min-h-[430px]">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#F7F3E8]/10 text-4xl">
                      ▣
                    </div>

                    <h3 className="font-display text-2xl font-semibold">
                      Ready to Scan?
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#F7F3E8]/55">
                      Open the camera and
                      position the participant&apos;s
                      QR ticket inside the
                      scanning frame.
                    </p>

                    <button
                      type="button"
                      onClick={startScanner}
                      className="mt-7 rounded-full bg-[#C89B3C] px-7 py-3.5 text-sm font-bold text-[#17382A] transition hover:-translate-y-0.5 hover:bg-[#D9A441]"
                    >
                      Open Camera
                    </button>
                  </div>
                )}

                <div
                  id={scannerRegionId}
                  className={
                    cameraOpen
                      ? "min-h-[360px] w-full sm:min-h-[430px]"
                      : "hidden"
                  }
                />

                {/* STOP */}

                {cameraOpen && (
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/55 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur-md"
                  >
                    Stop Camera
                  </button>
                )}

                {/* PROCESSING */}

                {isProcessing && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#17382A]/85 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#F7F3E8]/20 border-t-[#C89B3C]" />

                      <p className="text-sm font-semibold">
                        Checking ticket...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* INSTRUCTION */}

              <div className="mt-5 flex gap-3 rounded-2xl bg-[#F7F3E8]/7 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C89B3C] text-sm font-bold text-[#17382A]">
                  i
                </div>

                <p className="text-xs leading-5 text-[#F7F3E8]/65">
                  Make sure the QR code
                  belongs to a valid JCWF
                  daily ticket. Each daily
                  ticket can only be checked
                  in once.
                </p>
              </div>
            </div>

            {/* SIDE PANEL */}

            <div className="flex flex-col gap-5">
              {/* FESTIVAL DAYS */}

              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C89B3C]">
                      Festival Access
                    </p>

                    <h3 className="mt-1 font-display text-2xl font-semibold">
                      Daily Tickets
                    </h3>
                  </div>

                  <span className="text-xs font-semibold text-[#17382A]/45">
                    3 DAYS
                  </span>
                </div>

                <div className="space-y-3">
                  {FESTIVAL_DAYS.map(
                    (day, index) => (
                      <div
                        key={day.key}
                        className="flex items-center gap-4 rounded-2xl bg-[#F7F3E8] p-4"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#17382A] font-display text-sm font-semibold text-[#F7F3E8]">
                          D{index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-bold">
                              {day.title}
                            </p>

                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#17382A]/45">
                              {day.date}
                            </p>
                          </div>

                          <p className="mt-1 text-xs text-[#17382A]/50">
                            {day.label}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* RESULT */}

              {result ? (
                <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
                  <div
                    className={`px-6 py-5 ${statusConfig.className}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/5 text-xl font-bold">
                        {statusConfig.icon}
                      </div>

                      <div>
                        <h3 className="font-display text-xl font-semibold">
                          {
                            statusConfig.title
                          }
                        </h3>

                        <p className="mt-1 text-xs leading-5 opacity-70">
                          {
                            statusConfig.description
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {result.participant && (
                    <div className="space-y-4 p-6">
                      {/* NAME */}

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#17382A]/40">
                          Participant
                        </p>

                        <p className="mt-1 font-display text-2xl font-semibold">
                          {
                            result
                              .participant
                              .fullName
                          }
                        </p>
                      </div>

                      {/* IDS */}

                      <div className="grid grid-cols-2 gap-3">
                        <InfoBox
                          label="Reconnect ID"
                          value={
                            result
                              .participant
                              .reconnectId
                          }
                        />

                        <InfoBox
                          label="Ticket"
                          value={
                            result.ticket
                              ?.ticketCode ||
                            "—"
                          }
                        />
                      </div>

                      {/* DAY */}

                      {result.ticket && (
                        <div className="rounded-2xl bg-[#F7F3E8] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#17382A]/40">
                            Festival Day
                          </p>

                          <p className="mt-1 text-sm font-bold">
                            {
                              result.ticket
                                .dayLabel
                            }{" "}
                            ·{" "}
                            {
                              result.ticket
                                .title
                            }
                          </p>
                        </div>
                      )}

                      {/* TIME */}

                      {result.checkedInAt && (
                        <div className="flex items-center justify-between border-t border-[#17382A]/10 pt-4">
                          <span className="text-xs text-[#17382A]/50">
                            Checked in at
                          </span>

                          <span className="text-sm font-bold">
                            {formatTime(
                              result.checkedInAt
                            )}
                          </span>
                        </div>
                      )}

                      {/* SCAN AGAIN */}

                      <button
                        type="button"
                        onClick={
                          scanAnother
                        }
                        className="w-full rounded-full bg-[#17382A] px-5 py-3.5 text-sm font-bold text-[#F7F3E8] transition hover:bg-[#214B39]"
                      >
                        Scan Another Ticket
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* EMPTY RESULT */

                <div className="rounded-[28px] border border-dashed border-[#17382A]/15 p-6">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCE9DC] text-[#17382A]">
                      ✓
                    </div>

                    <div>
                      <h3 className="font-display text-lg font-semibold">
                        Waiting for scan
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-[#17382A]/55">
                        The ticket information
                        will appear here after
                        a successful scan.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CHECK-IN LIST CTA */}

          <div className="mt-7 flex flex-col items-center justify-between gap-3 rounded-[24px] bg-[#DCE9DC] px-6 py-5 sm:flex-row">
            <div>
              <p className="font-display text-lg font-semibold">
                Need to review attendance?
              </p>

              <p className="mt-1 text-xs text-[#17382A]/55">
                View everyone who has
                checked in.
              </p>
            </div>

            <Link
              href="/admin/checkins"
              className="rounded-full bg-[#17382A] px-5 py-3 text-xs font-bold text-[#F7F3E8] transition hover:bg-[#214B39]"
            >
              View Check-in List →
            </Link>
          </div>
        </section>

        {/* HOW TO USE MODAL */}

        {showHelp && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17382A]/60 px-5 backdrop-blur-sm"
            onClick={() =>
              setShowHelp(false)
            }
          >
            <div
              className="w-full max-w-md rounded-[30px] bg-[#F7F3E8] p-7 shadow-2xl"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              {/* MODAL HEADER */}

              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C89B3C]">
                    Scanner Guide
                  </p>

                  <h2 className="mt-1 font-display text-3xl font-semibold">
                    How to Use
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowHelp(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#17382A]/7 text-sm"
                >
                  ×
                </button>
              </div>

              {/* STEPS */}

              <div className="space-y-4">
                <HowToStep
                  number="01"
                  title="Open the camera"
                  description="Tap Open Camera to start scanning."
                />

                <HowToStep
                  number="02"
                  title="Scan the QR ticket"
                  description="Ask the participant to show their daily ticket QR."
                />

                <HowToStep
                  number="03"
                  title="Check the result"
                  description="Wait until the system confirms the ticket."
                />

                <HowToStep
                  number="04"
                  title="Welcome the participant"
                  description="If valid, allow them to enter the festival."
                />
              </div>

              {/* IMPORTANT */}

              <div className="mt-6 rounded-2xl bg-[#DCE9DC] p-4 text-xs leading-5 text-[#17382A]/65">
                <strong className="text-[#17382A]">
                  Important:
                </strong>{" "}
                Each daily ticket can only
                be checked in once for its
                corresponding festival day.
              </div>
            </div>
          </div>
        )}
      </main>
    
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#17382A]/45">
        {label}
      </p>

      <p className="mt-3 font-display text-4xl font-semibold">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

/* =========================
   INFO BOX
========================= */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F7F3E8] p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#17382A]/40">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-bold">
        {value}
      </p>
    </div>
  );
}

/* =========================
   HOW TO STEP
========================= */

function HowToStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#17382A] text-[10px] font-bold text-[#F7F3E8]">
        {number}
      </div>

      <div>
        <p className="text-sm font-bold">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-[#17382A]/55">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================
   TIME FORMAT
========================= */

function formatTime(value: string) {
  try {
    return new Intl.DateTimeFormat(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      }
    ).format(new Date(value));
  } catch {
    return value;
  }
}