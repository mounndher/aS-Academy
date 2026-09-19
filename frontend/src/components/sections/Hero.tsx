import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { getHeroSection } from "@/services/api";
import type { HeroSection as HeroSectionType } from "@/types/hero";

import { useSectionNav } from "@/hooks/useSectionNav";
import { EASE } from "@/lib/motion";

import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";

export function Hero() {
  const goTo = useSectionNav();
  const reduce = useReducedMotion();

  const [hero, setHero] = useState<HeroSectionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHero = async () => {
      try {
        const response = await getHeroSection();

        if (response.success && response.data) {
          setHero(response.data);
        } else {
          setError(
            response.message || "Aucune section Hero disponible."
          );
        }
      } catch (err) {
        console.error("Hero API error:", err);
        setError("Impossible de charger la section Hero.");
      } finally {
        setLoading(false);
      }
    };

    loadHero();
  }, []);

  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.1, delay, ease: EASE },
  });

  /*
   * ------------------------------------------------------------
   * Loading
   * ------------------------------------------------------------
   */

  if (loading) {
    return (
      <section
        id="accueil"
        className="min-h-[100svh] bg-ink text-ivory"
      >
        <div className="wrap flex min-h-[100svh] items-center justify-center">
          <p className="label text-ivory/50">
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

  if (error || !hero) {
    return (
      <section
        id="accueil"
        className="min-h-[100svh] bg-ink text-ivory"
      >
        <div className="wrap flex min-h-[100svh] items-center justify-center">
          <p className="text-sm text-ivory/50">
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

  const headlineLines = [
    hero.title,
    hero.subtitle,
    hero.heading,
  ].filter((line): line is string => Boolean(line));

  return (
    <section
      id="accueil"
      className="relative min-h-[100svh] overflow-hidden bg-ink text-ivory"
      aria-label="AS Academy — Formation extension de cils"
    >
      {/* Photography */}
      <div className="absolute inset-0 lg:left-[42%]">
        <motion.div
          className="h-full w-full"
          initial={reduce ? false : { scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: EASE }}
        >
          <picture className="block h-full w-full">
            {hero.image && (
              <img
                src={hero.image}
                alt={hero.title || "AS Academy"}
                className="h-full w-full object-cover object-[center_40%]"
                fetchPriority="high"
                decoding="async"
              />
            )}
          </picture>
        </motion.div>

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15 lg:bg-gradient-to-r lg:from-ink lg:via-ink/35 lg:to-ink/0" />

        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-transparent to-ink/70 lg:from-ink/40 lg:to-ink/50" />
      </div>

      {/* Content */}
      <div className="wrap relative z-10 flex min-h-[100svh] flex-col justify-end pb-36 pt-28 sm:pb-32 lg:justify-center lg:pb-44 lg:pt-36">

        {/* Eyebrow */}
        {hero.eyebrow && (
          <motion.p
            className="label flex items-center gap-4 text-ivory/70"
            {...fade(0.2)}
          >
            <span className="h-px w-10 bg-ivory/60" />

            {hero.eyebrow}
          </motion.p>
        )}

        {/* Headline */}
        <Headline
          as="h1"
          immediate
          delay={0.35}
          lines={headlineLines}
          className="mt-7 text-[clamp(2.9rem,12.5vw,5.75rem)] lg:text-[6.4vw] 2xl:text-[6.5rem]"
        />

        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:items-end">

          {/* Description */}
          {hero.description && (
            <motion.p
              className="max-w-md text-base font-light leading-relaxed text-ivory/75 md:text-lg lg:col-span-5"
              {...fade(0.95)}
            >
              {hero.description}
            </motion.p>
          )}

          {/* Buttons */}
          <motion.div
            className="flex flex-col gap-3 sm:flex-row lg:col-span-7 lg:justify-end"
            {...fade(1.1)}
          >
            {hero.primary_button.text && (
              <Button
                variant="light"
                size="lg"
                icon="arrow"
                onClick={() => {
                  if (hero.primary_button.link?.startsWith("#")) {
                    goTo(
                      hero.primary_button.link.replace(
                        "#",
                        ""
                      )
                    );
                  } else if (hero.primary_button.link) {
                    window.location.href =
                      hero.primary_button.link;
                  }
                }}
              >
                {hero.primary_button.text}
              </Button>
            )}

            {hero.secondary_button.text && (
              <Button
                variant="outline-light"
                size="lg"
                to={hero.secondary_button.link || "#"}
              >
                {hero.secondary_button.text}
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom information row */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-10 border-t border-ivory/15"
        {...fade(1.4)}
      >
        <div className="wrap flex items-center justify-between gap-6 py-5 lg:py-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-ivory/70">
            AS Academy
          </div>

          <div className="hidden items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-ivory/45 md:flex">
            <span>Défiler</span>

            <span className="relative h-10 w-px overflow-hidden bg-ivory/20">
              {!reduce && (
                <motion.span
                  className="absolute left-0 top-0 h-4 w-px bg-ivory"
                  animate={{ y: ["-100%", "260%"] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}