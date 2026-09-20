"use client";

import {
  FormEvent,
  Suspense,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

function LoginForm() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEnglish = language === "en";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError(
        isEnglish
          ? "Please fill in your email and password."
          : "Email dan password wajib diisi."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            (isEnglish
              ? "Failed to login."
              : "Gagal login.")
        );
        return;
      }

      const redirect = searchParams.get("redirect");

      const safeRedirect =
        redirect && redirect.startsWith("/")
          ? redirect
          : "/my";

      window.location.href = safeRedirect;
    } catch (error) {
      console.error(error);

      setError(
        isEnglish
          ? "Something went wrong. Please try again."
          : "Terjadi kesalahan. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-ivory text-forest">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[0.92fr_1.08fr]">

        {/* =====================================================
            LEFT — DESKTOP
        ====================================================== */}
        <section className="relative hidden overflow-hidden bg-forest lg:flex">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-32 top-24 h-[420px] w-[420px] rounded-full border border-white/[0.07]" />

          <div className="pointer-events-none absolute -right-20 top-36 h-[280px] w-[280px] rounded-full border border-gold/[0.10]" />

          <div className="pointer-events-none absolute bottom-[-180px] left-[-120px] h-[480px] w-[480px] rounded-full bg-sage/[0.08]" />

          <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-10 xl:p-14 2xl:p-16">

            {/* Logo */}
            <Link
              href="/"
              className="w-fit font-display text-3xl font-semibold tracking-[-0.05em] text-ivory"
            >
              JCWF<span className="text-gold">.</span>
            </Link>

            {/* Main Copy */}
            <div className="max-w-[560px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold">
                {isEnglish
                  ? "Welcome back"
                  : "Selamat datang kembali"}
              </p>

              <h1 className="mt-6 font-display text-[clamp(4rem,6vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.06em] text-ivory">
                {isEnglish ? (
                  <>
                    Continue
                    <br />
                    <span className="text-gold">
                      your journey.
                    </span>
                  </>
                ) : (
                  <>
                    Lanjutkan
                    <br />
                    <span className="text-gold">
                      perjalananmu.
                    </span>
                  </>
                )}
              </h1>

              <p className="mt-8 max-w-md text-sm leading-7 text-ivory/55">
                {isEnglish
                  ? "Reconnect with your activities, moments, connections, and everything waiting for you at JCWF."
                  : "Akses aktivitas, moments, connections, dan perjalananmu bersama JCWF dari satu tempat."}
              </p>

              <div className="mt-12 flex items-center gap-4">
                <div className="h-px w-12 bg-gold/60" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/35">
                  People · Culture · Wellbeing
                </p>
              </div>
            </div>

            {/* Footer */}
            <p className="text-[10px] tracking-[0.08em] text-ivory/25">
              JCWF 2026
            </p>
          </div>
        </section>

        {/* =====================================================
            RIGHT — LOGIN
        ====================================================== */}
        <section className="relative flex min-h-screen items-center justify-center px-5 pb-10 pt-24 sm:px-8 md:px-12 md:py-12 lg:px-16 lg:py-16 xl:px-20">

          {/* =================================================
              MOBILE HEADER
          ================================================== */}
          <div className="absolute left-5 right-5 top-5 flex items-center justify-between sm:left-8 sm:right-8 lg:hidden">

            {/* Logo */}
            <Link
              href="/"
              className="font-display text-2xl font-semibold tracking-[-0.05em] text-forest"
            >
              JCWF<span className="text-gold">.</span>
            </Link>

            {/* Back Button */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-forest/10 bg-white/70 px-4 py-2 text-xs font-semibold text-forest shadow-[0_5px_18px_rgba(23,56,42,0.06)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-forest/15 hover:bg-sage"
            >
              

              {isEnglish
                ? "Back"
                : "Kembali"}
            </Link>
          </div>

          {/* Login Content */}
          <div className="w-full max-w-[480px]">

            {/* Heading */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                My JCWF
              </p>

              <h2 className="mt-4 font-display text-[clamp(3.2rem,10vw,5rem)] font-medium leading-[0.9] tracking-[-0.055em] text-forest">
                {isEnglish ? (
                  <>
                    Let's
                    <br />
                    <span className="text-gold">
                      reconnect.
                    </span>
                  </>
                ) : (
                  <>
                    Yuk,
                    <br />
                    <span className="text-gold">
                      reconnect.
                    </span>
                  </>
                )}
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-6 text-forest/50">
                {isEnglish
                  ? "Login to continue your JCWF journey."
                  : "Login untuk melanjutkan perjalanan JCWF kamu."}
              </p>
            </div>

            {/* =================================================
                FORM
            ================================================== */}
            <form
              onSubmit={handleSubmit}
              className="mt-10"
            >
              <div className="space-y-5">

                {/* Email */}
                <div>
                  <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest/55">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="nama@email.com"
                    autoComplete="email"
                    className="w-full rounded-[1.25rem] border border-[#DED9CA] bg-white px-5 py-4 text-sm text-forest shadow-[0_5px_20px_rgba(23,56,42,0.035)] outline-none transition-all placeholder:text-forest/25 focus:border-gold/60 focus:shadow-[0_0_0_4px_rgba(196,157,73,0.08)]"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest/55">
                    Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder={
                      isEnglish
                        ? "Enter your password"
                        : "Masukkan password"
                    }
                    autoComplete="current-password"
                    className="w-full rounded-[1.25rem] border border-[#DED9CA] bg-white px-5 py-4 text-sm text-forest shadow-[0_5px_20px_rgba(23,56,42,0.035)] outline-none transition-all placeholder:text-forest/25 focus:border-gold/60 focus:shadow-[0_0_0_4px_rgba(196,157,73,0.08)]"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-5 rounded-[1.25rem] border border-red-200/70 bg-red-50 px-4 py-3.5 text-sm leading-5 text-red-600">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-7 flex w-full items-center justify-center rounded-full bg-forest px-6 py-4 text-sm font-semibold text-ivory shadow-[0_12px_30px_rgba(23,56,42,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? isEnglish
                    ? "Logging in..."
                    : "Sedang login..."
                  : "Login"}
              </button>
            </form>

            {/* Create Account */}
            <div className="mt-8 border-t border-forest/8 pt-7 text-center">
              <p className="text-sm text-forest/45">
                {isEnglish
                  ? "Don't have an account?"
                  : "Belum punya akun?"}{" "}
                <Link
                  href="/register"
                  className="font-semibold text-forest underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-gold"
                >
                  {isEnglish
                    ? "Create account"
                    : "Buat akun"}
                </Link>
              </p>
            </div>

            {/* Mobile Footer */}
            <p className="mt-10 text-center text-[9px] font-medium uppercase tracking-[0.16em] text-forest/25 lg:hidden">
              Reconnecting — People · Culture · Wellbeing
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function LoginFallback() {
  return (
    <main className="min-h-screen bg-ivory" />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}