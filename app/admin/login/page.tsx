"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Login gagal."
        );
      }

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login gagal."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F3E8] text-[#17382A]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT */}
        <section className="relative hidden overflow-hidden bg-[#17382A] lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#D9A441]/15 blur-3xl" />

          <div className="relative z-10 p-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#D9A441]">
              JCWF 2026
            </p>

            <h1 className="mt-5 max-w-lg font-display text-6xl font-semibold leading-[1.02] text-white">
              Festival
              <br />
              Control
              <br />
              Center.
            </h1>

            <p className="mt-6 max-w-md text-sm leading-6 text-white/50">
              Manage participant
              attendance, daily tickets,
              and festival check-ins from
              one place.
            </p>
          </div>

          <div className="relative z-10 p-10">
            <p className="text-xs text-white/30">
              Reconnecting — People,
              Culture & Wellbeing
            </p>

            <p className="mt-2 text-xs text-white/20">
              06 — 08 November 2026 ·
              Yogyakarta
            </p>
          </div>
        </section>

        {/* RIGHT */}
        <section className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* MOBILE BRAND */}
            <div className="mb-12 lg:hidden">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C89B3C]">
                JCWF 2026
              </p>

              <h1 className="mt-3 font-display text-4xl font-semibold">
                Admin Portal
              </h1>
            </div>

            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
                Secure Access
              </p>

              <h2 className="mt-2 font-display text-4xl font-semibold">
                Welcome back.
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#17382A]/50">
                Sign in to access the JCWF
                administration dashboard.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="admin@jcwf.id"
                  required
                  className="w-full rounded-2xl border border-[#17382A]/10 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#17382A]/25 focus:border-[#17382A]/30 focus:ring-4 focus:ring-[#DCE9DC]"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-2xl border border-[#17382A]/10 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#17382A]/25 focus:border-[#17382A]/30 focus:ring-4 focus:ring-[#DCE9DC]"
                />
              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#17382A] px-5 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Signing in..."
                  : "Sign In"}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#17382A]/30">
              <span className="h-1.5 w-1.5 rounded-full bg-[#17382A]/30" />
              Authorized personnel only
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}