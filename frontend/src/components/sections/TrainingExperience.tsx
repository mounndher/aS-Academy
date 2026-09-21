import { useEffect, useState } from "react";

import { getTrainingExperience } from "@/services/api";

import type {
  TrainingExperienceSection as TrainingExperienceSectionType,
  TrainingExperienceItem,
} from "@/types/trainingExperience";

import { Headline } from "@/components/ui/Headline";

import { ImageReveal } from "@/components/ui/ImageReveal";

import { Reveal } from "@/components/ui/Reveal";

const WORD = "text-[clamp(3rem,12vw,6.5rem)]";

function ExperienceLabel({
  item,
}: {
  item: TrainingExperienceItem;
}) {
  return (
    <Reveal delay={0.2}>
      <p className="label mt-5 text-ink/40">
        {item.number && (
          <>
            {item.number}
            {item.subtitle && (
              <span className="mx-2">—</span>
            )}
          </>
        )}

        {item.subtitle}
      </p>
    </Reveal>
  );
}

export function TrainingExperience() {
  const [section, setSection] =
    useState<TrainingExperienceSectionType | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrainingExperience = async () => {
      try {
        const response = await getTrainingExperience();

        if (response.success && response.data) {
          setSection(response.data);
        } else {
          setError(
            response.message ||
              "Aucune expérience de formation disponible."
          );
        }
      } catch (err) {
        console.error(
          "Training Experience API error:",
          err
        );

        setError(
          "Impossible de charger l'expérience de formation."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTrainingExperience();
  }, []);

  if (loading) {
    return (
      <section className="overflow-hidden bg-ivory py-24 lg:py-40">
        <div className="wrap flex min-h-[500px] items-center justify-center">
          <p className="label text-ink/40">
            Chargement...
          </p>
        </div>
      </section>
    );
  }

  if (error || !section) {
    return (
      <section className="overflow-hidden bg-ivory py-24 lg:py-40">
        <div className="wrap flex min-h-[500px] items-center justify-center">
          <p className="text-sm text-ink/50">
            {error || "Section indisponible."}
          </p>
        </div>
      </section>
    );
  }

  const experiences = section.experiences || [];

  const first = experiences[0];
  const second = experiences[1];
  const third = experiences[2];

  return (
    <section
      id="experience"
      className="overflow-hidden bg-ivory py-24 lg:py-40"
      aria-label={
        section.eyebrow ||
        "L'expérience de formation"
      }
    >
      <div className="wrap">

        {/* =====================================================
            EYEBROW
        ===================================================== */}

        {section.eyebrow && (
          <Reveal>
            <p className="label flex items-center gap-4 text-ink/50">
              <span className="h-px w-10 bg-current" />
              {section.eyebrow}
            </p>
          </Reveal>
        )}

        {/* =====================================================
            01 — APPRENDRE
        ===================================================== */}

        {first && (
          <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">

            <div className="lg:col-span-6">
              {first.title && (
                <Headline
                  lines={[first.title]}
                  className={WORD}
                />
              )}

              <ExperienceLabel item={first} />

              {first.description && (
                <Reveal delay={0.3}>
                  <p className="mt-6 max-w-md text-base font-light leading-relaxed text-ink/60">
                    {first.description}
                  </p>
                </Reveal>
              )}
            </div>

            {/* IMAGE 01 */}

            {first.image_primary && (
              <ImageReveal
                src={first.image_primary}
                alt={first.title || "Formation"}
                className="aspect-[4/3] w-full lg:col-span-6"
              />
            )}
          </div>
        )}

        {/* =====================================================
            02 — PRATIQUER
        ===================================================== */}

        {second && (
          <div className="mt-20 grid gap-8 lg:mt-20 lg:grid-cols-12 lg:items-start lg:gap-12">

            {/* IMAGE 02 */}

            {second.image_primary && (
              <ImageReveal
                src={second.image_primary}
                alt={second.title || "Formation"}
                className="aspect-[3/4] w-[68%] sm:w-[50%] lg:col-span-4 lg:mt-0 lg:w-full"
                direction="left"
              />
            )}

            {/* CONTENT */}

            <div className="lg:col-span-8 lg:pt-20 lg:text-right">

              {second.title && (
                <Headline
                  lines={[second.title]}
                  className={WORD}
                />
              )}

              <ExperienceLabel item={second} />

              {second.description && (
                <Reveal delay={0.3}>
                  <p className="ml-auto mt-6 max-w-md text-base font-light leading-relaxed text-ink/60">
                    {second.description}
                  </p>
                </Reveal>
              )}

              {/* SECOND IMAGE */}

              {second.image_secondary && (
                <ImageReveal
                  src={second.image_secondary}
                  alt=""
                  className="ml-auto mt-10 aspect-[4/3] w-[82%] sm:w-[62%] lg:w-[60%]"
                  delay={0.15}
                />
              )}
            </div>
          </div>
        )}

        {/* =====================================================
            03 — MAÎTRISER
        ===================================================== */}

        {third && (
          <div className="mt-20 grid gap-8 lg:mt-24 lg:grid-cols-12 lg:items-center lg:gap-12">

            {/* TEXT */}

            <div className="lg:col-span-6">

              {third.title && (
                <Headline
                  lines={[third.title]}
                  className={WORD}
                />
              )}

              <ExperienceLabel item={third} />

              {third.description && (
                <Reveal delay={0.2}>
                  <p className="mt-6 max-w-sm text-base font-light leading-relaxed text-ink/60">
                    {third.description}
                  </p>
                </Reveal>
              )}
            </div>

            {/* IMAGES */}

            <div className="relative lg:col-span-6">

              {third.image_primary && (
                <ImageReveal
                  src={third.image_primary}
                  alt={
                    third.title ||
                    "Résultat final"
                  }
                  className="aspect-[16/10] w-full"
                />
              )}

              {third.image_secondary && (
                <ImageReveal
                  src={third.image_secondary}
                  alt=""
                  className="absolute -bottom-10 -left-4 hidden aspect-square w-[34%] border-[6px] border-ivory sm:block lg:-left-12"
                  delay={0.3}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}