import { useEffect, useState } from "react";

import { getAcademySection } from "@/services/api";
import type { AcademySection as AcademySectionType } from "@/types/academy";

import { Headline } from "@/components/ui/Headline";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

function Detail({
  label,
  value,
  sub,
}: {
  label: string | null;
  value: string | null;
  sub: string | null;
}) {
  if (!label && !value && !sub) {
    return null;
  }

  return (
    <div>
      {label && (
        <p className="label text-[10px] text-ivory/40">
          {label}
        </p>
      )}

      {value && (
        <p className="mt-2 font-serif text-2xl leading-tight">
          {value}
        </p>
      )}

      {sub && (
        <p className="mt-1 text-xs font-light text-ivory/45">
          {sub}
        </p>
      )}
    </div>
  );
}

export function AcademySection() {
  const [academy, setAcademy] =
    useState<AcademySectionType | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAcademy = async () => {
      try {
        const response = await getAcademySection();

        if (response.success && response.data) {
          setAcademy(response.data);
        } else {
          setError(
            response.message ||
            "Aucune section Academy disponible."
          );
        }
      } catch (err) {
        console.error("Academy API error:", err);

        setError(
          "Impossible de charger la section Academy."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAcademy();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <section
        id="academy"
        className="min-h-[500px] bg-ink text-ivory"
      >
        <div className="wrap flex min-h-[500px] items-center justify-center">
          <p className="label text-ivory/50">
            Chargement...
          </p>
        </div>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error || !academy) {
    return (
      <section
        id="academy"
        className="min-h-[500px] bg-ink text-ivory"
      >
        <div className="wrap flex min-h-[500px] items-center justify-center">
          <p className="text-sm text-ivory/50">
            {error || "Section indisponible."}
          </p>
        </div>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | API DATA
  |--------------------------------------------------------------------------
  */

  const stats = academy.stats || [];

  return (
    <section
      id="academy"
      className="scroll-mt-16 overflow-hidden bg-ink py-24 text-ivory lg:py-40"
    >
      <div className="wrap">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-start lg:gap-12">

          {/* =========================================================
              IMAGES
          ========================================================= */}

          <div className="relative lg:col-span-5">

            {academy.image_primary && (
              <ImageReveal
                src={academy.image_primary}
                alt={
                  academy.title ||
                  "AS Academy"
                }
                className="aspect-[3/4] w-full lg:w-[88%]"
                priority
              />
            )}

            {academy.image_secondary && (
              <ImageReveal
                src={academy.image_secondary}
                alt=""
                className="absolute -bottom-12 right-0 hidden aspect-[4/3] w-[56%] border-[6px] border-ink sm:block"
                delay={0.3}
                direction="right"
              />
            )}

          </div>

          {/* =========================================================
              CONTENT
          ========================================================= */}

          <div className="lg:col-span-6 lg:col-start-7">

            {/* Eyebrow */}

            {academy.eyebrow && (
              <Reveal>
                <p className="label flex items-center gap-4 text-ivory/50">
                  <span className="h-px w-10 bg-current" />

                  {academy.eyebrow}
                </p>
              </Reveal>
            )}

            {/* Title */}

            <Headline
              lines={[
                academy.title,
                academy.subtitle,
                academy.heading,
              ].filter((line): line is string => Boolean(line))}
              className="mt-6 text-[clamp(2.5rem,8vw,4.5rem)]"
            />

            {/* Description */}

            {academy.description && (
              <Reveal delay={0.2}>
                <p className="mt-9 max-w-xl font-serif text-[1.4rem] leading-[1.3] text-ivory/90 md:text-[1.75rem]">
                  {academy.description}
                </p>
              </Reveal>
            )}

            {/* Secondary description */}

            {academy.secondary_description && (
              <Reveal delay={0.3}>
                <p className="mt-6 max-w-lg text-base font-light leading-relaxed text-ivory/60">
                  {academy.secondary_description}
                </p>
              </Reveal>
            )}

            {/* =====================================================
                STATS
            ===================================================== */}

            {stats.length > 0 && (
              <Reveal delay={0.35}>
                <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-ivory/10 pt-8 sm:grid-cols-3">

                  {stats.map((stat, index) => (
                    <Detail
                      key={index}
                      label={stat.label}
                      value={stat.title}
                      sub={stat.text}
                    />
                  ))}

                </div>
              </Reveal>
            )}

            {/* =====================================================
                QUOTE
            ===================================================== */}

            {academy.quote && (
              <Reveal delay={0.4}>
                <blockquote className="mt-14 border-l border-ivory/20 pl-6">

                  <p className="font-serif text-2xl italic leading-snug text-ivory/85 md:text-3xl">
                    {academy.quote}
                  </p>

                  {academy.quote_author && (
                    <cite className="label mt-4 block text-[10px] not-italic text-ivory/40">
                      {academy.quote_author}
                    </cite>
                  )}

                </blockquote>
              </Reveal>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}