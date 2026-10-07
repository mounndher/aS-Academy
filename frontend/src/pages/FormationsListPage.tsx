import { useFormations } from "@/hooks/useFormations";
import { useScrollToState } from "@/hooks/useScrollToState";

import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

import {
  FormationCard,
  type Formation,
} from "@/components/sections/FormationCard";

export function FormationsListPage() {
  useScrollToState();

  const {
    data: formationData,
    loading,
    error,
  } = useFormations();

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section className="bg-ivory pb-24 pt-28 sm:pb-28 lg:pb-36 lg:pt-36">
        <div className="wrap">
          <p className="text-sm text-ink/50">
            Chargement des formations...
          </p>
        </div>
      </section>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <section className="bg-ivory pb-24 pt-28 sm:pb-28 lg:pb-36 lg:pt-36">
        <div className="wrap">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      </section>
    );
  }

  /* =========================================================
     NORMALIZE
  ========================================================= */

  const formations: Formation[] = Array.isArray(formationData)
    ? formationData
    : [];

  /* =========================================================
     CREATE ONE CARD PER SESSION / CITY
     
     Example:
     
     Formation Lash
       → Paris      = Card
       → Lyon       = Card
       → Bruxelles  = Card
  ========================================================= */

  const cards = formations.flatMap((formation) => {
    const days = Array.isArray(formation.formationDays)
      ? formation.formationDays
      : [];

    return days
      .filter((day) => {
        return Boolean(day.city && day.city.trim());
      })
      .map((day) => ({
        formation,
        day,
      }));
  });

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="bg-ivory pb-24 pt-28 sm:pb-28 lg:pb-36 lg:pt-36">
      <div className="wrap">
        {/* HEADER */}

        <SectionHeader
          label="Formations"
          title={["Nos", "Formations"]}
          subtitle="Découvrez nos formations professionnelles, leurs dates, leurs villes et leurs tarifs. Réservez directement en ligne."
        />

        {/* FORMATIONS */}

        {cards.length === 0 ? (
          <div className="mt-16 text-center sm:mt-20">
            <p className="text-ink/50">
              Aucune formation disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid min-w-0 grid-cols-1 gap-x-8 gap-y-16 sm:mt-16 md:grid-cols-2 lg:mt-24 lg:grid-cols-3">
            {cards.map(({ formation, day }, index) => (
              <FormationCard
                key={`${formation.id}-${day.id}`}
                formation={formation}
                formationDay={day}
                index={index}
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

        {/* INSTAGRAM */}

        <Reveal>
          <p className="mt-16 border-t border-ink/10 pt-8 text-sm font-light leading-relaxed text-ink/55 sm:mt-20">
            Une autre ville ou une autre date ? Écrivez-nous
            sur Instagram.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export default FormationsListPage;