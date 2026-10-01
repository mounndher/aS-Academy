import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";

import {
  CPF_PRICE,
  eur,
  priceFrom,
  scheduledFormations,
  upcomingFormations,
} from "@/data/formations";

import { mainProgramme } from "@/data/programmes";

import { site } from "@/data/site";

import { useSiteUI } from "@/context/SiteUIContext";

import { useFormationInformation } from "@/hooks/useFormationInformation";

import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

import { FormationCard, Meta } from "./FormationCard";

export function FormationGrid() {
  const p = mainProgramme;

  const { requestDate } = useSiteUI();

  const {
    data: formationInformationData,
  } = useFormationInformation();

  const information = formationInformationData?.information;

  const cards = scheduledFormations.slice(0, 3);

  return (
    <section
      id="formations"
      className="scroll-mt-16 bg-white py-24 lg:py-40"
    >
      <div className="wrap">

        {/* Section Header */}
        <SectionHeader
          label={information?.eyebrow || "Formations"}
          title={[
            information?.title || "Nos",
            information?.subtitle || "Formations",
          ]}
          subtitle={
            information?.description ||
            "Extension de Cils — 3 jours. Choisissez votre ville et vos dates, puis réservez en ligne."
          }
        />

        {/* Programme — editorial magazine feature */}
        <article className="group mt-20 grid gap-10 lg:mt-28 lg:grid-cols-12 lg:items-end lg:gap-14">

          {/* Image */}
          <Link
            to="/formations"
            className="block lg:col-span-6"
            aria-label={`Découvrir la formation ${p.title}`}
          >
            <ImageReveal
              src={p.image.src}
              alt={p.image.alt}
              className="aspect-[4/5] w-full sm:aspect-[4/3] lg:aspect-[4/5]"
              priority
            />
          </Link>

          {/* Programme information */}
          <div className="lg:col-span-6 lg:pb-4">

            <Reveal>
              <p className="label flex items-center gap-4 text-ink/40">
                <span className="font-serif text-lg tracking-normal text-ink/60">
                  01
                </span>

                <span className="h-px w-6 bg-current" />

                {p.eyebrow}
              </p>

              <h3 className="display mt-5 text-[clamp(2.2rem,6.5vw,4.25rem)]">
                <Link
                  to="/formations"
                  className="transition-opacity duration-500 hover:opacity-60"
                >
                  {p.titleLines.map((line, i) => (
                    <span
                      key={i}
                      className="block"
                    >
                      {line}
                    </span>
                  ))}
                </Link>
              </h3>

              <p className="mt-3 font-serif text-xl italic text-ink/55 md:text-2xl">
                {p.subtitle}
              </p>

              <p className="mt-6 max-w-md text-base font-light leading-relaxed text-ink/60">
                {p.short}
              </p>
            </Reveal>

            {/* Programme metadata */}
            <Reveal delay={0.15}>
              <dl className="mt-9 grid grid-cols-2 border-t border-ink/10 sm:grid-cols-3">

                <Meta
                  label="Durée"
                  value={p.duration}
                  sub={p.durationDetail}
                />

                <Meta
                  label="Villes"
                  value={`${site.cities.length} villes`}
                  sub={site.cities.join(" · ")}
                />

                <Meta
                  label="Tarif"
                  value={`dès ${priceFrom}`}
                  sub={`CPF ${eur(CPF_PRICE)}`}
                  className="col-span-2 sm:col-span-1"
                />

              </dl>

              {/* CTA */}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
                <Button
                  to="/formations"
                  variant="dark"
                  icon="arrow"
                >
                  Voir les dates & réserver
                </Button>
              </div>
            </Reveal>
          </div>
        </article>

        {/* Bookable formations */}
        <div className="mt-24 lg:mt-36">

          {/* Section title */}
          <Reveal>
            <div className="flex flex-col gap-3 border-b border-ink/10 pb-5 sm:flex-row sm:items-end sm:justify-between">

              <p className="label text-ink/50">
                Prochaines formations — réservation en ligne
              </p>

              <Button
                to="/formations"
                variant="link-dark"
                icon="arrow"
              >
                Toutes les formations
              </Button>

            </div>
          </Reveal>

          {/* Formation cards */}
          <div className="mt-14 grid gap-16 md:grid-cols-2 md:gap-10 lg:grid-cols-3">

            {cards.map((formation, i) => (
              <FormationCard
                key={formation.slug}
                formation={formation}
                index={i}
                className={cn(
                  i === 1 && "lg:mt-20"
                )}
                imageAspect={
                  i === 1
                    ? "aspect-[4/5]"
                    : "aspect-[4/3]"
                }
                delay={i * 0.08}
              />
            ))}

          </div>

          {/* Upcoming formations */}
          {upcomingFormations.length > 0 && (
            <Reveal>
              <div className="mt-16 flex flex-col gap-4 border-t border-ink/10 pt-7 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm font-light text-ink/60">
                  Dates à venir :{" "}
                  <span className="text-ink">
                    {upcomingFormations
                      .map((formation) => formation.city)
                      .join(" · ")}
                  </span>
                </p>

                <Button
                  variant="link-dark"
                  icon="arrow"
                  onClick={requestDate}
                >
                  Demander une date
                </Button>

              </div>
            </Reveal>
          )}

        </div>
      </div>
    </section>
  );
}