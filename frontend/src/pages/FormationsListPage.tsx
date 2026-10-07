import { useMemo } from "react";
import { Link } from "react-router-dom";

import { useFormations } from "@/hooks/useFormations";

import type {
  Formation,
  FormationDay,
} from "@/types/formation";

/* =========================================================
   DATE
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

  const startMonth = new Intl.DateTimeFormat(
    "fr-FR",
    {
      month: "long",
    }
  ).format(startDate);

  const endMonth = new Intl.DateTimeFormat(
    "fr-FR",
    {
      month: "long",
    }
  ).format(endDate);

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
     SAFE FORMATIONS
  ======================================================= */

  const formations = useMemo<Formation[]>(() => {
    if (!Array.isArray(formationData)) {
      return [];
    }

    return formationData.filter(Boolean);
  }, [formationData]);

  /* =======================================================
     BUILD CARDS

     ONE CARD PER CITY.

     Example:

     Paris
     Toulouse
     Bruxelles
     Paris
     Bordeaux

     becomes:

     Paris
     Toulouse
     Bruxelles
     Bordeaux

     The detail page still displays ALL sessions.
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
        if (!day) {
          return;
        }

        const city = String(day.city ?? "").trim();

        if (!city) {
          return;
        }

        const key = city.toLowerCase();

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
      <main className="min-h-screen w-full overflow-x-hidden bg-ivory">
        <section className="py-24 sm:py-32 lg:py-40">
          <div className="wrap min-w-0">
            <p className="label text-ink/40">
              AS Academy
            </p>

            <h1
              className="
                display
                mt-6
                max-w-full
                break-words
                text-[clamp(3rem,10vw,8rem)]
                leading-[0.9]
              "
            >
              NOS
              <br />
              FORMATIONS
            </h1>

            <p className="mt-8 max-w-2xl text-base font-light leading-8 text-ink/60 sm:text-lg">
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
      <main className="min-h-screen w-full overflow-x-hidden bg-ivory">
        <section className="py-24 sm:py-32 lg:py-40">
          <div className="wrap min-w-0">
            <p className="label text-ink/40">
              AS Academy
            </p>

            <h1
              className="
                display
                mt-6
                max-w-full
                break-words
                text-[clamp(3rem,10vw,8rem)]
                leading-[0.9]
              "
            >
              NOS
              <br />
              FORMATIONS
            </h1>

            <div className="mt-10 max-w-2xl border-t border-ink/10 pt-8">
              <p className="text-sm leading-7 text-ink/60">
                Impossible de charger les formations.
              </p>

              <p className="mt-3 break-words text-xs leading-6 text-ink/40">
                {error}
              </p>
            </div>

            <Link
              to="/"
              className="
                mt-10
                inline-flex
                max-w-full
                border
                border-ink
                px-6
                py-4
                text-center
                text-xs
                font-semibold
                uppercase
                tracking-[0.18em]
                transition-colors
                hover:bg-ink
                hover:text-white
                sm:px-7
              "
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-ivory">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="w-full overflow-hidden py-20 sm:py-24 lg:py-36">
        <div className="wrap min-w-0">
          <div className="min-w-0 max-w-6xl">

            <p className="label text-ink/40">
              AS Academy
            </p>

            <h1
              className="
                display
                mt-6
                max-w-full
                break-words
                text-[clamp(3rem,10vw,8rem)]
                leading-[0.9]
              "
            >
              NOS
              <br />
              FORMATIONS
            </h1>

            <p
              className="
                mt-8
                max-w-2xl
                break-words
                text-base
                font-light
                leading-8
                text-ink/60
                sm:text-lg
              "
            >
              Découvrez nos formations professionnelles
              et choisissez la session qui vous convient.
            </p>

          </div>
        </div>
      </section>

      {/* =================================================
          FORMATIONS
      ================================================= */}

      <section
        className="
          w-full
          border-t
          border-ink/10
          py-20
          sm:py-24
          lg:py-32
        "
      >
        <div className="wrap min-w-0">

          {/* ONLY TITLE */}

          <div className="mb-12 sm:mb-16">
            <h2
              className="
                display
                max-w-full
                break-words
                text-4xl
                sm:text-5xl
                lg:text-6xl
              "
            >
              Toutes nos formations
            </h2>
          </div>

          {/* =================================================
              EMPTY
          ================================================= */}

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

            <div
              className="
                grid
                min-w-0
                grid-cols-1
                gap-x-8
                gap-y-16
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >

              {cards.map(
                ({ formation, day }, index) => {

                  /* -----------------------------------------
                     PROGRAMME

                     programme is an OBJECT.

                     We NEVER render:

                     {formation.programme}

                     We only use its properties.
                  ----------------------------------------- */

                  const programme =
                    formation.programme &&
                    typeof formation.programme ===
                      "object"
                      ? formation.programme
                      : null;

                  const programmeName =
                    programme?.name ||
                    formation.title ||
                    "Formation";

                  const duration =
                    programme?.duration ||
                    "3 jours";

                  /* -----------------------------------------
                     URL
                  ----------------------------------------- */

                  const detailUrl =
                    `/formations/${formation.slug}` +
                    `?city=${encodeURIComponent(
                      day.city
                    )}` +
                    `&day=${day.id}`;

                  /* -----------------------------------------
                     AVAILABILITY
                  ----------------------------------------- */

                  const remaining =
                    Number(day.remaining_places) || 0;

                  const isAvailable =
                    day.status === "available" &&
                    remaining > 0;

                  /* -----------------------------------------
                     IMAGE
                  ----------------------------------------- */

                  const image =
                    day.image ||
                    formation.image;

                  return (
                    <article
                      key={`${formation.id}-${day.id}`}
                      className="
                        group
                        min-w-0
                      "
                    >

                      {/* IMAGE */}

                      <Link
                        to={detailUrl}
                        aria-label={`${formation.title} — ${day.city}`}
                        className="
                          block
                          min-w-0
                          overflow-hidden
                        "
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={`${formation.title} — ${day.city}`}
                            loading={
                              index < 3
                                ? "eager"
                                : "lazy"
                            }
                            className="
                              aspect-[4/3]
                              w-full
                              max-w-full
                              object-cover
                              transition-transform
                              duration-700
                              ease-out
                              group-hover:scale-[1.02]
                            "
                          />
                        ) : (
                          <div
                            className="
                              aspect-[4/3]
                              w-full
                              bg-ink/5
                            "
                          />
                        )}
                      </Link>

                      {/* CONTENT */}

                      <div className="min-w-0">

                        {/* LABEL */}

                        <p
                          className="
                            label
                            mt-7
                            flex
                            min-w-0
                            flex-wrap
                            items-center
                            gap-x-4
                            gap-y-2
                            text-ink/40
                          "
                        >
                          <span
                            className="
                              font-serif
                              text-lg
                              tracking-normal
                              text-ink/60
                            "
                          >
                            {String(index + 1).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <span className="h-px w-6 bg-current" />

                          <span className="break-words">
                            {programmeName}
                          </span>

                          <span>·</span>

                          <span>
                            {duration}
                          </span>
                        </p>

                        {/* CITY */}

                        <h3
                          className="
                            display
                            mt-4
                            max-w-full
                            break-words
                            text-[clamp(2rem,5vw,3.25rem)]
                            leading-[0.95]
                          "
                        >
                          <Link
                            to={detailUrl}
                            className="
                              transition-opacity
                              hover:opacity-60
                            "
                          >
                            {day.city ||
                              "Ville à confirmer"}
                          </Link>
                        </h3>

                        {/* DATE */}

                        <p
                          className="
                            mt-4
                            text-sm
                            text-ink/60
                          "
                        >
                          {formatDateRange(
                            day.start_date,
                            day.end_date
                          )}
                        </p>

                        {/* DESCRIPTION */}

                        {formation.description && (
                          <div
                            className="
                              mt-5
                              max-w-md
                              break-words
                              text-sm
                              font-light
                              leading-7
                              text-ink/60
                            "
                            dangerouslySetInnerHTML={{
                              __html:
                                formation.description,
                            }}
                          />
                        )}

                        {/* INFORMATION */}

                        <dl
                          className="
                            mt-7
                            grid
                            grid-cols-2
                            border-t
                            border-ink/10
                            sm:grid-cols-3
                          "
                        >

                          {/* DURATION */}

                          <div
                            className="
                              min-w-0
                              border-b
                              border-ink/10
                              py-4
                              pr-4
                            "
                          >
                            <dt
                              className="
                                label
                                text-[10px]
                                text-ink/40
                              "
                            >
                              Durée
                            </dt>

                            <dd
                              className="
                                mt-2
                                break-words
                                font-serif
                                text-xl
                              "
                            >
                              {duration}
                            </dd>
                          </div>

                          {/* PRICE */}

                          <div
                            className="
                              min-w-0
                              border-b
                              border-ink/10
                              py-4
                              pr-4
                            "
                          >
                            <dt
                              className="
                                label
                                text-[10px]
                                text-ink/40
                              "
                            >
                              Tarif
                            </dt>

                            <dd
                              className="
                                mt-2
                                break-words
                                font-serif
                                text-xl
                              "
                            >
                              {formatPrice(
                                day.personal_price ??
                                  formation.personal_price
                              )}
                            </dd>

                            {day.cpf_eligible &&
                              day.cpf_price !== null &&
                              day.cpf_price !==
                                undefined &&
                              day.cpf_price !== "" && (
                                <dd
                                  className="
                                    mt-1
                                    text-xs
                                    text-ink/40
                                  "
                                >
                                  CPF{" "}
                                  {formatPrice(
                                    day.cpf_price
                                  )}
                                </dd>
                              )}
                          </div>

                          {/* PLACES */}

                          <div
                            className="
                              col-span-2
                              min-w-0
                              border-b
                              border-ink/10
                              py-4
                              pr-4
                              sm:col-span-1
                            "
                          >
                            <dt
                              className="
                                label
                                text-[10px]
                                text-ink/40
                              "
                            >
                              Places
                            </dt>

                            <dd
                              className="
                                mt-2
                                break-words
                                font-serif
                                text-xl
                              "
                            >
                              {remaining}
                            </dd>

                            <dd
                              className="
                                mt-1
                                text-xs
                                text-ink/40
                              "
                            >
                              {remaining === 1
                                ? "place restante"
                                : "places restantes"}
                            </dd>
                          </div>

                        </dl>

                        {/* BUTTONS */}

                        <div
                          className="
                            mt-7
                            flex
                            min-w-0
                            flex-wrap
                            gap-3
                          "
                        >

                          <Link
                            to={detailUrl}
                            className={`
                              inline-flex
                              min-h-[48px]
                              max-w-full
                              items-center
                              justify-center
                              border
                              px-6
                              py-3
                              text-center
                              text-xs
                              font-semibold
                              uppercase
                              tracking-[0.18em]
                              transition-colors
                              ${
                                isAvailable
                                  ? "border-ink bg-ink text-white hover:bg-transparent hover:text-ink"
                                  : "border-ink/30 text-ink/50 hover:border-ink hover:text-ink"
                              }
                            `}
                          >
                            {isAvailable
                              ? "Réserver"
                              : "Demander une date"}
                          </Link>

                          <Link
                            to={detailUrl}
                            className="
                              inline-flex
                              min-h-[48px]
                              max-w-full
                              items-center
                              justify-center
                              border
                              border-ink
                              px-6
                              py-3
                              text-center
                              text-xs
                              font-semibold
                              uppercase
                              tracking-[0.18em]
                              transition-colors
                              hover:bg-ink
                              hover:text-white
                            "
                          >
                            Voir la formation
                          </Link>

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </div>
      </section>

      {/* =================================================
          INFORMATION
      ================================================= */}

      <section
        className="
          w-full
          border-t
          border-ink/10
          py-20
          sm:py-24
          lg:py-32
        "
      >
        <div className="wrap min-w-0">

          <div
            className="
              grid
              min-w-0
              gap-12
              lg:grid-cols-[0.35fr_0.65fr]
            "
          >

            <div className="min-w-0">

              <p className="label text-ink/40">
                Informations
              </p>

              <h2
                className="
                  display
                  mt-5
                  max-w-full
                  break-words
                  text-4xl
                  sm:text-5xl
                "
              >
                Une formation adaptée à votre projet
              </h2>

            </div>

            <div className="min-w-0 max-w-3xl">

              <p
                className="
                  break-words
                  text-base
                  font-light
                  leading-8
                  text-ink/60
                  sm:text-lg
                "
              >
                Chaque formation dispose de plusieurs
                sessions selon les villes et les dates
                disponibles.
              </p>

              <p
                className="
                  mt-6
                  break-words
                  text-base
                  font-light
                  leading-8
                  text-ink/60
                  sm:text-lg
                "
              >
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

      <section
        className="
          w-full
          border-t
          border-ink/10
          py-16
        "
      >
        <div className="wrap min-w-0">

          <Link
            to="/"
            className="
              label
              inline-flex
              max-w-full
              break-words
              text-ink/45
              transition-opacity
              hover:opacity-60
            "
          >
            ← Retour à l'accueil
          </Link>

        </div>
      </section>

    </main>
  );
}

/* =========================================================
   EXPORTS
========================================================= */

export default FormationsListPage;