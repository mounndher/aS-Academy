import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

import { useFormations } from "@/hooks/useFormations";

import {
  FormationCard,
  type Formation,
  type FormationDay,
} from "./FormationCard";

interface FormationCardItem {
  formation: Formation;
  day: FormationDay;
}

export function FormationGrid() {
  const {
    data,
    loading,
    error,
  } = useFormations();

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <section
        id="formations"
        className="bg-white py-24 lg:py-40"
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
        className="bg-white py-24 lg:py-40"
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
  // IMPORTANT
  // getFormations() already returns json.data
  // =========================================================

  const formations = data ?? [];

  // =========================================================
  // CREATE ONE CARD PER FORMATION DAY
  //
  // Formation
  //   ├── Paris
  //   ├── Toulouse
  //   ├── Bruxelles
  //   └── Bordeaux
  //
  // becomes
  //
  // Card Paris
  // Card Toulouse
  // Card Bruxelles
  // Card Bordeaux
  // =========================================================

  const cards: FormationCardItem[] =
    formations.flatMap(
      (formation) =>
        (formation.formationDays ?? []).map(
          (day) => ({
            formation,
            day,
          })
        )
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section
      id="formations"
      className="scroll-mt-16 bg-white py-24 lg:py-40"
    >
      <div className="wrap">

        {/* ===================================================
            HEADER
        =================================================== */}

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

        {/* ===================================================
            EMPTY
        =================================================== */}

        {cards.length === 0 && (
          <div className="py-20">
            <p className="text-sm font-light text-ink/50">
              Aucune formation disponible pour le moment.
            </p>
          </div>
        )}

        {/* ===================================================
            CARDS
        =================================================== */}

        {cards.length > 0 && (
          <div className="mt-14 grid gap-16 md:grid-cols-2 md:gap-10 lg:grid-cols-3">

            {cards.map(
              (
                item,
                index
              ) => (
                <FormationCard
                  key={`${item.formation.id}-${item.day.id}`}
                  formation={item.formation}
                  day={item.day}
                  index={index}
                />
              )
            )}

          </div>
        )}

      </div>
    </section>
  );
}

export default FormationGrid;