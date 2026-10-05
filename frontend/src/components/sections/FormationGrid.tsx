import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

import { useFormations } from "@/hooks/useFormations";
import { useFormationInformation } from "@/hooks/useFormationInformation";

import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

import { FormationCard } from "./FormationCard";

export function FormationGrid() {
  // Section information
  const {
    data: formationInformation,
    loading: informationLoading,
  } = useFormationInformation();

  // Dynamic formations
  const {
    formations,
    loading: formationsLoading,
    error,
  } = useFormations();

  const information = formationInformation?.information;

  // Loading
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

  // Error
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

  return (
    <section
      id="formations"
      className="scroll-mt-16 bg-white py-24 lg:py-40"
    >
      <div className="wrap">

        {/* =========================
            FORMATION INFORMATION
        ========================== */}
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

        {/* =========================
            ALL FORMATIONS
        ========================== */}
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

          {formations.length === 0 ? (
            <div className="mt-14 border border-ink/10 p-8">
              <p className="text-sm text-ink/50">
                Aucune formation disponible actuellement.
              </p>
            </div>
          ) : (
            <div className="mt-14 grid gap-16 md:grid-cols-2 md:gap-10 lg:grid-cols-3">

              {formations.map((formation, index) => (
                <FormationCard
                  key={formation.id}
                  formation={formation}
                  index={index}
                  className={cn(
                    index % 3 === 1 && "lg:mt-20"
                  )}
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