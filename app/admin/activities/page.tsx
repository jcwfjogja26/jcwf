"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";

type VerificationStatus =
  | "pending"
  | "verified"
  | "rejected";

type Booking = {
  id: string;
  booking_code: string | null;
  quantity: number;
  total_amount: number;
  payment_status: string;
  status: string;
  registered_at: string;

  participant: {
    id: string;
    full_name: string;
    email: string;
    whatsapp: string;
    reconnect_id: string;
  } | null;

  activity: {
    id: string;
    title: string;
    slug: string;
    category: string;
    event_date: string;
    start_time: string;
    end_time: string;
    location: string;
    price: number;
  } | null;

  payment: {
    id: string;
    payment_method: string;
    amount: number;
    status: string;
    verification_status: VerificationStatus;
    paid_at: string | null;
    verified_at: string | null;
    verified_by: string | null;
  } | null;
};

export default function AdminActivitiesPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<"all" | VerificationStatus>("all");

  const [processingPaymentId, setProcessingPaymentId] =
    useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(
        "/api/admin/activity-payments",
        {
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal mengambil data activity bookings."
        );
      }

      setBookings(data.bookings ?? []);
    } catch (error) {
      console.error(
        "LOAD ACTIVITY BOOKINGS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Gagal memuat activity bookings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleVerification = async (
    paymentId: string,
    action: "verify" | "reject"
  ) => {
    if (!paymentId) {
      alert("Payment ID tidak ditemukan.");
      return;
    }

    const message =
      action === "verify"
        ? "Are you sure you want to verify this payment?"
        : "Are you sure you want to reject this payment?";

    const confirmed = window.confirm(message);

    if (!confirmed) return;

    try {
      setProcessingPaymentId(paymentId);

      const response = await fetch(
        `/api/admin/activity-payments/${paymentId}/${action}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${action} payment.`
        );
      }

      await fetchBookings();

      alert(
        action === "verify"
          ? "Payment berhasil diverifikasi."
          : "Payment berhasil ditolak."
      );
    } catch (error) {
      console.error(
        `${action.toUpperCase()} PAYMENT ERROR:`,
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : `Gagal melakukan ${action} payment.`
      );
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return bookings.filter((booking) => {
      const verificationStatus =
        booking.payment?.verification_status ??
        "pending";

      const matchesFilter =
        filter === "all" ||
        verificationStatus === filter;

      if (!matchesFilter) return false;

      if (!keyword) return true;

      const participantName =
        booking.participant?.full_name ??
        "";

      const participantEmail =
        booking.participant?.email ?? "";

      const reconnectId =
        booking.participant?.reconnect_id ??
        "";

      const bookingCode =
        booking.booking_code ?? "";

      const activityTitle =
        booking.activity?.title ?? "";

      return [
        participantName,
        participantEmail,
        reconnectId,
        bookingCode,
        activityTitle,
      ].some((value) =>
        value
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [bookings, filter, search]);

  const stats = useMemo(() => {
    let paid = 0;
    let pending = 0;
    let verified = 0;
    let rejected = 0;

    bookings.forEach((booking) => {
      if (
        booking.payment_status === "paid"
      ) {
        paid++;
      }

      const status =
        booking.payment?.verification_status ??
        "pending";

      if (status === "pending") {
        pending++;
      }

      if (status === "verified") {
        verified++;
      }

      if (status === "rejected") {
        rejected++;
      }
    });

    return {
      total: bookings.length,
      paid,
      pending,
      verified,
      rejected,
    };
  }, [bookings]);

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F7F3E8] text-[#17382A]">
        {/* =========================
            HEADER
        ========================= */}

        <header className="sticky top-0 z-40 border-b border-[#17382A]/10 bg-[#F7F3E8]/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#C89B3C]">
                JCWF 2026
              </p>

              <h1 className="font-display text-xl font-semibold">
                Activity Bookings
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchBookings}
                className="hidden rounded-full border border-[#17382A]/10 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-[#DCE9DC] sm:block"
              >
                ↻ Refresh
              </button>

              <Link
                href="/admin"
                className="rounded-full border border-[#17382A]/10 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-[#DCE9DC]"
              >
                Dashboard
              </Link>

              <Link
                href="/admin/scanner"
                className="rounded-full bg-[#17382A] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Open Scanner
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
          {/* =========================
              INTRO
          ========================= */}

          <section className="mb-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
                  Festival Activities
                </p>

                <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
                  Activity Bookings
                </h2>

                <p className="mt-3 max-w-2xl text-[#17382A]/60">
                  Review participant activity
                  bookings and verify their
                  payment status.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start rounded-full bg-[#DCE9DC] px-4 py-2.5 text-xs font-bold text-[#17382A] md:self-auto">
                <span className="h-2 w-2 rounded-full bg-[#17382A]" />
                Payment Verification
              </div>
            </div>
          </section>

          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>

              <button
                type="button"
                onClick={fetchBookings}
                className="self-start font-semibold underline sm:self-auto"
              >
                Retry
              </button>
            </div>
          )}

          {/* =========================
              STATS
          ========================= */}

          <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              label="Total Bookings"
              value={
                loading
                  ? "—"
                  : stats.total
              }
              description="All activity bookings"
              icon="◈"
            />

            <StatCard
              label="Paid"
              value={
                loading
                  ? "—"
                  : stats.paid
              }
              description="Payment submitted"
              icon="✓"
            />

            <StatCard
              label="Pending"
              value={
                loading
                  ? "—"
                  : stats.pending
              }
              description="Waiting verification"
              icon="◷"
            />

            <StatCard
              label="Verified"
              value={
                loading
                  ? "—"
                  : stats.verified
              }
              description="Confirmed payments"
              icon="✓"
            />

            <StatCard
              label="Rejected"
              value={
                loading
                  ? "—"
                  : stats.rejected
              }
              description="Rejected payments"
              icon="×"
            />
          </section>

          {/* =========================
              FILTER
          ========================= */}

          <section className="mb-6 rounded-[28px] bg-white p-5 shadow-[0_12px_35px_rgba(23,56,42,0.06)] md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#17382A]/30">
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search participant, booking code, or activity..."
                  className="w-full rounded-2xl border border-[#17382A]/10 bg-[#F7F3E8] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#17382A]/30 focus:border-[#17382A]/30"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <FilterButton
                  active={filter === "all"}
                  onClick={() =>
                    setFilter("all")
                  }
                >
                  All
                </FilterButton>

                <FilterButton
                  active={
                    filter === "pending"
                  }
                  onClick={() =>
                    setFilter("pending")
                  }
                >
                  Pending
                </FilterButton>

                <FilterButton
                  active={
                    filter === "verified"
                  }
                  onClick={() =>
                    setFilter("verified")
                  }
                >
                  Verified
                </FilterButton>

                <FilterButton
                  active={
                    filter === "rejected"
                  }
                  onClick={() =>
                    setFilter("rejected")
                  }
                >
                  Rejected
                </FilterButton>
              </div>
            </div>
          </section>

          {/* =========================
              BOOKINGS
          ========================= */}

          <section className="overflow-hidden rounded-[32px] bg-white shadow-[0_16px_50px_rgba(23,56,42,0.08)]">
            <div className="flex flex-col gap-2 border-b border-[#17382A]/8 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
                  Booking Management
                </p>

                <h3 className="mt-1 font-display text-2xl font-semibold">
                  Payment Verification
                </h3>
              </div>

              <p className="text-xs text-[#17382A]/40">
                Showing{" "}
                {filteredBookings.length}{" "}
                of {bookings.length} bookings
              </p>
            </div>

            {loading ? (
              <LoadingState />
            ) : filteredBookings.length ===
              0 ? (
              <EmptyState
                search={search}
                filter={filter}
              />
            ) : (
              <>
                {/* =========================
                    DESKTOP TABLE
                ========================= */}

                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[1050px]">
                    <thead>
                      <tr className="border-b border-[#17382A]/8 bg-[#F7F3E8]/60 text-left">
                        <th className="px-7 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#17382A]/40">
                          Participant
                        </th>

                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#17382A]/40">
                          Activity
                        </th>

                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#17382A]/40">
                          Booking
                        </th>

                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#17382A]/40">
                          Amount
                        </th>

                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#17382A]/40">
                          Payment
                        </th>

                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#17382A]/40">
                          Verification
                        </th>

                        <th className="px-7 py-4 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-[#17382A]/40">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredBookings.map(
                        (booking) => (
                          <BookingRow
                            key={booking.id}
                            booking={booking}
                            processingPaymentId={
                              processingPaymentId
                            }
                            onVerification={
                              handleVerification
                            }
                          />
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* =========================
                    MOBILE / TABLET
                ========================= */}

                <div className="divide-y divide-[#17382A]/8 lg:hidden">
                  {filteredBookings.map(
                    (booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        processingPaymentId={
                          processingPaymentId
                        }
                        onVerification={
                          handleVerification
                        }
                      />
                    )
                  )}
                </div>
              </>
            )}
          </section>

          {/* =========================
              FOOTER
          ========================= */}

          <div className="mt-8 flex flex-col items-center justify-between gap-3 text-center text-xs text-[#17382A]/35 sm:flex-row sm:text-left">
            <p>
              JCWF 2026 · Reconnecting —
              People, Culture & Wellbeing
            </p>

            <p>
              Payment verification is managed
              separately from participant payment
              status.
            </p>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}

/* =========================
   BOOKING ROW
========================= */

function BookingRow({
  booking,
  processingPaymentId,
  onVerification,
}: {
  booking: Booking;
  processingPaymentId: string | null;
  onVerification: (
    paymentId: string,
    action: "verify" | "reject"
  ) => void;
}) {
  const payment = booking.payment;

  const verificationStatus =
    payment?.verification_status ??
    "pending";

  const isProcessing =
    payment?.id === processingPaymentId;

  return (
    <tr className="border-b border-[#17382A]/6 last:border-0">
      {/* PARTICIPANT */}

      <td className="px-7 py-5">
        <div className="flex items-center gap-3">
          <Avatar
            name={
              booking.participant
                ?.full_name ?? "?"
            }
          />

          <div className="min-w-0">
            <p className="truncate font-semibold">
              {booking.participant
                ?.full_name ?? "-"}
            </p>

            <p className="mt-0.5 max-w-[180px] truncate text-xs text-[#17382A]/40">
              {booking.participant
                ?.email ?? "-"}
            </p>

            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#C89B3C]">
              {booking.participant
                ?.reconnect_id ?? "-"}
            </p>
          </div>
        </div>
      </td>

      {/* ACTIVITY */}

      <td className="px-5 py-5">
        <div className="min-w-[180px]">
          <p className="font-semibold">
            {booking.activity?.title ??
              "-"}
          </p>

          <p className="mt-1 text-xs capitalize text-[#17382A]/40">
            {booking.activity?.category ??
              "-"}
          </p>

          <p className="mt-1 text-xs text-[#17382A]/40">
            {formatDate(
              booking.activity?.event_date
            )}
          </p>
        </div>
      </td>

      {/* BOOKING */}

      <td className="px-5 py-5">
        <p className="font-mono text-xs font-semibold">
          {booking.booking_code ??
            booking.id.slice(0, 8)}
        </p>

        <p className="mt-1 text-xs text-[#17382A]/40">
          Qty: {booking.quantity}
        </p>
      </td>

      {/* AMOUNT */}

      <td className="px-5 py-5">
        <p className="font-semibold">
          {formatRupiah(
            booking.total_amount
          )}
        </p>

        <p className="mt-1 text-xs text-[#17382A]/40">
          {payment?.payment_method?.toUpperCase() ??
            "QRIS"}
        </p>
      </td>

      {/* PAYMENT */}

      <td className="px-5 py-5">
        <PaymentBadge
          status={booking.payment_status}
        />
      </td>

      {/* VERIFICATION */}

      <td className="px-5 py-5">
        <VerificationBadge
          status={verificationStatus}
        />
      </td>

      {/* ACTION */}

      <td className="px-7 py-5">
        {payment &&
        verificationStatus === "pending" ? (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() =>
                onVerification(
                  payment.id,
                  "verify"
                )
              }
              disabled={isProcessing}
              className="rounded-full bg-[#17382A] px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#244D3A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing
                ? "Processing..."
                : "Verify"}
            </button>

            <button
              type="button"
              onClick={() =>
                onVerification(
                  payment.id,
                  "reject"
                )
              }
              disabled={isProcessing}
              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing
                ? "..."
                : "Reject"}
            </button>
          </div>
        ) : (
          <div className="text-right text-xs text-[#17382A]/30">
            No action
          </div>
        )}
      </td>
    </tr>
  );
}

