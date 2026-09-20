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
        console.error("Failed to load homepage gallery:", error);
      }
    }

    loadGallery();
  }, []);

  const galleryImages =
    posts.length > 0
      ? posts.slice(0, 5).map((post) => ({
          image: post.imageUrl,
          alt: post.caption || "JCWF community moment",
          caption: post.caption,
          participant:
            post.participant?.fullName || "JCWF Participant",
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
        <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t.gallery.eyebrow}
            </p>

            <h2 className="font-display text-[clamp(3rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.05em] text-forest">
              {t.gallery.titleLine1}
              <br />
              <span className="text-gold">{t.gallery.titleLine2}</span>
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-7 text-forest/60 md:pb-2 md:text-[15px]">
            {t.gallery.description}
          </p>
        </div>

        {/* GALLERY */}
        <div className="mt-10 grid gap-3 md:mt-16 md:grid-cols-12 md:gap-4">
          {/* FIRST / FEATURED IMAGE */}
          <a
            href="/gallery"
            className="group relative min-h-[300px] overflow-hidden rounded-[1.5rem] bg-sage md:col-span-7 md:min-h-[620px] md:rounded-[2rem]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.04]"
              style={{
                backgroundImage: firstImage
                  ? `linear-gradient(180deg, rgba(23,56,42,0.02), rgba(23,56,42,0.65)), url("${firstImage.image}")`
                  : undefined,
              }}
            />

            <div className="absolute inset-x-0 bottom-0 p-5 md:p-9">
              <span className="rounded-full bg-gold px-2.5 py-1 text-[8px] font-bold tracking-[0.12em] text-forest md:px-3 md:py-1.5 md:text-[10px] md:tracking-[0.15em]">
                {posts.length > 0
                  ? "COMMUNITY MOMENT"
                  : t.gallery.momentLabel}
              </span>

              <p className="mt-3 max-w-md font-display text-2xl leading-tight text-white md:mt-4 md:text-4xl">
                {posts.length > 0 && firstImage?.caption
                  ? firstImage.caption
                  : t.gallery.momentTitle}
              </p>

              {posts.length > 0 && firstImage?.participant && (
                <p className="mt-1.5 text-[10px] text-white/65 md:mt-2 md:text-xs">
                  Shared by {firstImage.participant}
                </p>
              )}
            </div>
          </a>

          {/* RIGHT COLUMN */}
          <div className="grid gap-3 md:col-span-5 md:gap-4">
            {/* TOP TWO */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {/* SECOND */}
              <a
                href="/gallery"
                className="group relative aspect-[4/4.6] overflow-hidden rounded-[1.5rem] bg-sage md:aspect-[4/5] md:rounded-[2rem]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: secondImage
                      ? `url("${secondImage.image}")`
                      : undefined,
                  }}
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/75 to-transparent p-3 pt-12 md:p-5 md:pt-16">
                  <p className="text-[9px] font-medium text-white/70 md:text-xs">
                    {posts.length > 0 ? "COMMUNITY" : t.gallery.culture}
                  </p>

                  <p className="mt-0.5 line-clamp-2 font-display text-lg leading-tight text-white md:mt-1 md:text-2xl">
                    {posts.length > 0 && secondImage?.caption
                      ? secondImage.caption
                      : t.gallery.cultureTitle}
                  </p>
                </div>
              </a>

              {/* THIRD */}
              <a
                href="/gallery"
                className="group relative aspect-[4/4.6] overflow-hidden rounded-[1.5rem] bg-sage md:aspect-[4/5] md:rounded-[2rem]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: thirdImage
                      ? `url("${thirdImage.image}")`
                      : undefined,
                  }}
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/75 to-transparent p-3 pt-12 md:p-5 md:pt-16">
                  <p className="text-[9px] font-medium text-white/70 md:text-xs">
                    {posts.length > 0 ? "COMMUNITY" : t.gallery.others}
                  </p>

                  <p className="mt-0.5 line-clamp-2 font-display text-lg leading-tight text-white md:mt-1 md:text-2xl">
                    {posts.length > 0 && thirdImage?.caption
                      ? thirdImage.caption
                      : t.gallery.othersTitle}
                  </p>
                </div>
              </a>
            </div>

            {/* FOURTH IMAGE */}
            <a
              href="/gallery"
              className="group relative min-h-[170px] overflow-hidden rounded-[1.5rem] bg-gold md:min-h-[250px] md:rounded-[2rem]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: fourthImage
                    ? `linear-gradient(90deg, rgba(23,56,42,0.7), rgba(23,56,42,0.05)), url("${fourthImage.image}")`
                    : undefined,
                }}
              />

              <div className="relative flex min-h-[170px] items-end p-4 md:min-h-[250px] md:justify-between md:p-7">
                <div>
                  <p className="text-[9px] font-medium text-white/65 md:text-xs">
                    {posts.length > 0
                      ? "COMMUNITY MOMENT"
                      : t.gallery.localExperience}
                  </p>

                  <p className="mt-0.5 line-clamp-2 font-display text-xl leading-tight text-white md:mt-1 md:text-3xl">
                    {posts.length > 0 && fourthImage?.caption
                      ? fourthImage.caption
                      : t.gallery.localExperienceTitle}
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* SECOND ROW */}
        <div className="mt-3 grid gap-3 md:mt-4 md:grid-cols-12 md:gap-4">
          {/* FIFTH IMAGE */}
          <a
            href="/gallery"
            className="group relative min-h-[190px] overflow-hidden rounded-[1.5rem] bg-sage md:col-span-5 md:min-h-[280px] md:rounded-[2rem]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: fifthImage
                  ? `url("${fifthImage.image}")`
                  : undefined,
              }}
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/75 to-transparent p-4 pt-14 md:p-6 md:pt-20">
              <p className="text-[9px] font-medium text-white/65 md:text-xs">
                {posts.length > 0 ? "COMMUNITY" : t.gallery.yogyakarta}
              </p>

              <p className="mt-0.5 line-clamp-2 font-display text-xl leading-tight text-white md:mt-1 md:text-3xl">
                {posts.length > 0 && fifthImage?.caption
                  ? fifthImage.caption
                  : t.gallery.yogyakartaTitle}
              </p>
            </div>
          </a>

          {/* UPLOAD CTA */}
          <div className="flex min-h-[190px] flex-col justify-between rounded-[1.5rem] bg-sage p-5 md:col-span-7 md:min-h-[280px] md:rounded-[2rem] md:p-9">
            <div className="flex items-start justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-base text-gold md:h-11 md:w-11 md:text-lg">
                +
              </span>

              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-forest/40 md:text-xs md:tracking-[0.15em]">
                {t.gallery.shareMoment}
              </span>
            </div>

            <div>
              <h3 className="max-w-xl font-display text-xl leading-tight tracking-[-0.03em] text-forest md:text-4xl">
                {t.gallery.ctaTitleLine1}
                <br />
                <span className="text-gold">
                  {t.gallery.ctaTitleLine2}
                </span>
              </h3>

              <a
                href="/gallery"
                className="mt-4 inline-flex rounded-full bg-forest px-4 py-2.5 text-[10px] font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest md:mt-6 md:px-6 md:py-3.5 md:text-sm"
              >
                {t.gallery.upload}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}