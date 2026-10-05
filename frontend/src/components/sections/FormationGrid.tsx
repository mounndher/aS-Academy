import { useFormations } from "@/hooks/useFormations";
import { useFormationInformation } from "@/hooks/useFormationInformation";

import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

import {
  FormationCard,
  type Formation,
  type FormationDay,
} from "./FormationCard";

export function FormationGrid() {
  // =========================================================
  // FORMATIONS
  // =========================================================

  const {
    formations,
    loading: formationsLoading,
    error,
  } = useFormations();

  // =========================================================
  // FORMATION INFORMATION
  // =========================================================

  const {
    data: formationInformation,
    loading: informationLoading,
  } = useFormationInformation();

  const information = formationInformation?.information;

  // =========================================================
  // LOADING
  // =========================================================

  if (informationLoading || formationsLoading) {
    return (
      <section
        id="formations"
        className="scroll-mt-16 bg-white py-24 lg:py-40"
      >
        <div className="wrap">
          <p className="text-sm text-ink/50">
            Chargement des formations...
          </p>
        </div>
      </section>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <section
        id="formations"
        className="scroll-mt-16 bg-white py-24 lg:py-40"
      >
        <div className="wrap">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </div>
      </section>
    );
  }

  // =========================================================
  // SAFETY
  // =========================================================

  const safeFormations: Formation[] = Array.isArray(formations)
    ? formations
    : [];

  // =========================================================
  // ONE CARD PER FORMATION DAY
  // =========================================================

  const cards: {
    formation: Formation;
    day: FormationDay;
  }[] = safeFormations.flatMap((formation) => {
    const days = Array.isArray(formation.formationDays)
      ? formation.formationDays
      : [];

    return days.map((day) => ({
      formation,
      day,
    }));
  });

  console.log("FORMATIONS:", safeFormations);
  console.log("FORMATION DAYS:", cards);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section
      id="formations"
      className="scroll-mt-16 bg-white py-24 lg:py-40"
    >
      <div className="wrap">

        {/* =================================================
            FORMATION INFORMATION
        ================================================= */}

        <SectionHeader
          label={information?.eyebrow ?? "Formations"}
          title={[
            information?.title ?? "Nos",
            information?.subtitle ?? "Formations",
          ]}
          subtitle={
            information?.description ??
            "Des formations pensées pour maîtriser les techniques essentielles de l'extension de cils."
          }
        />

        {/* =================================================
            FORMATIONS
        ================================================= */}

        <div className="mt-24 lg:mt-36">

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

          {/* =================================================
              EMPTY
          ================================================= */}

          {cards.length === 0 ? (
            <div className="mt-14 border border-ink/10 p-8">
              <p className="text-sm text-ink/50">
                Aucune formation disponible actuellement.
              </p>
            </div>
          ) : (

            /* =================================================
               GRID
            ================================================= */

            <div className="mt-14 grid gap-16 md:grid-cols-2 md:gap-10 lg:grid-cols-3">

              {cards.map(({ formation, day }, index) => (
                <FormationCard
                  key={`${formation.id}-${day.id}`}
                  formation={formation}
                  formationDay={day}
                  index={index}
                  className={
                    index % 3 === 1
                      ? "lg:mt-20"
                      : undefined
                  }
                  imageAspect={
                    index % 3 === 1
                      ? "aspect-[4/5]"
                      : "aspect-[4/3]"
                  }
                  delay={index * 0.08}
                />
              ))}

            </div>
          )}

        </div>
      </div>
    </section>
  );
}

export default FormationGrid;