/* =========================
   MOBILE CARD
========================= */

function BookingCard({
  booking,
  processingPaymentId,
  onVerification,
}: {
  booking: Booking;
  processingPaymentId: string | null;
  onVerification: (
    paymentId: string,
    action: "verify" | "reject"
  ) => void;
}) {
  const payment = booking.payment;

  const verificationStatus =
    payment?.verification_status ??
    "pending";

  const isProcessing =
    payment?.id === processingPaymentId;

  return (
    <div className="p-5">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            name={
              booking.participant
                ?.full_name ?? "?"
            }
          />

          <div className="min-w-0">
            <p className="truncate font-semibold">
              {booking.participant
                ?.full_name ?? "-"}
            </p>

            <p className="truncate text-xs text-[#17382A]/40">
              {booking.participant
                ?.reconnect_id ?? "-"}
            </p>
          </div>
        </div>

        <VerificationBadge
          status={verificationStatus}
        />
      </div>

      {/* ACTIVITY */}

      <div className="mt-5 rounded-2xl bg-[#F7F3E8] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#C89B3C]">
          Activity
        </p>

        <p className="mt-1 font-display text-xl font-semibold">
          {booking.activity?.title ??
            "-"}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#17382A]/45">
          <span>
            {formatDate(
              booking.activity?.event_date
            )}
          </span>

          <span>
            {formatTime(
              booking.activity?.start_time
            )}{" "}
            –{" "}
            {formatTime(
              booking.activity?.end_time
            )}
          </span>

          <span>
            {booking.activity?.location ??
              "-"}
          </span>
        </div>
      </div>

      {/* DETAILS */}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <DetailItem
          label="Booking"
          value={
            booking.booking_code ??
            booking.id.slice(0, 8)
          }
        />

        <DetailItem
          label="Quantity"
          value={`${booking.quantity}`}
        />

        <DetailItem
          label="Amount"
          value={formatRupiah(
            booking.total_amount
          )}
        />

        <DetailItem
          label="Payment"
          value={
            payment?.payment_method?.toUpperCase() ??
            "QRIS"
          }
        />
      </div>

      {/* STATUS */}

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#17382A]/8 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#17382A]/35">
            Payment Status
          </p>

          <div className="mt-1">
            <PaymentBadge
              status={
                booking.payment_status
              }
            />
          </div>
        </div>

        {payment?.paid_at && (
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#17382A]/35">
              Paid At
            </p>

            <p className="mt-1 text-xs font-semibold">
              {formatDateTime(
                payment.paid_at
              )}
            </p>
          </div>
        )}
      </div>

      {/* ACTION */}

      {payment &&
      verificationStatus === "pending" ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              onVerification(
                payment.id,
                "verify"
              )
            }
            disabled={isProcessing}
            className="rounded-2xl bg-[#17382A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#244D3A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing
              ? "Processing..."
              : "✓ Verify Payment"}
          </button>

          <button
            type="button"
            onClick={() =>
              onVerification(
                payment.id,
                "reject"
              )
            }
            disabled={isProcessing}
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing
              ? "..."
              : "× Reject"}
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-[#F7F3E8] px-4 py-3 text-center text-xs font-semibold text-[#17382A]/35">
          This payment has already been
          reviewed.
        </div>
      )}
    </div>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: number | string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-[26px] bg-white p-5 shadow-[0_12px_35px_rgba(23,56,42,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#17382A]/50">
            {label}
          </p>

          <p className="mt-2 font-display text-4xl font-semibold">
            {value}
          </p>

          <p className="mt-1 text-xs text-[#17382A]/35">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#DCE9DC] text-sm font-bold">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================
   FILTER BUTTON
========================= */

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2.5 text-xs font-bold transition ${
        active
          ? "bg-[#17382A] text-white"
          : "bg-[#F7F3E8] text-[#17382A]/55 hover:bg-[#DCE9DC]"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================
   BADGES
========================= */

function PaymentBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toLowerCase();

  const isPaid =
    normalized === "paid";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
        isPaid
          ? "bg-[#DCE9DC] text-[#17382A]"
          : "bg-[#F7F3E8] text-[#17382A]/45"
      }`}
    >
      {status}
    </span>
  );
}

function VerificationBadge({
  status,
}: {
  status: VerificationStatus;
}) {
  const styles = {
    pending:
      "bg-[#FFF4D6] text-[#8A6516]",
    verified:
      "bg-[#DCE9DC] text-[#17382A]",
    rejected:
      "bg-red-50 text-red-700",
  };

  const labels = {
    pending: "Pending",
    verified: "Verified",
    rejected: "Rejected",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

/* =========================
   DETAIL ITEM
========================= */

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#17382A]/8 bg-white p-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#17382A]/35">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold">
        {value}
      </p>
    </div>
  );
}

/* =========================
   AVATAR
========================= */

function Avatar({
  name,
}: {
  name: string;
}) {
  const initial =
    name?.charAt(0)?.toUpperCase() ||
    "?";

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DCE9DC] font-display text-lg font-semibold text-[#17382A]">
      {initial}
    </div>
  );
}

/* =========================
   LOADING
========================= */

function LoadingState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#17382A]/10 border-t-[#17382A]" />

        <p className="text-sm text-[#17382A]/45">
          Loading activity bookings...
        </p>
      </div>
    </div>
  );
}

/* =========================
   EMPTY
========================= */

function EmptyState({
  search,
  filter,
}: {
  search: string;
  filter: "all" | VerificationStatus;
}) {
  const hasFilter =
    search.trim() ||
    filter !== "all";

  return (
    <div className="flex min-h-[300px] items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCE9DC] text-xl">
          ◈
        </div>

        <h4 className="font-display text-xl font-semibold">
          {hasFilter
            ? "No matching bookings"
            : "No activity bookings yet"}
        </h4>

        <p className="mx-auto mt-2 max-w-sm text-sm text-[#17382A]/45">
          {hasFilter
            ? "Try changing your search or verification filter."
            : "Activity bookings will appear here when participants register."}
        </p>
      </div>
    </div>
  );
}

/* =========================
   FORMATTERS
========================= */

function formatRupiah(
  amount: number
) {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }
  ).format(amount || 0);
}

function formatDate(
  date?: string | null
) {
  if (!date) return "-";

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(`${date}T00:00:00`));
}

function formatTime(
  time?: string | null
) {
  if (!time) return "-";

  return time.slice(0, 5);
}

function formatDateTime(
  date?: string | null
) {
  if (!date) return "-";

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  ).format(new Date(date));
}