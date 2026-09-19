import { useEffect, useState } from "react";

import { cn } from "@/utils/cn";

import { getGallerySection } from "@/services/api";

import type {
  GallerySection as GallerySectionType,
} from "@/types/gallery";

import { Button } from "@/components/ui/Button";

import { Headline } from "@/components/ui/Headline";

import { ImageReveal } from "@/components/ui/ImageReveal";

import { Reveal } from "@/components/ui/Reveal";

const spans = [
  "col-span-3 row-span-2",
  "col-span-3 row-span-1",
  "col-span-3 row-span-1",
  "col-span-2 row-span-1",
  "col-span-2 row-span-1",
  "col-span-2 row-span-1",
];

export function InstagramSection() {
  const [gallery, setGallery] =
    useState<GallerySectionType | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const response = await getGallerySection();

        if (response.success && response.data) {
          setGallery(response.data);
        } else {
          setError(
            response.message ||
              "Aucune section Instagram disponible."
          );
        }
      } catch (err) {
        console.error("Gallery API error:", err);

        setError(
          "Impossible de charger la section Instagram."
        );
      } finally {
        setLoading(false);
      }
    };

    loadGallery();
  }, []);

  /*
   * ------------------------------------------------------------
   * Loading
   * ------------------------------------------------------------
   */

  if (loading) {
    return (
      <section className="bg-white py-24 lg:py-40">
        <div className="wrap flex min-h-[500px] items-center justify-center">
          <p className="label text-ink/40">
            Chargement...
          </p>
        </div>
      </section>
    );
  }

  /*
   * ------------------------------------------------------------
   * Error
   * ------------------------------------------------------------
   */

  if (error || !gallery) {
    return (
      <section className="bg-white py-24 lg:py-40">
        <div className="wrap flex min-h-[500px] items-center justify-center">
          <p className="text-sm text-ink/50">
            {error || "Section indisponible."}
          </p>
        </div>
      </section>
    );
  }

  const images = gallery.images || [];

  return (
    <section
      className="bg-white py-24 lg:py-40"
      aria-labelledby="instagram-title"
    >
      <div className="wrap">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">

          <div>
            {/* Eyebrow */}
            {gallery.eyebrow && (
              <Reveal>
                <p className="label flex items-center gap-4 text-ink/50">
                  <span className="h-px w-10 bg-current" />

                  {gallery.eyebrow}
                </p>
              </Reveal>
            )}

            {/* Headline */}
            <Headline
              lines={[
                gallery.title,
                gallery.instagram_handle && (
                  <a
                    key="handle"
                    href={gallery.button_link || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-opacity duration-500 hover:opacity-60"
                  >
                    {gallery.instagram_handle}
                  </a>
                ),
              ].filter(Boolean)}
              className="mt-6 text-[clamp(2.4rem,8.5vw,6.5rem)]"
            />

            <span
              id="instagram-title"
              className="sr-only"
            >
              {gallery.title}{" "}
              {gallery.instagram_handle}
            </span>
          </div>

          {/* Button */}
          {gallery.button_text && gallery.button_link && (
            <Reveal delay={0.2}>
              <Button
                variant="outline-dark"
                href={gallery.button_link}
                icon="external"
              >
                {gallery.button_text}
              </Button>
            </Reveal>
          )}

        </div>

        {/* =====================================================
            INSTAGRAM GRID
        ===================================================== */}

        <div className="mt-14 grid grid-cols-6 auto-rows-[28vw] gap-2 sm:auto-rows-[20vw] md:gap-3 lg:mt-20 lg:auto-rows-[11.5vw] xl:auto-rows-[10.5rem]">

          {images.map((image, i) => {
            if (!image) return null;

            return (
              <a
                key={`${image}-${i}`}
                href={gallery.button_link || "#"}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "group relative block",
                  spans[i]
                )}
                aria-label={`Voir ${
                  gallery.instagram_handle || "Instagram"
                } sur Instagram`}
              >
                <ImageReveal
                  src={image}
                  alt={`${gallery.instagram_handle || "AS Academy"} - image ${
                    i + 1
                  }`}
                  className="h-full w-full"
                  delay={i * 0.06}
                />

                {/* Hover Instagram icon */}
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 text-ivory opacity-0 transition-all duration-700 group-hover:bg-ink/25 group-hover:opacity-100">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                    />

                    <circle
                      cx="17.5"
                      cy="6.5"
                      r="0.6"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </a>
            );
          })}

        </div>
      </div>
    </section>
  );
}