import { useEffect, useState } from "react";

import { getIntroductionSection } from "@/services/api";

import type {
  IntroductionSection as IntroductionSectionType,
} from "@/types/introduction";

import { Headline } from "@/components/ui/Headline";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

export function IntroSection() {
  const [introduction, setIntroduction] =
    useState<IntroductionSectionType | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadIntroduction = async () => {
      try {
        const response = await getIntroductionSection();

        if (response.success && response.data) {
          setIntroduction(response.data);
        } else {
          setError(
            response.message ||
              "Aucune section Introduction disponible."
          );
        }
      } catch (err) {
        console.error("Introduction API error:", err);

        setError(
          "Impossible de charger la section Introduction."
        );
      } finally {
        setLoading(false);
      }
    };

    loadIntroduction();
  }, []);

  /*
   * ------------------------------------------------------------
   * Loading
   * ------------------------------------------------------------
   */

  if (loading) {
    return (
      <section className="bg-ivory py-24 lg:py-40">
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

  if (error || !introduction) {
    return (
      <section className="bg-ivory py-24 lg:py-40">
        <div className="wrap flex min-h-[500px] items-center justify-center">
          <p className="text-sm text-ink/50">
            {error || "Section indisponible."}
          </p>
        </div>
      </section>
    );
  }

  /*
   * ------------------------------------------------------------
   * API DATA
   * ------------------------------------------------------------
   */

  const expertises = introduction.expertises || [];

  return (
    <section
      className="bg-ivory py-24 lg:py-40"
      aria-labelledby="intro-title"
    >
      <div className="wrap">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">

          {/* =====================================================
              IMAGE COMPOSITION
          ===================================================== */}

          <div className="relative lg:col-span-5">
            <div className="relative mx-auto w-full max-w-[620px]">

              {/* Rotating ring of brand text */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 animate-[spin_60s_linear_infinite] text-ink/35"
              >
                <svg
                  viewBox="0 0 200 200"
                  className="h-full w-full"
                >
                  <defs>
                    <path
                      id="as-intro-ring"
                      d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0"
                      fill="none"
                    />
                  </defs>

                  <text
                    fill="currentColor"
                    fontSize="6.2"
                    letterSpacing="2.4"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontWeight: 500,
                    }}
                  >
                    <textPath href="#as-intro-ring">
                      AS ACADEMY — FORMATION EXTENSION DE CILS — BORDEAUX · PARIS · LYON ·
                      TOULOUSE · MARRAKECH —
                    </textPath>
                  </text>
                </svg>
              </div>

              <div className="relative px-9 sm:px-14">

                {/* Primary image */}
                {introduction.image_primary && (
                  <ImageReveal
                    src={introduction.image_primary}
                    alt="Fondatrice AS Academy"
                    className="aspect-square w-full rounded-full"
                    hover={false}
                    priority
                  />
                )}

                {/* Secondary image */}
                {introduction.image_secondary && (
                  <ImageReveal
                    src={introduction.image_secondary}
                    alt=""
                    className="absolute -bottom-8 right-2 hidden aspect-[4/3] w-[46%] border-[6px] border-ivory sm:block lg:-right-2 lg:w-[50%]"
                    delay={0.35}
                    direction="left"
                  />
                )}

              </div>
            </div>

            {/* Bottom information */}
            {(introduction.bottom_title ||
              introduction.bottom_text) && (
              <Reveal
                delay={0.4}
                className="mt-14 text-center sm:mt-16"
              >
                {introduction.bottom_title && (
                  <p className="label text-ink/40">
                    {introduction.bottom_title}
                  </p>
                )}

                {introduction.bottom_text && (
                  <p className="mt-2 text-xs font-light text-ink/45">
                    {introduction.bottom_text}
                  </p>
                )}
              </Reveal>
            )}
          </div>

          {/* =====================================================
              EDITORIAL TEXT
          ===================================================== */}

          <div className="lg:col-span-6 lg:col-start-7 lg:pt-8">

            {/* Eyebrow */}
            {introduction.eyebrow && (
              <Reveal>
                <p className="label flex items-center gap-4 text-ink/50">
                  <span className="h-px w-10 bg-current" />

                  {introduction.eyebrow}
                </p>
              </Reveal>
            )}

            {/* Headline */}
            <Headline
              lines={[
                introduction.title,
                introduction.subtitle,
              ].filter(
                (line): line is string => Boolean(line)
              )}
              className="mt-6 text-[clamp(2.75rem,9.5vw,6rem)]"
            />

            <span
              id="intro-title"
              className="sr-only"
            >
              {introduction.title}{" "}
              {introduction.subtitle}
            </span>

            {/* Main description */}
            {introduction.description && (
              <Reveal delay={0.2}>
                <p className="mt-9 max-w-xl font-serif text-[1.5rem] leading-[1.3] text-ink/85 md:text-[1.9rem]">
                  {introduction.description}
                </p>
              </Reveal>
            )}

            {/* Secondary description */}
            {introduction.secondary_description && (
              <Reveal delay={0.3}>
                <p className="mt-6 max-w-lg text-base font-light leading-relaxed text-ink/60">
                  {introduction.secondary_description}
                </p>
              </Reveal>
            )}

            {/* =================================================
                EXPERTISES
            ================================================= */}

            {expertises.length > 0 && (
              <div className="mt-14 grid grid-cols-2 gap-x-8 border-t border-ink/10 sm:grid-cols-3">

                {expertises.map((expertise, index) => (
                  <Reveal
                    key={`${expertise.number}-${expertise.title}`}
                    delay={0.1 + index * 0.07}
                  >
                    <div className="border-b border-ink/10 py-5">

                      {expertise.number && (
                        <span className="label block text-[10px] text-ink/35">
                          {expertise.number}
                        </span>
                      )}

                      {expertise.title && (
                        <span className="mt-2 block font-serif text-2xl uppercase tracking-[0.04em] md:text-[1.7rem]">
                          {expertise.title}
                        </span>
                      )}

                    </div>
                  </Reveal>
                ))}

              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}