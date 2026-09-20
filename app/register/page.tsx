"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export default function RegisterPage() {
  const { t } = useLanguage();

  const interests = [
    {
      value: "SELF",
      title: t.register.form.interests.self.title,
      description:
        t.register.form.interests.self.description,
    },
    {
      value: "OTHERS",
      title: t.register.form.interests.others.title,
      description:
        t.register.form.interests.others.description,
    },
    {
      value: "NATURE",
      title: t.register.form.interests.nature.title,
      description:
        t.register.form.interests.nature.description,
    },
    {
      value: "CULTURE",
      title: t.register.form.interests.culture.title,
      description:
        t.register.form.interests.culture.description,
    },
  ];

  const [form, setForm] = useState({
    fullName: "",
    whatsapp: "",
    email: "",
    city: "",
    interest: "",
    password: "",
  });

  const [privacyConsent, setPrivacyConsent] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  const updateField = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setErrorMessage("");

    if (!privacyConsent) {
      setErrorMessage(
        t.register.errors.privacy
      );
      return;
    }

    if (!form.interest) {
      setErrorMessage(
        t.register.errors.interest
      );
      return;
    }

    if (form.password.length < 6) {
      setErrorMessage(
        t.register.errors.password
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: form.fullName,
            whatsapp: form.whatsapp,
            email: form.email,
            city: form.city,
            interest: form.interest,
            password: form.password,
            privacyConsent,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            t.register.errors.create
        );
      }

      window.location.href = "/my";
    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          t.register.errors.generic
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ivory">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-6 md:px-10 lg:px-14">
        <a
          href="/"
          className="font-display text-[28px] font-semibold tracking-[-0.04em] text-forest"
        >
          JCWF<span className="text-gold">.</span>
        </a>

        <a
          href="/"
          className="text-sm font-medium text-forest/60 transition-colors hover:text-forest"
        >
          {t.register.backHome}
        </a>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-[1180px] px-6 pb-20 pt-8 md:px-10 md:pt-14 lg:px-14">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">

          {/* LEFT */}
          <div className="lg:sticky lg:top-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t.register.eyebrow}
            </p>

            <h1 className="mt-4 max-w-lg font-display text-[clamp(3rem,6vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.05em] text-forest">
              {t.register.titleLine1}
              <br />
              <span className="text-gold">
                {t.register.titleLine2}
              </span>
            </h1>

            <p className="mt-7 max-w-md text-[15px] leading-7 text-forest/60">
              {t.register.intro}
            </p>

            <div className="mt-10 rounded-[2rem] bg-sage p-6 md:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest/50">
                {t.register.benefitsTitle}
              </p>

              <div className="mt-5 space-y-5">

                {/* BENEFIT 01 */}
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-sm text-ivory">
                    01
                  </div>

                  <div>
                    <p className="font-display text-lg text-forest">
                      {t.register.benefits.reconnectId.title}
                    </p>

                    <p className="mt-1 text-sm leading-5 text-forest/55">
                      {t.register.benefits.reconnectId.description}
                    </p>
                  </div>
                </div>

                {/* BENEFIT 02 */}
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-sm text-forest">
                    02
                  </div>

                  <div>
                    <p className="font-display text-lg text-forest">
                      {t.register.benefits.passport.title}
                    </p>

                    <p className="mt-1 text-sm leading-5 text-forest/55">
                      {t.register.benefits.passport.description}
                    </p>
                  </div>
                </div>

                {/* BENEFIT 03 */}
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm text-forest">
                    03
                  </div>

                  <div>
                    <p className="font-display text-lg text-forest">
                      {t.register.benefits.account.title}
                    </p>

                    <p className="mt-1 text-sm leading-5 text-forest/55">
                      {t.register.benefits.account.description}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(23,56,42,0.08)] md:p-9 lg:p-10">

            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                {t.register.form.eyebrow}
              </p>

              <h2 className="mt-2 font-display text-3xl text-forest md:text-4xl">
                {t.register.form.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-forest/50">
                {t.register.form.description}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* NAME */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-forest"
                >
                  {t.register.form.fullName}{" "}
                  <span className="text-gold">*</span>
                </label>

                <input
                  id="fullName"
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) =>
                    updateField(
                      "fullName",
                      e.target.value
                    )
                  }
                  placeholder={
                    t.register.form.fullNamePlaceholder
                  }
                  className="w-full rounded-2xl bg-ivory px-4 py-3.5 text-sm text-forest outline-none ring-1 ring-transparent transition-all placeholder:text-forest/30 focus:bg-white focus:ring-gold/50"
                />
              </div>

              {/* WHATSAPP + EMAIL */}
              <div className="grid gap-6 md:grid-cols-2">

                <div>
                  <label
                    htmlFor="whatsapp"
                    className="mb-2 block text-sm font-semibold text-forest"
                  >
                    {t.register.form.whatsapp}{" "}
                    <span className="text-gold">*</span>
                  </label>

                  <input
                    id="whatsapp"
                    type="tel"
                    required
                    value={form.whatsapp}
                    onChange={(e) =>
                      updateField(
                        "whatsapp",
                        e.target.value
                      )
                    }
                    placeholder={
                      t.register.form.whatsappPlaceholder
                    }
                    className="w-full rounded-2xl bg-ivory px-4 py-3.5 text-sm text-forest outline-none ring-1 ring-transparent transition-all placeholder:text-forest/30 focus:bg-white focus:ring-gold/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-forest"
                  >
                    {t.register.form.email}{" "}
                    <span className="text-gold">*</span>
                  </label>

                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      updateField(
                        "email",
                        e.target.value
                      )
                    }
                    placeholder={
                      t.register.form.emailPlaceholder
                    }
                    className="w-full rounded-2xl bg-ivory px-4 py-3.5 text-sm text-forest outline-none ring-1 ring-transparent transition-all placeholder:text-forest/30 focus:bg-white focus:ring-gold/50"
                  />
                </div>

              </div>

              {/* CITY */}
              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-semibold text-forest"
                >
                  {t.register.form.city}{" "}
                  <span className="text-gold">*</span>
                </label>

                <input
                  id="city"
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) =>
                    updateField(
                      "city",
                      e.target.value
                    )
                  }
                  placeholder={
                    t.register.form.cityPlaceholder
                  }
                  className="w-full rounded-2xl bg-ivory px-4 py-3.5 text-sm text-forest outline-none ring-1 ring-transparent transition-all placeholder:text-forest/30 focus:bg-white focus:ring-gold/50"
                />
              </div>

              {/* INTEREST */}
              <div>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-forest">
                    {t.register.form.interest}{" "}
                    <span className="text-gold">*</span>
                  </p>

                  <p className="mt-1 text-xs text-forest/45">
                    {t.register.form.interestDescription}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {interests.map((interest) => {
                    const selected =
                      form.interest ===
                      interest.value;

                    return (
                      <button
                        key={interest.value}
                        type="button"
                        onClick={() =>
                          updateField(
                            "interest",
                            interest.value
                          )
                        }
                        className={`rounded-2xl p-4 text-left transition-all ${
                          selected
                            ? "bg-forest text-ivory shadow-md"
                            : "bg-ivory text-forest hover:bg-sage"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display text-xl">
                            {interest.title}
                          </span>

                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                              selected
                                ? "bg-gold text-forest"
                                : "bg-white text-forest/20"
                            }`}
                          >
                            {selected ? "✓" : ""}
                          </span>
                        </div>

                        <p
                          className={`mt-2 text-xs leading-5 ${
                            selected
                              ? "text-ivory/60"
                              : "text-forest/50"
                          }`}
                        >
                          {interest.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-forest"
                >
                  {t.register.form.password}{" "}
                  <span className="text-gold">*</span>
                </label>

                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) =>
                    updateField(
                      "password",
                      e.target.value
                    )
                  }
                  placeholder={
                    t.register.form.passwordPlaceholder
                  }
                  className="w-full rounded-2xl bg-ivory px-4 py-3.5 text-sm text-forest outline-none ring-1 ring-transparent transition-all placeholder:text-forest/30 focus:bg-white focus:ring-gold/50"
                />
              </div>

              {/* PRIVACY */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) =>
                    setPrivacyConsent(
                      e.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 accent-[#17382A]"
                />

                <span className="text-xs leading-5 text-forest/55">
                  {t.register.form.privacy}
                </span>
              </label>

              {/* ERROR */}
              {errorMessage && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-full bg-forest px-6 py-4 text-sm font-semibold text-ivory shadow-[0_10px_30px_rgba(23,56,42,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? t.register.form.creating
                  : t.register.form.submit}

                {!loading && (
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>

              {/* LOGIN */}
              <p className="text-center text-xs text-forest/40">
                {t.register.form.alreadyHaveAccount}{" "}
                <a
                  href="/login"
                  className="font-semibold text-forest hover:text-gold"
                >
                  {t.register.form.login}
                </a>
              </p>

            </form>
          </div>
        </div>
      </section>
    </main>
  );
}