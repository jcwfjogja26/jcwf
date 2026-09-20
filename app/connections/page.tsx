"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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

  const [scannerOpen, setScannerOpen] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  /* =================================================
     LOAD CONNECTIONS
  ================================================= */

  const loadConnections = useCallback(async () => {
    try {
      const response = await fetch("/api/connections");

      if (response.status === 401) {
        window.location.href =
          "/login?redirect=/connections";
        return;
      }

      const data = await response.json();

      if (data.success) {
        setConnections(data.connections ?? []);
      }
    } catch (error) {
      console.error(
        "LOAD CONNECTIONS ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  /* =================================================
     FIND PARTICIPANT
  ================================================= */

  const findParticipant = useCallback(
    async (value?: string) => {
      const cleanId = (
        value ?? reconnectId
      ).trim();

      if (!cleanId) return;

      setSearching(true);
      setMessage("");
      setSelectedParticipant(null);

      try {
        const response = await fetch(
          `/api/connections/search?reconnectId=${encodeURIComponent(
            cleanId
          )}`
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.error ??
              "Participant tidak ditemukan."
          );
          return;
        }

        setSelectedParticipant(
          data.participant
        );
      } catch (error) {
        console.error(
          "FIND PARTICIPANT ERROR:",
          error
        );

        setMessage(
          "Terjadi kesalahan. Coba lagi."
        );
      } finally {
        setSearching(false);
      }
    },
    [reconnectId]
  );

  /* =================================================
     HANDLE QR RESULT
  ================================================= */

  const handleQrResult = useCallback(
    async (decodedText: string) => {
      const scannedId = decodedText.trim();

      if (!scannedId) return;

      console.log(
        "SCANNED RECONNECT ID:",
        scannedId
      );

      setReconnectId(scannedId);
      setMessage("");

      // Tutup kamera setelah QR berhasil terbaca
      await stopScanner();

      // Cari participant berdasarkan hasil scan
      await findParticipant(scannedId);
    },
    [findParticipant]
  );

  /* =================================================
     STOP SCANNER
  ================================================= */

  const stopScanner = useCallback(
    async () => {
      const scanner = scannerRef.current;

      if (!scanner) {
        setScannerOpen(false);
        return;
      }

      try {
        await scanner.stop();
      } catch (error) {
        console.error(
          "STOP CONNECTION SCANNER ERROR:",
          error
        );
      }

      try {
        scanner.clear();
      } catch (error) {
        console.error(
          "CLEAR CONNECTION SCANNER ERROR:",
          error
        );
      }

      scannerRef.current = null;
      setScannerOpen(false);
    },
    []
  );

  /* =================================================
     OPEN SCANNER
  ================================================= */

  const startScanner = () => {
    setMessage("");
    setSelectedParticipant(null);

    // Jangan langsung instantiate Html5Qrcode di sini.
    // Biarkan React render element scanner terlebih dahulu.
    setScannerOpen(true);
  };

  /* =================================================
     INITIALIZE CAMERA AFTER ELEMENT EXISTS
  ================================================= */

  useEffect(() => {
    if (!scannerOpen) return;

    let cancelled = false;

    async function openCamera() {
      /*
       * Tunggu satu render cycle agar:
       *
       * <div id="jcwf-connection-qr-reader">
       *
       * benar-benar sudah masuk DOM.
       */
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });

      if (cancelled) return;

      const element =
        document.getElementById(
          scannerRegionId
        );

      if (!element) {
        console.error(
          "CONNECTION SCANNER ELEMENT NOT FOUND"
        );

        setScannerOpen(false);

        setMessage(
          "Scanner gagal dibuka. Silakan coba lagi."
        );

        return;
      }

      // Safety: jangan buat scanner kedua
      if (scannerRef.current) {
        return;
      }

      try {
        const scanner = new Html5Qrcode(
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
              width: 240,
              height: 240,
            },
            aspectRatio: 1,
          },
          handleQrResult,
          () => {
            // QR belum terbaca.
            // Error scanning kontinu diabaikan.
          }
        );
      } catch (error) {
        console.error(
          "START CONNECTION SCANNER ERROR:",
          error
        );

        scannerRef.current = null;

        setScannerOpen(false);

        setMessage(
          "Kamera tidak dapat dibuka. Pastikan izin kamera sudah diberikan."
        );
      }
    }

    openCamera();

    return () => {
      cancelled = true;
    };
  }, [scannerOpen, handleQrResult]);

  /* =================================================
     CLEANUP CAMERA
  ================================================= */

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner) {
        scanner.stop().catch(() => {});
      }

      scannerRef.current = null;
    };
  }, []);

  /* =================================================
     CONNECT PARTICIPANT
  ================================================= */

  async function connectParticipant() {
    if (!selectedParticipant) return;

    setConnecting(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/connections",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participantId:
              selectedParticipant.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ??
            "Gagal melakukan connection."
        );
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
      console.error(
        "CONNECT PARTICIPANT ERROR:",
        error
      );

      setMessage(
        "Terjadi kesalahan. Coba lagi."
      );
    } finally {
      setConnecting(false);
    }
  }

  /* =================================================
     RENDER
  ================================================= */

  return (
    <main className="min-h-screen bg-[#F7F3E8] text-[#17382A]">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-[#17382A]/10 bg-[#F7F3E8]">
        <div className="mx-auto flex h-[76px] max-w-[1100px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/my"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#17382A] text-[#F7F3E8] transition hover:bg-[#214B39]"
            >
              ←
            </Link>

            <div>
              <p className="font-display text-xl font-semibold">
                My Connections
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-50">
                Reconnect with people
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8">
        {/* =================================================
            CONNECT CARD
        ================================================= */}

        <section className="rounded-[28px] bg-[#17382A] p-6 text-[#F7F3E8] shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D9A441]">
            Connect
          </p>

          <h1 className="mt-2 font-display text-3xl font-semibold">
            Meet someone at JCWF.
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#F7F3E8]/65">
            Scan or enter someone&apos;s
            Reconnect ID to connect with
            them.
          </p>

          {/* =================================================
              QR SCANNER
          ================================================= */}

          {scannerOpen && (
            <div className="mt-6 overflow-hidden rounded-[28px] bg-[#0D241B]">
              {/* SCANNER HEADER */}

              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D9A441]">
                    QR Scanner
                  </p>

                  <p className="mt-1 font-display text-lg font-semibold text-[#F7F3E8]">
                    Scan Reconnect ID
                  </p>
                </div>

                <button
                  type="button"
                  onClick={stopScanner}
                  className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  Close
                </button>
              </div>

              {/* CAMERA */}

              <div className="relative overflow-hidden">
                <div
                  id={scannerRegionId}
                  className="min-h-[340px] w-full sm:min-h-[420px]"
                />

                {/* CUSTOM SCAN FRAME */}

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-[240px] w-[240px]">
                    {/* TOP LEFT */}

                    <div className="absolute left-0 top-0 h-11 w-11 rounded-tl-2xl border-l-4 border-t-4 border-[#D9A441]" />

                    {/* TOP RIGHT */}

                    <div className="absolute right-0 top-0 h-11 w-11 rounded-tr-2xl border-r-4 border-t-4 border-[#D9A441]" />

                    {/* BOTTOM LEFT */}

                    <div className="absolute bottom-0 left-0 h-11 w-11 rounded-bl-2xl border-b-4 border-l-4 border-[#D9A441]" />

                    {/* BOTTOM RIGHT */}

                    <div className="absolute bottom-0 right-0 h-11 w-11 rounded-br-2xl border-b-4 border-r-4 border-[#D9A441]" />

                    {/* SCAN LINE */}

                    <div className="absolute left-5 right-5 top-1/2 h-[2px] bg-[#D9A441]/70" />
                  </div>
                </div>
              </div>

              {/* INSTRUCTION */}

              <div className="border-t border-white/10 px-5 py-4 text-center">
                <p className="text-xs leading-5 text-white/50">
                  Arahkan kamera ke QR Code
                  Reconnect ID peserta.
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              MANUAL INPUT
          ================================================= */}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              value={reconnectId}
              onChange={(event) =>
                setReconnectId(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  findParticipant();
                }
              }}
              placeholder="Enter Reconnect ID"
              className="h-12 flex-1 rounded-2xl border border-white/10 bg-white px-4 text-sm text-[#17382A] outline-none placeholder:text-[#17382A]/35 focus:border-[#D9A441]"
            />

            <button
              type="button"
              onClick={() =>
                findParticipant()
              }
              disabled={
                searching ||
                !reconnectId.trim()
              }
              className="h-12 rounded-2xl bg-[#D9A441] px-6 text-sm font-bold text-[#17382A] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {searching
                ? "Searching..."
                : "Find Participant"}
            </button>
          </div>

          {/* =================================================
              SCAN BUTTON
          ================================================= */}

          {!scannerOpen && (
            <button
              type="button"
              onClick={startScanner}
              className="mt-3 flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-[#D9A441]/40 bg-[#D9A441]/10 px-5 text-sm font-bold text-[#D9A441] transition hover:bg-[#D9A441]/15"
            >
              <span className="text-lg">
                ⌁
              </span>

              Scan Reconnect ID
            </button>
          )}

          {/* =================================================
              MESSAGE
          ================================================= */}

          {message && (
            <div className="mt-4 rounded-2xl bg-[#D9A441]/10 px-4 py-3">
              <p className="text-sm text-[#D9A441]">
                {message}
              </p>
            </div>
          )}

          {/* =================================================
              PARTICIPANT PREVIEW
          ================================================= */}

          {selectedParticipant && (
            <div className="mt-6 rounded-[24px] bg-white p-5 text-[#17382A]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#17382A]/40">
                Participant found
              </p>

              <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-semibold">
                    {
                      selectedParticipant.fullName
                    }
                  </h2>

                  <p className="mt-1 text-sm text-[#17382A]/50">
                    {
                      selectedParticipant.reconnectId
                    }
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedParticipant.city && (
                      <span className="rounded-full bg-[#F7F3E8] px-3 py-1 text-xs font-semibold">
                        {
                          selectedParticipant.city
                        }
                      </span>
                    )}

                    {selectedParticipant.interestCategory && (
                      <span className="rounded-full bg-[#F7F3E8] px-3 py-1 text-xs font-semibold">
                        {
                          selectedParticipant.interestCategory
                        }
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    connectParticipant
                  }
                  disabled={connecting}
                  className="rounded-2xl bg-[#17382A] px-6 py-3 text-sm font-bold text-[#F7F3E8] transition hover:bg-[#214B39] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {connecting
                    ? "Connecting..."
                    : "Connect"}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* =================================================
            CONNECTION LIST
        ================================================= */}

        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#17382A]/40">
                Your network
              </p>

              <h2 className="mt-1 font-display text-2xl font-semibold">
                My Connections
              </h2>
            </div>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold">
              {connections.length}
            </span>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="rounded-[24px] bg-white p-8 text-sm text-[#17382A]/50">
              Loading connections...
            </div>
          ) : connections.length === 0 ? (
            /* EMPTY */

            <div className="rounded-[28px] border border-dashed border-[#17382A]/15 bg-white p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F3E8] text-2xl">
                ◌
              </div>

              <h3 className="mt-4 font-display text-xl font-semibold">
                No connections yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#17382A]/50">
                Meet people during JCWF
                and connect with them using
                their Reconnect ID.
              </p>
            </div>
          ) : (
            /* CONNECTIONS */

            <div className="grid gap-4 sm:grid-cols-2">
              {connections.map(
                (connection) => {
                  const person =
                    connection.connected_participant;

                  return (
                    <div
                      key={connection.id}
                      className="rounded-[24px] bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-xl font-semibold">
                            {
                              person.full_name
                            }
                          </h3>

                          <p className="mt-1 text-sm text-[#17382A]/45">
                            {
                              person.reconnect_id
                            }
                          </p>
                        </div>

                        <span className="rounded-full bg-[#DCE9DC] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#17382A]">
                          Connected
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {person.city && (
                          <span className="rounded-full bg-[#F7F3E8] px-3 py-1 text-xs font-medium">
                            {person.city}
                          </span>
                        )}

                        {person.interest_category && (
                          <span className="rounded-full bg-[#F7F3E8] px-3 py-1 text-xs font-medium">
                            {
                              person.interest_category
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}