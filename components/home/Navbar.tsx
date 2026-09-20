"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

const menuItems = [
  { key: "about", href: "#about" },
  { key: "program", href: "#activities" },
  { key: "schedule", href: "#schedule" },
  { key: "marketplace", href: "#marketplace" },
  { key: "faq", href: "#faq" },
] as const;

type Participant = {
  id: string;
  fullName: string;
  reconnectId: string;
  email: string;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [participant, setParticipant] =
    useState<Participant | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  const { language, setLanguage, t } = useLanguage();

  // =========================
  // CHECK LOGIN SESSION
  // =========================

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/my", {
          cache: "no-store",
        });

        const data = await response.json();

        if (data.authenticated) {
          setParticipant(data.participant);
        }
      } catch (error) {
        console.error("SESSION CHECK ERROR:", error);
      }
    }

    checkSession();
  }, []);

  // =========================
  // CLOSE ACCOUNT DROPDOWN
  // =========================

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(
          event.target as Node
        )
      ) {
        setAccountOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================
  // LOGOUT
  // =========================

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/logout", {
        method: "POST",
      });

      window.location.href = "/";
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
      setLoggingOut(false);
    }
  }

  const firstName =
    participant?.fullName?.split(" ")[0] ?? "";

  return (
    <header className="sticky top-0 z-50 bg-ivory shadow-[0_4px_20px_rgba(23,56,42,0.04)]">
      <div className="mx-auto flex h-[78px] max-w-[1440px] items-center justify-between px-6 md:px-10 lg:px-14">
        {/* LOGO */}
        <a
          href="/"
          className="group flex items-center font-display text-[28px] font-semibold tracking-[-0.04em] text-forest"
        >
          JCWF
          <span className="ml-1 text-gold transition-transform duration-300 group-hover:rotate-12">
            .
          </span>
        </a>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-7 lg:flex">
          {menuItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="group relative text-[14px] font-medium text-forest/70 transition-colors duration-300 hover:text-forest"
            >
              {t.nav[item.key]}

              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-4 lg:flex">
          {/* LANGUAGE */}
          <div className="flex items-center rounded-full bg-forest/5 p-1">
            <button
              type="button"
              onClick={() => setLanguage("id")}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] transition-all ${
                language === "id"
                  ? "bg-forest text-ivory shadow-sm"
                  : "text-forest/45 hover:text-forest"
              }`}
            >
              ID
            </button>

            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] transition-all ${
                language === "en"
                  ? "bg-forest text-ivory shadow-sm"
                  : "text-forest/45 hover:text-forest"
              }`}
            >
              EN
            </button>
          </div>

          {/* ACCOUNT / REGISTER */}
          {participant ? (
            <div
              ref={accountRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setAccountOpen(!accountOpen)
                }
                className="flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-[0_5px_20px_rgba(23,56,42,0.06)] transition hover:shadow-[0_8px_25px_rgba(23,56,42,0.1)]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-xs font-semibold text-ivory">
                  {firstName.charAt(0).toUpperCase()}
                </span>

                <span className="max-w-[100px] truncate text-xs font-semibold text-forest">
                  {firstName}
                </span>

                <span
                  className={`text-xs text-forest/40 transition-transform ${
                    accountOpen ? "rotate-180" : ""
                  }`}
                >
                  ↓
                </span>
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl bg-white p-2 shadow-[0_18px_45px_rgba(23,56,42,0.12)]">
                  {/* ACCOUNT INFO */}
                  <div className="rounded-xl bg-ivory px-4 py-3">
                    <p className="text-sm font-semibold text-forest">
                      {participant.fullName}
                    </p>

                    <p className="mt-1 text-[11px] text-forest/40">
                      {participant.reconnectId}
                    </p>
                  </div>

                  {/* MY JCWF */}
                  <a
                    href="/my"
                    onClick={() =>
                      setAccountOpen(false)
                    }
                    className="mt-1 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-forest transition hover:bg-sage/40"
                  >
                    <span>My JCWF</span>
                    <span className="text-forest/35">
                      →
                    </span>
                  </a>

                  {/* LOGOUT */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <span>
                      {loggingOut
                        ? "Logging out..."
                        : "Logout"}
                    </span>

                    <span>↗</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="#register"
              className="group inline-flex items-center gap-3 rounded-full bg-forest px-5 py-3 text-[13px] font-semibold text-ivory shadow-[0_8px_25px_rgba(23,56,42,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest hover:shadow-[0_10px_28px_rgba(200,155,60,0.2)]"
            >
              {t.nav.register}

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          )}
        </div>

        {/* MOBILE ACTIONS */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* LANGUAGE */}
          <div className="flex items-center rounded-full bg-forest/5 p-1">
            <button
              type="button"
              onClick={() => setLanguage("id")}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] transition-all ${
                language === "id"
                  ? "bg-forest text-ivory"
                  : "text-forest/45"
              }`}
            >
              ID
            </button>

            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] transition-all ${
                language === "en"
                  ? "bg-forest text-ivory"
                  : "text-forest/45"
              }`}
            >
              EN
            </button>
          </div>

          {/* ACCOUNT */}
          {participant && (
            <a
              href="/my"
              aria-label="My JCWF"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-xs font-semibold text-ivory"
            >
              {firstName.charAt(0).toUpperCase()}
            </a>
          )}

          {/* MENU */}
          <button
            type="button"
            aria-label="Buka menu"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/5 transition-colors hover:bg-forest/10"
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-[1.5px] w-4 bg-forest" />
              <span className="block h-[1.5px] w-3 bg-forest" />
            </span>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`overflow-hidden transition-all duration-300 lg:hidden ${
          isOpen ? "max-h-[520px]" : "max-h-0"
        }`}
      >
        <nav className="mx-6 mb-4 rounded-3xl bg-white p-4 shadow-[0_12px_35px_rgba(23,56,42,0.08)] md:mx-10">
          <div className="flex flex-col">
            {menuItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm text-forest/70 transition-colors hover:bg-sage/50 hover:text-forest"
              >
                {t.nav[item.key]}
              </a>
            ))}

            {participant ? (
              <>
                <div className="my-2 border-t border-forest/5" />

                <a
                  href="/my"
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl bg-forest px-4 py-3 text-center text-sm font-semibold text-ivory"
                >
                  My JCWF →
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  disabled={loggingOut}
                  className="mt-2 rounded-2xl px-4 py-3 text-center text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {loggingOut
                    ? "Logging out..."
                    : "Logout"}
                </button>
              </>
            ) : (
              <a
                href="#register"
                onClick={() => setIsOpen(false)}
                className="mt-2 rounded-2xl bg-forest px-4 py-3 text-center text-sm font-semibold text-ivory"
              >
                {t.nav.register} →
              </a>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}