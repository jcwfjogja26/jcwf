"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type GalleryPost = {
  id: string;
  imageUrl: string;
  imagePath: string | null;
  caption: string | null;
  createdAt: string;
  participant: {
    fullName: string;
    reconnectId: string;
  } | null;
};

const fallbackItems = [
  {
    image: "/images/gallery-01.jpg",
    alt: "JCWF wellness experience",
  },
  {
    image: "/images/gallery-02.jpg",
    alt: "Cultural experience in Yogyakarta",
  },
  {
    image: "/images/gallery-03.jpg",
    alt: "Community gathering",
  },
  {
    image: "/images/gallery-04.jpg",
    alt: "Local culinary experience",
  },
  {
    image: "/images/gallery-05.jpg",
    alt: "Yogyakarta cultural moment",
  },
];

export default function GallerySection() {
  const { t } = useLanguage();

  const [posts, setPosts] = useState<GalleryPost[]>([]);

  useEffect(() => {
    async function loadGallery() {
      try {
        const response = await fetch("/api/gallery", {
          cache: "no-store",
        });

        const data = await response.json();

        if (data.success && Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      } catch (error) {
        console.error(
          "Failed to load homepage gallery:",
          error
        );
      }
    }

    loadGallery();
  }, []);

  /*
   * Kalau belum ada upload dari participant,
   * tetap gunakan gambar bawaan homepage.
   *
   * Kalau sudah ada upload:
   * foto participant akan menggantikan foto bawaan
   * berdasarkan urutan terbaru.
   */
  const galleryImages =
    posts.length > 0
      ? posts.slice(0, 5).map((post) => ({
          image: post.imageUrl,
          alt:
            post.caption ||
            "JCWF community moment",
          caption: post.caption,
          participant:
            post.participant?.fullName ||
            "JCWF Participant",
        }))
      : fallbackItems.map((item) => ({
          image: item.image,
          alt: item.alt,
          caption: null,
          participant: null,
        }));

  const firstImage = galleryImages[0];
  const secondImage = galleryImages[1];
  const thirdImage = galleryImages[2];
  const fourthImage = galleryImages[3];
  const fifthImage = galleryImages[4];

  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-ivory py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14">

        {/* HEADER */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t.gallery.eyebrow}
            </p>

            <h2 className="font-display text-[clamp(3rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.05em] text-forest">
              {t.gallery.titleLine1}
              <br />
              <span className="text-gold">
                {t.gallery.titleLine2}
              </span>
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-7 text-forest/60 md:pb-2 md:text-[15px]">
            {t.gallery.description}
          </p>
        </div>

        {/* GALLERY */}
        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-12">

          {/* LARGE IMAGE */}
          <a
            href="/gallery"
            className="group relative min-h-[420px] overflow-hidden rounded-[2rem] bg-sage md:col-span-7 md:min-h-[620px]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.04]"
              style={{
                backgroundImage: firstImage
                  ? `linear-gradient(180deg, rgba(23,56,42,0.02), rgba(23,56,42,0.65)), url("${firstImage.image}")`
                  : undefined,
              }}
            />

            <div className="absolute inset-x-0 bottom-0 p-7 md:p-9">
              <span className="rounded-full bg-gold px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] text-forest">
                {posts.length > 0
                  ? "COMMUNITY MOMENT"
                  : t.gallery.momentLabel}
              </span>

              <p className="mt-4 max-w-md font-display text-3xl leading-tight text-white md:text-4xl">
                {posts.length > 0 &&
                firstImage?.caption
                  ? firstImage.caption
                  : t.gallery.momentTitle}
              </p>

              {posts.length > 0 &&
                firstImage?.participant && (
                  <p className="mt-2 text-xs text-white/65">
                    Shared by {firstImage.participant}
                  </p>
                )}
            </div>

            <div className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-lg text-forest shadow-lg transition-all duration-500 group-hover:rotate-45 group-hover:bg-gold md:right-8 md:top-8">
              ↗
            </div>
          </a>

          {/* RIGHT COLUMN */}
          <div className="grid gap-4 md:col-span-5">

            {/* TOP TWO */}
            <div className="grid gap-4 sm:grid-cols-2">

              {/* SECOND */}
              <a
                href="/gallery"
                className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sage"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: secondImage
                      ? `url("${secondImage.image}")`
                      : undefined,
                  }}
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/70 to-transparent p-5 pt-16">
                  <p className="text-xs font-medium text-white/70">
                    {posts.length > 0
                      ? "COMMUNITY"
                      : t.gallery.culture}
                  </p>

                  <p className="mt-1 line-clamp-2 font-display text-2xl text-white">
                    {posts.length > 0 &&
                    secondImage?.caption
                      ? secondImage.caption
                      : t.gallery.cultureTitle}
                  </p>
                </div>
              </a>

              {/* THIRD */}
              <a
                href="/gallery"
                className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sage"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: thirdImage
                      ? `url("${thirdImage.image}")`
                      : undefined,
                  }}
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/70 to-transparent p-5 pt-16">
                  <p className="text-xs font-medium text-white/70">
                    {posts.length > 0
                      ? "COMMUNITY"
                      : t.gallery.others}
                  </p>

                  <p className="mt-1 line-clamp-2 font-display text-2xl text-white">
                    {posts.length > 0 &&
                    thirdImage?.caption
                      ? thirdImage.caption
                      : t.gallery.othersTitle}
                  </p>
                </div>
              </a>

            </div>

            {/* BOTTOM IMAGE */}
            <a
              href="/gallery"
              className="group relative min-h-[250px] overflow-hidden rounded-[2rem] bg-gold"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: fourthImage
                    ? `linear-gradient(90deg, rgba(23,56,42,0.7), rgba(23,56,42,0.05)), url("${fourthImage.image}")`
                    : undefined,
                }}
              />

              <div className="relative flex min-h-[250px] items-end justify-between p-6 md:p-7">
                <div>
                  <p className="text-xs font-medium text-white/65">
                    {posts.length > 0
                      ? "COMMUNITY MOMENT"
                      : t.gallery.localExperience}
                  </p>

                  <p className="mt-1 line-clamp-2 font-display text-3xl text-white">
                    {posts.length > 0 &&
                    fourthImage?.caption
                      ? fourthImage.caption
                      : t.gallery.localExperienceTitle}
                  </p>
                </div>

                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-forest transition-transform duration-500 group-hover:rotate-45">
                  ↗
                </span>
              </div>
            </a>

          </div>
        </div>

        {/* SECOND ROW */}
        <div className="mt-4 grid gap-4 md:grid-cols-12">

          {/* FIFTH IMAGE */}
          <a
            href="/gallery"
            className="group relative min-h-[280px] overflow-hidden rounded-[2rem] bg-sage md:col-span-5"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: fifthImage
                  ? `url("${fifthImage.image}")`
                  : undefined,
              }}
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/75 to-transparent p-6 pt-20">
              <p className="text-xs font-medium text-white/65">
                {posts.length > 0
                  ? "COMMUNITY"
                  : t.gallery.yogyakarta}
              </p>

              <p className="mt-1 line-clamp-2 font-display text-3xl text-white">
                {posts.length > 0 &&
                fifthImage?.caption
                  ? fifthImage.caption
                  : t.gallery.yogyakartaTitle}
              </p>
            </div>
          </a>

          {/* UPLOAD CTA */}
          <div className="flex min-h-[280px] flex-col justify-between rounded-[2rem] bg-sage p-7 md:col-span-7 md:p-9">
            <div className="flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-lg text-gold">
                +
              </span>

              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-forest/40">
                {t.gallery.shareMoment}
              </span>
            </div>

            <div>
              <h3 className="max-w-xl font-display text-3xl leading-tight tracking-[-0.03em] text-forest md:text-4xl">
                {t.gallery.ctaTitleLine1}
                <br />
                <span className="text-gold">
                  {t.gallery.ctaTitleLine2}
                </span>
              </h3>

              <a
                href="/gallery"
                className="group mt-6 inline-flex items-center gap-3 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest"
              >
                {t.gallery.upload}
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

