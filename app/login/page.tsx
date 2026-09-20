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
    <main className="min-h-screen bg-ivory">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-2">

        {/* LEFT */}
        <section className="hidden flex-col justify-between bg-forest p-10 text-ivory lg:flex xl:p-14">
          <Link
            href="/"
            className="font-display text-3xl font-semibold tracking-[-0.04em]"
          >
            JCWF
            <span className="text-gold">.</span>
          </Link>

          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {isEnglish
                ? "Welcome back"
                : "Selamat datang kembali"}
            </p>

            <h1 className="mt-5 font-display text-6xl leading-[1.02] tracking-[-0.04em]">
              {isEnglish
                ? "Continue your journey."
                : "Lanjutkan perjalananmu."}
            </h1>

            <p className="mt-6 max-w-md text-sm leading-7 text-ivory/60">
              {isEnglish
                ? "Access your Reconnect ID, Digital Passport, activities, points, and moments from one place."
                : "Akses Reconnect ID, Digital Passport, aktivitas, points, dan moments kamu dalam satu tempat."}
            </p>
          </div>

          <p className="text-xs text-ivory/35">
            JCWF 2026 · Reconnecting — People, Culture & Wellbeing
          </p>
        </section>

        {/* RIGHT */}
        <section className="flex items-center justify-center px-6 py-12 md:px-10 lg:px-14">
          <div className="w-full max-w-[460px]">

            <Link
              href="/"
              className="inline-flex text-sm font-medium text-forest/50 transition hover:text-forest lg:hidden"
            >
              ←{" "}
              {isEnglish
                ? "Back to Home"
                : "Kembali ke Home"}
            </Link>

            <div className="mt-12 lg:mt-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                My JCWF
              </p>

              <h2 className="mt-4 font-display text-5xl tracking-[-0.04em] text-forest">
                Let's reconnect.
              </h2>

              <p className="mt-4 text-sm leading-6 text-forest/55">
                {isEnglish
                  ? "Login to continue your JCWF journey."
                  : "Login untuk melanjutkan perjalanan JCWF kamu."}
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-10 space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-forest">
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
                    className="w-full rounded-2xl bg-white px-5 py-4 text-sm text-forest outline-none ring-1 ring-forest/8 transition placeholder:text-forest/25 focus:ring-2 focus:ring-gold/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-forest">
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
                    className="w-full rounded-2xl bg-white px-5 py-4 text-sm text-forest outline-none ring-1 ring-forest/8 transition placeholder:text-forest/25 focus:ring-2 focus:ring-gold/50"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-forest px-6 py-4 text-sm font-semibold text-ivory shadow-[0_10px_30px_rgba(23,56,42,0.12)] transition hover:-translate-y-0.5 hover:bg-gold hover:text-forest disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Logging in..."
                    : "Login"}{" "}
                  →
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-forest/50">
                {isEnglish
                  ? "Don't have an account?"
                  : "Belum punya akun?"}{" "}
                <Link
                  href="/register"
                  className="font-semibold text-forest underline decoration-gold decoration-2 underline-offset-4"
                >
                  {isEnglish
                    ? "Create account"
                    : "Buat akun"}
                </Link>
              </p>
            </div>
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