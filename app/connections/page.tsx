"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";

type Connection = {
  id: string;
  created_at: string;
  connected_participant: {
    id: string;
    reconnect_id: string;
    full_name: string;
    city: string | null;
    interest_category: string | null;
  };
};

type ScannedParticipant = {
  id: string;
  reconnectId: string;
  fullName: string;
  city: string | null;
  interestCategory: string | null;
};

const scannerRegionId = "jcwf-connection-qr-reader";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  const [reconnectId, setReconnectId] = useState("");
  const [searching, setSearching] = useState(false);

  const [selectedParticipant, setSelectedParticipant] =
    useState<ScannedParticipant | null>(null);

  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState("");

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  const loadConnections = useCallback(async () => {
    try {
      const response = await fetch("/api/connections");

      if (response.status === 401) {
        window.location.href = "/login?redirect=/connections";
        return;
      }

      const data = await response.json();

      if (data.success) {
        setConnections(data.connections ?? []);
      }
    } catch (error) {
      console.error("LOAD CONNECTIONS ERROR:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const findParticipant = useCallback(
    async (value?: string) => {
      const cleanId = (value ?? reconnectId).trim();

      if (!cleanId) {
        setMessage("Masukkan Reconnect ID terlebih dahulu.");
        return;
      }

      setSearching(true);
      setMessage("");
      setSelectedParticipant(null);

      try {
        const response = await fetch(
          `/api/connections/search?reconnectId=${encodeURIComponent(cleanId)}`
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.error ?? "Participant tidak ditemukan.");
          return;
        }

        setSelectedParticipant(data.participant);
      } catch (error) {
        console.error("FIND PARTICIPANT ERROR:", error);
        setMessage("Terjadi kesalahan. Coba lagi.");
      } finally {
        setSearching(false);
      }
    },
    [reconnectId]
  );

  const closeCamera = useCallback(async () => {
    const scanner = scannerRef.current;

    setCameraLoading(false);
    setCameraOpen(false);

    if (!scanner) return;

    try {
      await scanner.stop();
    } catch (error) {
      console.error("STOP CAMERA ERROR:", error);
    }

    try {
      scanner.clear();
    } catch (error) {
      console.error("CLEAR CAMERA ERROR:", error);
    }

    scannerRef.current = null;
  }, []);

  const handleQrResult = useCallback(
    async (decodedText: string) => {
      const scannedId = decodedText.trim();

      if (!scannedId) return;

      setReconnectId(scannedId);
      setMessage("");

      await closeCamera();
      await findParticipant(scannedId);
    },
    [closeCamera, findParticipant]
  );

  const openCamera = async () => {
    if (cameraOpen || cameraLoading) return;

    setMessage("");
    setSelectedParticipant(null);
    setCameraLoading(true);

    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      const element = document.getElementById(scannerRegionId);

      if (!element) {
        throw new Error("Scanner element not found.");
      }

      const scanner = new Html5Qrcode(scannerRegionId);

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 220,
            height: 220,
          },
          aspectRatio: 1,
        },
        handleQrResult,
        () => {}
      );

      setCameraOpen(true);
    } catch (error) {
      console.error("OPEN CAMERA ERROR:", error);

      scannerRef.current = null;
      setCameraOpen(false);

      setMessage(
        "Kamera tidak dapat dibuka. Pastikan izin kamera sudah diberikan."
      );
    } finally {
      setCameraLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner) {
        scanner.stop().catch(() => {});
      }

      scannerRef.current = null;
    };
  }, []);

  async function connectParticipant() {
    if (!selectedParticipant) return;

    setConnecting(true);
    setMessage("");

    try {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantId: selectedParticipant.id,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/login?redirect=/connections";
        return;
      }

      if (!response.ok) {
        setMessage(data.error ?? "Gagal melakukan connection.");
        return;
      }

      setMessage(
        data.alreadyConnected
          ? "Participant ini sudah ada di connections kamu."
          : "Connection berhasil ditambahkan."
      );

      setSelectedParticipant(null);
      setReconnectId("");

      await loadConnections();
    } catch (error) {
      console.error("CONNECT PARTICIPANT ERROR:", error);
      setMessage("Terjadi kesalahan. Coba lagi.");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <main className="min-h-screen bg-ivory text-forest">
      {/* Header */}
      <header className="border-b border-forest/8 bg-ivory/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-4 md:px-8 md:py-5">
          <Link
            href="/my"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-forest/10 bg-white/60 text-lg text-forest transition-all hover:-translate-y-0.5 hover:bg-sage"
            aria-label="Back to My JCWF"
          >
            ←
          </Link>

          <div className="text-center">
            <p className="font-display text-lg leading-none text-forest md:text-xl">
              My Connections
            </p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-forest/35">
              Reconnect with people
            </p>
          </div>

          <Link
            href="/my"
            className="rounded-full border border-forest/10 bg-white/60 px-4 py-2 text-[10px] font-semibold text-forest backdrop-blur-md transition hover:bg-sage"
          >
            My JCWF
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[900px] px-5 py-10 md:px-8 md:py-14">
        {/* Intro */}
        <section className="mb-8">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            Connect
          </p>

          <h1 className="max-w-2xl font-display text-[clamp(2.5rem,6vw,4.8rem)] font-medium leading-[0.92] tracking-[-0.045em]">
            Meet someone.
            <br />
            <span className="text-gold">Stay connected.</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-6 text-forest/55 md:text-[15px]">
            Scan their Reconnect QR or enter their ID to connect after meeting
            at JCWF.
          </p>
        </section>

        {/* Scanner */}
        <section className="rounded-[2rem] bg-forest p-5 text-ivory shadow-[0_20px_55px_rgba(23,56,42,0.12)] sm:p-7 md:p-8">
          {/* Scanner heading */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">
                Scan to connect
              </p>

              <h2 className="mt-2 font-display text-3xl leading-none tracking-[-0.03em] text-white md:text-4xl">
                Reconnect QR
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setShowGuide((current) => !current)}
              aria-label="How to use scanner"
              aria-expanded={showGuide}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all ${
                showGuide
                  ? "border-gold bg-gold text-forest"
                  : "border-white/15 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10"
              }`}
            >
              ?
            </button>
          </div>

          {/* Guide */}
          {showGuide && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    number: "01",
                    text: "Buka QR Reconnect milik peserta.",
                  },
                  {
                    number: "02",
                    text: "Buka kamera lalu arahkan ke QR.",
                  },
                  {
                    number: "03",
                    text: "Review profil lalu pilih Connect.",
                  },
                ].map((step) => (
                  <div key={step.number} className="flex gap-3">
                    <span className="text-[9px] font-bold text-gold">
                      {step.number}
                    </span>
                    <p className="text-[11px] leading-5 text-white/55">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Camera */}
          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#102F24]">
            <div className="relative aspect-square w-full max-w-[430px] mx-auto">
              <div
                id={scannerRegionId}
                className={`absolute inset-0 overflow-hidden ${
                  cameraOpen ? "block" : "hidden"
                }`}
              />

              {!cameraOpen && (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-7 w-7 text-white/45"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 7.5A1.5 1.5 0 0 1 5.5 6h2l1.2-1.5h4.6L14.5 6h2A1.5 1.5 0 0 1 18 7.5v9A1.5 1.5 0 0 1 16.5 18h-11A1.5 1.5 0 0 1 4 16.5z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3.25" />
                    </svg>
                  </div>

                  <p className="mt-4 text-sm font-medium text-white/70">
                    Kamera belum dibuka
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-white/35">
                    Buka kamera untuk scan Reconnect QR.
                  </p>
                </div>
              )}

              {cameraOpen && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-[220px] w-[220px] rounded-[1.5rem] border-2 border-gold/90">
                    <span className="absolute -left-[2px] -top-[2px] h-7 w-7 rounded-tl-xl border-l-4 border-t-4 border-gold" />
                    <span className="absolute -right-[2px] -top-[2px] h-7 w-7 rounded-tr-xl border-r-4 border-t-4 border-gold" />
                    <span className="absolute -bottom-[2px] -left-[2px] h-7 w-7 rounded-bl-xl border-b-4 border-l-4 border-gold" />
                    <span className="absolute -bottom-[2px] -right-[2px] h-7 w-7 rounded-br-xl border-b-4 border-r-4 border-gold" />
                  </div>
                </div>
              )}

              {cameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#102F24]/80 backdrop-blur-sm">
                  <p className="text-xs font-medium text-white/70">
                    Opening camera...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Camera control */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={cameraOpen ? closeCamera : openCamera}
              disabled={cameraLoading}
              className={`inline-flex h-11 items-center justify-center rounded-full px-6 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                cameraOpen
                  ? "border border-white/15 bg-white/10 text-white hover:bg-white/15"
                  : "bg-gold text-forest hover:-translate-y-0.5 hover:bg-[#D8B45A]"
              }`}
            >
              {cameraLoading
                ? "Opening Camera..."
                : cameraOpen
                  ? "Close Camera"
                  : "Open Camera"}
            </button>
          </div>

          <p className="mt-3 text-center text-[10px] text-white/35">
            Kamu bisa menutup kamera kapan saja setelah selesai scan.
          </p>

          {/* Divider */}
          <div className="mt-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/15" />

              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                atau masukkan ID
              </span>

              <div className="h-px flex-1 bg-white/15" />
            </div>

            {/* Manual ID */}
            <div className="mt-5 px-1 sm:px-2">
              <div className="space-y-3">
                <input
                  type="text"
                  value={reconnectId}
                  onChange={(event) => setReconnectId(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      findParticipant();
                    }
                  }}
                  placeholder="Masukkan Reconnect ID"
                  className="h-[52px] w-full rounded-[1.1rem] border border-gold/80 bg-white px-5 text-[15px] text-forest outline-none placeholder:text-forest/30 focus:border-gold focus:ring-2 focus:ring-gold/15"
                />

                <button
                  type="button"
                  onClick={() => findParticipant()}
                  disabled={searching}
                  className="h-[50px] w-full rounded-[1.1rem] bg-gold px-5 text-sm font-semibold text-forest transition-colors hover:bg-[#D8B45A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {searching ? "Finding..." : "Find ID"}
                </button>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <p className="mt-4 px-2 text-center text-xs leading-5 text-white/55">
              {message}
            </p>
          )}
        </section>

        {/* Participant result */}
        {selectedParticipant && (
          <section className="mt-5 rounded-[1.75rem] border border-forest/8 bg-white/65 p-5 shadow-[0_10px_35px_rgba(23,56,42,0.06)] backdrop-blur-md sm:p-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
              Participant found
            </p>

            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sage font-display text-xl text-forest">
                  {selectedParticipant.fullName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3 className="font-display text-2xl leading-none text-forest">
                    {selectedParticipant.fullName}
                  </h3>

                  <p className="mt-1.5 text-[10px] font-medium text-forest/40">
                    {selectedParticipant.reconnectId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={connectParticipant}
                disabled={connecting}
                className="h-11 rounded-full bg-forest px-6 text-xs font-semibold text-ivory transition-all hover:-translate-y-0.5 hover:bg-[#244F3C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {connecting ? "Connecting..." : "Connect"}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {selectedParticipant.city && (
                <span className="rounded-full bg-sage/60 px-3 py-1.5 text-[10px] font-medium text-forest/65">
                  {selectedParticipant.city}
                </span>
              )}

              {selectedParticipant.interestCategory && (
                <span className="rounded-full bg-gold/15 px-3 py-1.5 text-[10px] font-medium text-forest/65">
                  {selectedParticipant.interestCategory}
                </span>
              )}
            </div>
          </section>
        )}

        {/* My Connections */}
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
                Your network
              </p>

              <h2 className="mt-2 font-display text-3xl leading-none tracking-[-0.03em] text-forest md:text-4xl">
                My Connections
              </h2>
            </div>

            <span className="text-xs text-forest/35">
              {connections.length}{" "}
              {connections.length === 1 ? "connection" : "connections"}
            </span>
          </div>

          <div className="mt-5">
            {loading ? (
              <div className="rounded-[1.5rem] bg-white/55 px-5 py-8 text-center text-xs text-forest/40">
                Loading connections...
              </div>
            ) : connections.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-forest/10 bg-white/35 px-6 py-10 text-center">
                <p className="font-display text-xl text-forest">
                  Belum ada connections.
                </p>

                <p className="mt-2 text-xs leading-5 text-forest/40">
                  Scan QR atau masukkan Reconnect ID untuk mulai terhubung.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[1.5rem] border border-forest/8 bg-white/55">
                {connections.map((connection, index) => {
                  const person = connection.connected_participant;

                  return (
                    <div
                      key={connection.id}
                      className={`flex items-center justify-between gap-4 px-5 py-4 ${
                        index !== connections.length - 1
                          ? "border-b border-forest/7"
                          : ""
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage font-display text-base text-forest">
                          {person.full_name.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-forest">
                            {person.full_name}
                          </p>

                          <p className="mt-0.5 truncate text-[10px] text-forest/35">
                            {person.reconnect_id}
                          </p>

                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {person.city && (
                              <span className="text-[9px] text-forest/40">
                                {person.city}
                              </span>
                            )}

                            {person.city && person.interest_category && (
                              <span className="text-[9px] text-forest/20">
                                •
                              </span>
                            )}

                            {person.interest_category && (
                              <span className="text-[9px] text-forest/40">
                                {person.interest_category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-sage/55 px-3 py-1.5 text-[9px] font-semibold text-forest/55">
                        Connected
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Footer note */}
        <div className="mt-14 border-t border-forest/8 pt-6 text-center">
          <p className="text-[10px] leading-5 text-forest/30">
            Your connections are private and only visible through your JCWF
            account.
          </p>
        </div>
      </div>
    </main>
  );
}