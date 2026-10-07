import { useMemo } from "react";
import { Link } from "react-router-dom";

import { useFormations } from "@/hooks/useFormations";
import { FormationCard } from "@/components/sections/FormationCard";

import type {
  Formation,
  FormationDay,
} from "@/types/formation";

/* =========================================================
   SAFE DATE PARSER
========================================================= */

function parseDate(value: unknown): Date | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const raw = String(value).trim();

  if (!raw) {
    return null;
  }

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return null;
    }

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  const parsed = new Date(raw);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/* =========================================================
   DATE RANGE
========================================================= */

function formatDateRange(
  start: unknown,
  end: unknown
): string {
  const startDate = parseDate(start);
  const endDate = parseDate(end);

  if (!startDate && !endDate) {
    return "Dates à confirmer";
  }

  if (startDate && !endDate) {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(startDate);
  }

  if (!startDate || !endDate) {
    return "Dates à confirmer";
  }

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  const startMonth = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
  }).format(startDate);

  const endMonth = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
  }).format(endDate);

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  if (
    startMonth === endMonth &&
    startYear === endYear
  ) {
    return `${startDay} — ${endDay} ${endMonth}`;
  }

  if (startYear === endYear) {
    return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
  }

  return `${startDay} ${startMonth} ${startYear} — ${endDay} ${endMonth} ${endYear}`;
}

/* =========================================================
   PRICE
========================================================= */

function formatPrice(
  value: number | string | null | undefined
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "À venir";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return `${String(value)} €`;
  }

  return `${number.toLocaleString("fr-FR")} €`;
}

/* =========================================================
   PAGE
========================================================= */

export function FormationsListPage() {
  const {
    data: formationData,
    loading,
    error,
  } = useFormations();

  /* =======================================================
     NORMALIZE DATA
  ======================================================= */

  const formations = useMemo<Formation[]>(() => {
    if (!Array.isArray(formationData)) {
      return [];
    }

    return formationData.filter(Boolean);
  }, [formationData]);

  /* =======================================================
     BUILD CARDS

     IMPORTANT:
     On the formations page we display ONE CARD PER CITY.

     Example:

     Paris
     Toulouse
     Bruxelles
     Bordeaux

     If Paris has two sessions, only the first Paris
     session is used for the card.

     The FormationDetailPage still displays ALL sessions.
  ======================================================= */

  const cards = useMemo<
    {
      formation: Formation;
      day: FormationDay;
    }[]
  >(() => {
    const result: {
      formation: Formation;
      day: FormationDay;
    }[] = [];

    formations.forEach((formation) => {
      const days = Array.isArray(
        formation.formationDays
      )
        ? formation.formationDays
        : [];

      const cities = new Map<
        string,
        FormationDay
      >();

      days.forEach((day) => {
        if (!day || !day.city?.trim()) {
          return;
        }

        const key = day.city
          .trim()
          .toLowerCase();

        if (!cities.has(key)) {
          cities.set(key, day);
        }
      });

      cities.forEach((day) => {
        result.push({
          formation,
          day,
        });
      });
    });

    return result;
  }, [formations]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory">
        <section className="py-32 sm:py-40">
          <div className="wrap">
            <p className="label text-ink/40">
              Formations
            </p>

            <h1 className="display mt-6 text-5xl sm:text-6xl lg:text-8xl">
              Nos formations
            </h1>

            <p className="mt-8 max-w-xl text-sm leading-7 text-ink/50">
              Chargement des formations...
            </p>
          </div>
        </section>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="min-h-screen bg-ivory">
        <section className="py-32 sm:py-40">
          <div className="wrap">
            <p className="label text-ink/40">
              Formations
            </p>

            <h1 className="display mt-6 text-5xl sm:text-6xl lg:text-8xl">
              Nos formations
            </h1>

            <div className="mt-10 max-w-xl border-t border-ink/10 pt-8">
              <p className="text-sm leading-7 text-ink/60">
                Impossible de charger les formations.
              </p>

              <p className="mt-3 text-xs leading-6 text-ink/40">
                {error}
              </p>
            </div>

            <Link
              to="/"
              className="mt-10 inline-flex border border-ink px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-white"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-ivory">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="py-20 sm:py-24 lg:py-36">
        <div className="wrap">
          <div className="max-w-5xl">
            <p className="label text-ink/40">
              AS Academy
            </p>

            <h1 className="display mt-6 break-words text-[clamp(3rem,10vw,8rem)] leading-[0.9]">
              Nos formations
            </h1>

            <p className="mt-8 max-w-2xl text-base font-light leading-8 text-ink/60 sm:text-lg">
              Découvrez nos formations professionnelles
              et choisissez la session qui vous convient.
            </p>
          </div>
        </div>
      </section>

      {/* =================================================
          FORMATIONS
      ================================================= */}

      <section className="border-t border-ink/10 py-20 sm:py-24 lg:py-32">
        <div className="wrap">
          {/* SECTION HEADER */}

          <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="label text-ink/40">
                Programme
              </p>

              <h2 className="display mt-4 text-4xl sm:text-5xl lg:text-6xl">
                Toutes nos formations
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-ink/50">
              Choisissez une formation pour découvrir
              les différentes sessions disponibles.
            </p>
          </div>

          {/* EMPTY STATE */}

          {cards.length === 0 ? (
            <div className="border-t border-ink/10 py-16">
              <p className="text-sm text-ink/50">
                Aucune formation disponible pour le
                moment.
              </p>
            </div>
          ) : (
            /* =================================================
               CARDS
            ================================================= */

            <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map(
                ({ formation, day }, index) => (
                  <FormationCard
                    key={`${formation.id}-${day.id}`}
                    formation={formation}
                    formationDay={day}
                    index={index}
                  />
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* =================================================
          INFORMATION
      ================================================= */}

      <section className="border-t border-ink/10 py-20 sm:py-24 lg:py-32">
        <div className="wrap">
          <div className="grid gap-12 lg:grid-cols-[0.35fr_0.65fr]">
            <div>
              <p className="label text-ink/40">
                Informations
              </p>

              <h2 className="display mt-5 text-4xl sm:text-5xl">
                Une formation adaptée à votre projet
              </h2>
            </div>

            <div className="max-w-3xl">
              <p className="text-base font-light leading-8 text-ink/60 sm:text-lg">
                Chaque formation dispose de plusieurs
                sessions selon les villes et les dates
                disponibles.
              </p>

              <p className="mt-6 text-base font-light leading-8 text-ink/60 sm:text-lg">
                Cliquez sur une formation pour consulter
                les dates, les places disponibles, les
                tarifs et effectuer votre réservation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          BACK HOME
      ================================================= */}

      <section className="border-t border-ink/10 py-16">
        <div className="wrap">
          <Link
            to="/"
            className="label text-ink/45 transition-opacity hover:opacity-60"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   DEFAULT EXPORT

   This gives you BOTH possibilities:

   import { FormationsListPage } ...
   import FormationsListPage ...
========================================================= */

export default FormationsListPage;