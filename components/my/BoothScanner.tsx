"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Card = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  points?: number;
};

type ScanResult = {
  success: boolean;
  alreadyCollected?: boolean;
  message?: string;
  card?: Card;
  booth?: {
    id?: string;
    name?: string;
    location?: string | null;
  };
  collection?: {
    id?: string;
    collectedAt?: string;
  };
  pointsEarned?: number;
};

export default function BoothScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);

  const [scanning, setScanning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  /*
   * Force-stop the actual browser camera stream.
   */
  const stopCameraTracks = useCallback(() => {
    const container = document.getElementById("booth-qr-reader");

    if (!container) return;

    const video = container.querySelector("video");

    if (!video) return;

    const stream = video.srcObject as MediaStream | null;

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });

      video.srcObject = null;
    }
  }, []);

  /*
   * Completely stop scanner.
   */
  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;

    try {
      if (scanner?.isScanning) {
        await scanner.stop();
      }
    } catch {
      // Continue cleanup.
    }

    stopCameraTracks();

    try {
      scanner?.clear();
    } catch {
      // Ignore cleanup errors.
    }

    scannerRef.current = null;

    setScanning(false);
    setStarting(false);
  }, [stopCameraTracks]);

  /*
   * Process scanned QR.
   */
  const handleScan = useCallback(
    async (decodedText: string) => {
      if (processingRef.current) return;

      processingRef.current = true;

      setLoading(true);
      setError("");

      try {
        await stopScanner();

        const response = await fetch("/api/collection/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: decodedText.trim(),
          }),
        });

        const data: ScanResult = await response.json();

        /*
         * IMPORTANT:
         * Duplicate is a valid scanner result.
         * It should NOT appear as a generic error.
         */
        if (response.status === 409 && data.alreadyCollected) {
          setResult(data);
          return;
        }

        if (!response.ok) {
          setError(
            data.message ||
              "This QR code could not be processed."
          );
          return;
        }

        setResult(data);
      } catch {
        setError(
          "Something went wrong while processing the QR code."
        );
      } finally {
        setLoading(false);
        processingRef.current = false;
      }
    },
    [stopScanner]
  );

  /*
   * Start camera.
   */
  const startScanner = useCallback(async () => {
    if (scannerRef.current) return;

    setError("");
    setStarting(true);

    try {
      const scanner = new Html5Qrcode("booth-qr-reader");

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
          // Ignore normal QR frame errors.
        }
      );

      setScanning(true);
    } catch (error) {
      console.error("Booth scanner error:", error);

      scannerRef.current = null;
      setScanning(false);

      setError(
        "Camera could not be opened. Please allow camera access and try again."
      );
    } finally {
      setStarting(false);
    }
  }, [handleScan]);

  /*
   * Cleanup on page exit.
   */
  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner?.isScanning) {
        scanner.stop().catch(() => {});
      }

      stopCameraTracks();
    };
  }, [stopCameraTracks]);

  /*
   * Scan another booth.
   */
  const handleScanAnother = async () => {
    setResult(null);
    setError("");
    setLoading(false);

    await new Promise((resolve) => setTimeout(resolve, 100));

    startScanner();
  };

  /*
   * Back to scanner ready state.
   */
  const handleBackToScanner = () => {
    setResult(null);
    setError("");
  };

  const isDuplicate = result?.alreadyCollected === true;

  return (
    <div className="w-full">
      {/* =====================================================
          SCANNER
      ====================================================== */}

      {!result && (
        <section
          className="overflow-hidden rounded-[32px]"
          style={{
            backgroundColor: "#17382A",
          }}
        >
          {/* HEADER */}
          <div className="flex items-start justify-between px-8 pb-5 pt-8 sm:px-10 sm:pt-9">
            <div>
              <p
                className="text-[13px] font-semibold uppercase tracking-[0.22em]"
                style={{
                  color: "#D4A63A",
                }}
              >
                Booth Scanner
              </p>

              <h2
                className="mt-3 font-serif text-4xl leading-tight sm:text-5xl"
                style={{
                  color: "#F7F3E8",
                }}
              >
                Scan Booth QR
              </h2>
            </div>

            <a
              href="/my"
              aria-label="Back to My"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl transition hover:opacity-80"
              style={{
                backgroundColor: "rgba(255,255,255,0.10)",
                color: "#F7F3E8",
              }}
            >
              ×
            </a>
          </div>

          {/* CAMERA */}
          <div
            className="relative mx-5 mb-5 overflow-hidden rounded-[28px] sm:mx-10 sm:mb-8"
            style={{
              minHeight: "500px",
              backgroundColor: "#08291F",
            }}
          >
            {/* Scanner container ALWAYS exists */}
            <div
              id="booth-qr-reader"
              className="absolute inset-0 w-full"
            />

            {/* READY */}
            {!scanning && !starting && (
              <div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 py-12 text-center"
                style={{
                  backgroundColor: "#08291F",
                }}
              >
                <div
                  className="flex h-36 w-36 items-center justify-center rounded-[38px]"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.10)",
                  }}
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-lg border-[3px]"
                    style={{
                      borderColor: "#F7F3E8",
                    }}
                  >
                    <div
                      className="h-8 w-8"
                      style={{
                        backgroundColor: "#F7F3E8",
                      }}
                    />
                  </div>
                </div>

                <h3
                  className="mt-12 font-serif text-4xl sm:text-5xl"
                  style={{
                    color: "#F7F3E8",
                  }}
                >
                  Ready to Scan?
                </h3>

                <p
                  className="mt-5 max-w-xl text-base leading-8 sm:text-lg"
                  style={{
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  Open the camera and position the booth QR
                  code inside the scanning frame.
                </p>

                <button
                  type="button"
                  onClick={startScanner}
                  className="mt-10 rounded-full px-10 py-4 text-base font-medium transition hover:opacity-90"
                  style={{
                    backgroundColor: "#D4A63A",
                    color: "#17382A",
                  }}
                >
                  Open Camera
                </button>
              </div>
            )}

            {/* STARTING */}
            {starting && (
              <div
                className="absolute inset-0 z-20 flex items-center justify-center"
                style={{
                  backgroundColor: "#08291F",
                }}
              >
                <div
                  className="rounded-full px-5 py-3 text-sm"
                  style={{
                    backgroundColor: "rgba(23,56,42,0.90)",
                    color: "#F7F3E8",
                  }}
                >
                  Opening camera...
                </div>
              </div>
            )}

            {/* SCAN FRAME */}
            {scanning && !starting && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <div
                  className="h-[250px] w-[250px] rounded-[28px] border-2"
                  style={{
                    borderColor: "#D4A63A",
                  }}
                />
              </div>
            )}
          </div>

          {/* INFO */}
          <div
            className="mx-5 mb-5 flex items-start gap-5 rounded-[24px] px-6 py-5 sm:mx-10 sm:mb-8"
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-semibold"
              style={{
                backgroundColor: "#D4A63A",
                color: "#17382A",
              }}
            >
              i
            </div>

            <p
              className="text-sm leading-7 sm:text-base"
              style={{
                color: "rgba(255,255,255,0.65)",
              }}
            >
              Scan a valid JCWF booth QR code to collect its
              Collection Card. Each card can only be collected
              once.
            </p>
          </div>
        </section>
      )}

      {/* STOP CAMERA */}
      {!result && scanning && (
        <button
          type="button"
          onClick={stopScanner}
          className="mt-4 w-full rounded-2xl border px-5 py-3.5 text-sm font-semibold transition hover:bg-[#F7F9F5]"
          style={{
            borderColor: "rgba(23,56,42,0.15)",
            backgroundColor: "#FFFFFF",
            color: "#17382A",
          }}
        >
          Stop Camera
        </button>
      )}

      {/* ERROR */}
      {error && (
        <div
          className="mt-4 rounded-2xl border p-4 text-sm leading-6"
          style={{
            borderColor: "#F1CACA",
            backgroundColor: "#FFF5F5",
            color: "#A33A3A",
          }}
        >
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div
          className="mt-4 rounded-2xl p-4 text-center text-sm font-medium"
          style={{
            backgroundColor: "#EAF1EB",
            color: "#17382A",
          }}
        >
          Checking your collection...
        </div>
      )}

      {/* =====================================================
          RESULT
      ====================================================== */}

      {result && (
        <section
          className="overflow-hidden rounded-[32px] p-8 text-center sm:p-10"
          style={{
            backgroundColor: "#17382A",
          }}
        >
          {/* ICON */}
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl font-semibold"
            style={{
              backgroundColor: "#D4A63A",
              color: "#17382A",
            }}
          >
            {isDuplicate ? "✓" : "✓"}
          </div>

          {/* LABEL */}
          <p
            className="mt-7 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{
              color: "#D4A63A",
            }}
          >
            {isDuplicate
              ? "Already Collected"
              : "New Card Collected"}
          </p>

          {/* CARD NAME */}
          <h3
            className="mt-3 font-serif text-4xl"
            style={{
              color: "#F7F3E8",
            }}
          >
            {result.card?.name || "Collection Card"}
          </h3>

          {/* IMAGE */}
          {result.card?.imageUrl && (
            <div className="mx-auto mt-7 h-52 w-40 overflow-hidden rounded-2xl bg-white/10">
              <img
                src={result.card.imageUrl}
                alt={result.card.name || "Collection Card"}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* MESSAGE */}
          <p
            className="mx-auto mt-5 max-w-md text-sm leading-7"
            style={{
              color: "rgba(255,255,255,0.60)",
            }}
          >
            {isDuplicate
              ? `Kamu sudah memiliki ${result.card?.name || "card ini"} di My Collection.`
              : "Selamat! Card baru ini sudah masuk ke My Collection kamu."}
          </p>

          {/* POINTS ONLY FOR NEW CARD */}
          {!isDuplicate && (
            <div
              className="mt-7 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold"
              style={{
                backgroundColor: "#D4A63A",
                color: "#17382A",
              }}
            >
              +{result.pointsEarned ?? result.card?.points ?? 0} points
            </div>
          )}

          {/* ACTIONS */}
          <div className="mt-8 space-y-3">
            {!isDuplicate && (
              <a
                href="/my"
                className="block w-full rounded-full px-5 py-4 text-sm font-semibold transition hover:opacity-90"
                style={{
                  backgroundColor: "#D4A63A",
                  color: "#17382A",
                }}
              >
                View My Collection
              </a>
            )}

            {isDuplicate && (
              <a
                href="/my"
                className="block w-full rounded-full px-5 py-4 text-sm font-semibold transition hover:opacity-90"
                style={{
                  backgroundColor: "#D4A63A",
                  color: "#17382A",
                }}
              >
                View My Collection
              </a>
            )}

            <button
              type="button"
              onClick={handleScanAnother}
              className="w-full rounded-full border px-5 py-4 text-sm font-semibold transition hover:bg-white/10"
              style={{
                borderColor: "rgba(255,255,255,0.15)",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "#F7F3E8",
              }}
            >
              Scan Another Booth
            </button>

            <button
              type="button"
              onClick={handleBackToScanner}
              className="pt-2 text-sm transition hover:opacity-80"
              style={{
                color: "rgba(255,255,255,0.55)",
              }}
            >
              Back to Scanner
            </button>
          </div>

          {/* BOOTH INFO */}
          {result.booth && (
            <div
              className="mt-8 border-t pt-6 text-left"
              style={{
                borderColor: "rgba(255,255,255,0.10)",
              }}
            >
              <p
                className="text-xs uppercase tracking-[0.15em]"
                style={{
                  color: "rgba(255,255,255,0.40)",
                }}
              >
                Booth
              </p>

              <p
                className="mt-2 text-sm font-medium"
                style={{
                  color: "#F7F3E8",
                }}
              >
                {result.booth.name}
              </p>

              {result.booth.location && (
                <p
                  className="mt-1 text-sm"
                  style={{
                    color: "rgba(255,255,255,0.50)",
                  }}
                >
                  {result.booth.location}
                </p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}