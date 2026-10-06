import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";
import { ReservationForm } from "@/components/booking/ReservationForm";

import type {
  Formation,
  FormationDay,
} from "@/types/formation";

/* =========================================================
   STATIC FALLBACK DATES
========================================================= */

const DEFAULT_START_DATE = "2026-09-10";
const DEFAULT_END_DATE = "2026-09-12";

/* =========================================================
   SAFE DATE
========================================================= */

function parseSafeDate(
  value: string | null | undefined,
  fallback: string
): Date {
  const raw =
    typeof value === "string" && value.trim()
      ? value.trim()
      : fallback;

  let date: Date;

  /*
   * Laravel usually returns YYYY-MM-DD.
   * Adding T00:00:00 avoids timezone surprises.
   */
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    date = new Date(`${raw}T00:00:00`);
  } else {
    date = new Date(raw);
  }

  /*
   * FINAL protection.
   */
  if (Number.isNaN(date.getTime())) {
    date = new Date(`${fallback}T00:00:00`);
  }

  return date;
}

/* =========================================================
   SAFE DATE RANGE
========================================================= */

function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  const startDate = parseSafeDate(
    start,
    DEFAULT_START_DATE
  );

  const endDate = parseSafeDate(
    end,
    DEFAULT_END_DATE
  );

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  const startMonth =
    startDate.toLocaleDateString("fr-FR", {
      month: "long",
    });

  const endMonth =
    endDate.toLocaleDateString("fr-FR", {
      month: "long",
    });

  const startYear =
    startDate.getFullYear();

  const endYear =
    endDate.getFullYear();

  /*
   * Same month / same year
   *
   * 10 — 12 septembre
   */
  if (
    startMonth === endMonth &&
    startYear === endYear
  ) {
    return `${String(startDay).padStart(
      2,
      "0"
    )} — ${String(endDay).padStart(
      2,
      "0"
    )} ${endMonth}`;
  }

  /*
   * Same year / different month
   *
   * 30 septembre — 02 octobre
   */
  if (startYear === endYear) {
    return `${String(startDay).padStart(
      2,
      "0"
    )} ${startMonth} — ${String(
      endDay
    ).padStart(2, "0")} ${endMonth}`;
  }

  /*
   * Different years
   */
  return `${String(startDay).padStart(
    2,
    "0"
  )} ${startMonth} ${startYear} — ${String(
    endDay
  ).padStart(2, "0")} ${endMonth} ${endYear}`;
}

/* =========================================================
   SAFE PRICE
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

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return "À venir";
  }

  return `${numberValue.toLocaleString(
    "fr-FR"
  )} €`;
}

/* =========================================================
   NUMBER
========================================================= */

function numericValue(
  value: number | string | null | undefined,
  fallback = 0
): number {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  const result = Number(value);

  return Number.isNaN(result)
    ? fallback
    : result;
}

/* =========================================================
   IMAGE
========================================================= */

function getFormationImage(
  formation: Formation,
  day: FormationDay | null
): string | null {
  /*
   * Priority:
   *
   * 1. FormationDay image
   * 2. Formation image
   */

  if (
    day?.image &&
    typeof day.image === "string" &&
    day.image.trim()
  ) {
    return day.image;
  }

  if (
    formation.image &&
    typeof formation.image === "string" &&
    formation.image.trim()
  ) {
    return formation.image;
  }

  return null;
}

/* =========================================================
   MAIN PAGE
========================================================= */

export function FormationDetailPage() {
  /*
   * IMPORTANT:
   * All hooks are declared BEFORE any return.
   * This prevents React error #310.
   */

  const [searchParams, setSearchParams] =
    useSearchParams();

  const slug =
    searchParams.get("slug") ??
    undefined;

  /*
   * In React Router:
   * slug normally comes from useParams.
   *
   * We import it separately below.
   */

  return (
    <FormationDetailContent
      searchParams={searchParams}
      setSearchParams={setSearchParams}
      slug={slug}
    />
  );
}

/* =========================================================
   CONTENT
========================================================= */

interface FormationDetailContentProps {
  searchParams: URLSearchParams;
  setSearchParams: (
    params:
      | URLSearchParams
      | Record<string, string>
  ) => void;
  slug?: string;
}

/*
 * We use this small wrapper because the route slug
 * should come from useParams.
 */

importedFix();

/* =========================================================
   ROUTE VERSION
========================================================= */

function importedFix() {
  /*
   * Intentionally empty.
   *
   * The real page implementation is below.
   */
}

/* =========================================================
   ACTUAL DETAIL PAGE
========================================================= */

import { useParams } from "react-router-dom";

function FormationDetailContentReal() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const {
    data: formation,
    loading,
    error,
  } = useFormation(slug);

  const cityParam =
    searchParams.get("city");

  const dayParam =
    searchParams.get("day");

  /*
   * Reservation state
   */
  const [showReservation, setShowReservation] =
    useState(false);

  const [selectedDay, setSelectedDay] =
    useState<FormationDay | null>(null);

  /*
   * -------------------------------------------------------
   * FIND CITY
   * -------------------------------------------------------
   */

  const normalizedCity =
    cityParam?.trim().toLowerCase() ?? "";

  /*
   * -------------------------------------------------------
   * ALL DAYS
   * -------------------------------------------------------
   */

  const allDays = useMemo(() => {
    if (!formation) {
      return [];
    }

    if (
      !Array.isArray(
        formation.formationDays
      )
    ) {
      return [];
    }

    return formation.formationDays;
  }, [formation]);

  /*
   * -------------------------------------------------------
   * DAYS FOR SELECTED CITY
   *
   * If city=Paris:
   *
   * Paris 10-12
   * Paris 08-15
   *
   * NOT Toulouse
   * NOT Bruxelles
   * NOT Bordeaux
   * -------------------------------------------------------
   */

  const cityDays = useMemo(() => {
    if (!normalizedCity) {
      return allDays;
    }

    return allDays.filter((day) => {
      return (
        String(day.city ?? "")
          .trim()
          .toLowerCase() ===
        normalizedCity
      );
    });
  }, [allDays, normalizedCity]);

  /*
   * -------------------------------------------------------
   * SELECTED DAY
   * -------------------------------------------------------
   */

  const currentDay = useMemo(() => {
    if (dayParam) {
      const byId = cityDays.find(
        (day) =>
          String(day.id) ===
          String(dayParam)
      );

      if (byId) {
        return byId;
      }
    }

    /*
     * If no ?day=
     * use first day of selected city.
     */

    return cityDays[0] ?? null;
  }, [cityDays, dayParam]);

  /*
   * -------------------------------------------------------
   * KEEP SELECTED DAY VALID
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!currentDay) {
      return;
    }

    setSelectedDay(currentDay);
  }, [currentDay]);

  /*
   * -------------------------------------------------------
   * IMAGE
   * -------------------------------------------------------
   */

  const heroImage = useMemo(() => {
    if (!formation) {
      return null;
    }

    return getFormationImage(
      formation,
      currentDay
    );
  }, [formation, currentDay]);

  /*
   * -------------------------------------------------------
   * RESERVATION
   * -------------------------------------------------------
   */

  function openReservation(
    day: FormationDay
  ) {
    setSelectedDay(day);

    setShowReservation(true);

    /*
     * Update URL without reloading page.
     */

    const params =
      new URLSearchParams(
        searchParams
      );

    params.set(
      "city",
      day.city
    );

    params.set(
      "day",
      String(day.id)
    );

    setSearchParams(params, {
      replace: true,
    });

    /*
     * Wait until DOM renders reservation.
     */

    window.setTimeout(() => {
      document
        .getElementById("reservation")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  /*
   * -------------------------------------------------------
   * LOADING
   * -------------------------------------------------------
   */

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-32 md:px-10">
        <p className="label text-ink/40">
          CHARGEMENT
        </p>

        <h1 className="display mt-6 text-5xl">
          Formation
        </h1>
      </main>
    );
  }

  /*
   * -------------------------------------------------------
   * ERROR
   * -------------------------------------------------------
   */

  if (error || !formation) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-32 md:px-10">
        <p className="label text-ink/40">
          FORMATION
        </p>

        <h1 className="display mt-6 text-5xl">
          Formation introuvable
        </h1>

        <Link
          to="/formations"
          className="label mt-10 inline-flex text-ink/60 transition-opacity hover:opacity-50"
        >
          ← Toutes les formations
        </Link>
      </main>
    );
  }

  /*
   * -------------------------------------------------------
   * VALUES
   * -------------------------------------------------------
   */

  const programmeName =
    formation.programme?.name ??
    formation.title;

  const duration =
    formation.programme?.duration ??
    "3 jours";

  const deposit =
    numericValue(
      formation.deposit_amount,
      150
    );

  const personalPrice =
    currentDay
      ? numericValue(
          currentDay.personal_price ??
            formation.personal_price
        )
      : numericValue(
          formation.personal_price
        );

  /*
   * -------------------------------------------------------
   * RENDER
   * -------------------------------------------------------
   */

  return (
    <main className="bg-ivory text-ink">
      {/* ===================================================
          BACK
      =================================================== */}

      <section className="mx-auto max-w-7xl px-6 pb-8 pt-16 md:px-10 md:pt-20">
        <Link
          to="/formations"
          className="label text-ink/45 transition-opacity hover:opacity-60"
        >
          ← Toutes les formations
        </Link>
      </section>

      {/* ===================================================
          HERO DETAIL
      =================================================== */}

      <section className="mx-auto max-w-7xl px-6 pb-20 md:px-10 md:pb-28">
        <div className="grid gap-12 md:grid-cols-[1.05fr_0.95fr] md:items-start md:gap-20">
          {/* IMAGE */}

          <div className="overflow-hidden">
            {heroImage ? (
              <img
                src={heroImage}
                alt={formation.title}
                className="block aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="aspect-[4/5] w-full bg-ink/5" />
            )}
          </div>

          {/* INFORMATION */}

          <div className="pt-2">
            {/* LABEL */}

            <p className="label text-ink/45">
              {programmeName}
              {" · "}
              {duration}
            </p>

            {/* CITY */}

            <h1 className="display mt-5 text-[clamp(3.5rem,8vw,6.5rem)] leading-[0.9]">
              {currentDay?.city ??
                cityParam ??
                "Formation"}
            </h1>

            {/* DATE */}

            <p className="mt-5 font-serif text-xl text-ink/60 md:text-2xl">
              {currentDay
                ? formatDateRange(
                    currentDay.start_date,
                    currentDay.end_date
                  )
                : formatDateRange(
                    null,
                    null
                  )}
            </p>

            {/* DESCRIPTION */}

            {formation.description && (
              <div
                className="prose prose-sm mt-7 max-w-xl font-light leading-relaxed text-ink/65"
                dangerouslySetInnerHTML={{
                  __html:
                    formation.description,
                }}
              />
            )}

            {/* =================================================
                META
            ================================================= */}

            <div className="mt-10 border-t border-ink/10">
              {/* DURATION */}

              <div className="flex items-center justify-between border-b border-ink/10 py-5">
                <span className="label text-ink/40">
                  DURÉE
                </span>

                <span className="font-serif text-lg">
                  {duration}
                </span>
              </div>

              {/* DATE */}

              <div className="flex items-center justify-between border-b border-ink/10 py-5">
                <span className="label text-ink/40">
                  DATES
                </span>

                <span className="font-serif text-right">
                  {currentDay
                    ? formatDateRange(
                        currentDay.start_date,
                        currentDay.end_date
                      )
                    : "Date à venir"}
                </span>
              </div>

              {/* CITY */}

              <div className="flex items-center justify-between border-b border-ink/10 py-5">
                <span className="label text-ink/40">
                  VILLE
                </span>

                <span className="font-serif">
                  {currentDay?.city ??
                    cityParam ??
                    "—"}
                </span>
              </div>

              {/* PERSONAL PRICE */}

              <div className="flex items-center justify-between border-b border-ink/10 py-5">
                <span className="label text-ink/40">
                  FINANCEMENT PERSONNEL
                </span>

                <span className="font-serif">
                  {formatPrice(
                    currentDay?.personal_price ??
                      formation.personal_price
                  )}
                </span>
              </div>

              {/* CPF */}

              {currentDay?.cpf_eligible && (
                <div className="flex items-center justify-between border-b border-ink/10 py-5">
                  <span className="label text-ink/40">
                    FINANCEMENT CPF
                  </span>

                  <span className="font-serif">
                    {formatPrice(
                      currentDay.cpf_price
                    )}
                  </span>
                </div>
              )}

              {/* DEPOSIT */}

              <div className="flex items-center justify-between border-b border-ink/10 py-5">
                <span className="label text-ink/40">
                  ACOMPTE
                </span>

                <span className="font-serif">
                  {formatPrice(deposit)}
                </span>
              </div>
            </div>

            {/* =================================================
                PROGRAM
            ================================================= */}

            {Array.isArray(
              formation.steps
            ) &&
              formation.steps.length > 0 && (
                <div className="mt-12">
                  <p className="label mb-7 text-ink/45">
                    PROGRAMME
                  </p>

                  <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
                    {formation.steps.map(
                      (step, index) => (
                        <div
                          key={`${step.title}-${index}`}
                          className="flex gap-5"
                        >
                          <span className="label text-ink/35">
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </span>

                          <div>
                            <h3 className="font-serif text-lg">
                              {step.title}
                            </h3>

                            {step.description && (
                              <p className="mt-2 text-sm font-light leading-relaxed text-ink/50">
                                {
                                  step.description
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* =================================================
                PDF
            ================================================= */}

            {formation.pdf_program && (
              <div className="mt-8">
                <a
                  href={
                    formation.pdf_program
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label inline-flex border-b border-ink/30 pb-1 text-ink/65 transition-opacity hover:opacity-50"
                >
                  Télécharger le programme PDF →
                </a>
              </div>
            )}

            {/* =================================================
                MAIN RESERVE BUTTON
            ================================================= */}

            {currentDay && (
              <button
                type="button"
                onClick={() =>
                  openReservation(
                    currentDay
                  )
                }
                className="mt-10 inline-flex items-center gap-8 bg-ink px-8 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory transition-opacity hover:opacity-80"
              >
                RÉSERVER MA PLACE

                <span className="text-base">
                  →
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          AVAILABLE SESSIONS
      ===================================================== */}

      <section
        id="sessions"
        className="border-t border-ink/10"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <p className="label text-ink/45">
            SESSIONS DISPONIBLES
          </p>

          <h2 className="display mt-6 text-[clamp(3rem,7vw,5rem)]">
            {cityParam ??
              currentDay?.city ??
              "Toutes les villes"}
          </h2>

          <div className="mt-12">
            {cityDays.length === 0 ? (
              <div className="border-t border-ink/10 py-10">
                <p className="font-serif text-xl text-ink/60">
                  Aucune session disponible
                  pour cette ville.
                </p>
              </div>
            ) : (
              cityDays.map((day) => {
                const isAvailable =
                  day.remaining_places > 0 &&
                  day.status !== "completed" &&
                  day.status !== "finished";

                const dayPrice =
                  day.personal_price ??
                  formation.personal_price;

                return (
                  <div
                    key={day.id}
                    className="border-t border-ink/10 py-7 last:border-b"
                  >
                    <div className="grid gap-6 md:grid-cols-[1fr_auto_auto] md:items-center md:gap-10">
                      {/* SESSION */}

                      <div>
                        <p className="font-serif text-2xl">
                          {day.city}
                        </p>

                        <p className="mt-2 font-serif text-lg text-ink/60">
                          {formatDateRange(
                            day.start_date,
                            day.end_date
                          )}
                        </p>

                        <p className="mt-2 text-xs text-ink/45">
                          {day.remaining_places >
                          0
                            ? `${day.remaining_places} ${
                                day.remaining_places >
                                1
                                  ? "places"
                                  : "place"
                              } restante${
                                day.remaining_places >
                                1
                                  ? "s"
                                  : ""
                              }`
                            : "Complet"}
                        </p>
                      </div>

                      {/* PRICE */}

                      <div className="md:text-right">
                        <p className="font-serif text-xl">
                          {formatPrice(
                            dayPrice
                          )}
                        </p>

                        {day.cpf_eligible &&
                          day.cpf_price && (
                            <p className="mt-1 text-xs text-ink/45">
                              CPF{" "}
                              {formatPrice(
                                day.cpf_price
                              )}
                            </p>
                          )}

                        <p className="mt-1 text-xs text-ink/45">
                          Acompte{" "}
                          {formatPrice(
                            formation.deposit_amount ??
                              150
                          )}
                        </p>
                      </div>

                      {/* BUTTON */}

                      <div>
                        <button
                          type="button"
                          disabled={
                            !isAvailable
                          }
                          onClick={() =>
                            openReservation(
                              day
                            )
                          }
                          className={
                            isAvailable
                              ? "inline-flex min-w-[135px] items-center justify-center gap-5 bg-ink px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory transition-opacity hover:opacity-80"
                              : "inline-flex min-w-[135px] items-center justify-center border border-ink/15 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/30"
                          }
                        >
                          {isAvailable
                            ? "RÉSERVER"
                            : "COMPLET"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          RESERVATION
      ===================================================== */}

      {showReservation &&
        selectedDay && (
          <section
            id="reservation"
            className="border-t border-ink/10"
          >
            <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
              <div className="grid gap-12 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
                {/* LEFT */}

                <div>
                  <p className="label text-ink/45">
                    RÉSERVATION
                  </p>

                  <h2 className="display mt-6 text-[clamp(3rem,6vw,5rem)] leading-[0.95]">
                    RÉSERVER
                    <br />
                    MA PLACE
                  </h2>

                  <p className="mt-7 max-w-sm text-sm font-light leading-relaxed text-ink/55">
                    Remplissez vos
                    coordonnées pour
                    réserver votre place
                    auprès de l'académie.
                  </p>

                  <div className="mt-10 border-t border-ink/10">
                    {/* FORMATION */}

                    <div className="flex items-center justify-between border-b border-ink/10 py-5">
                      <span className="label text-ink/40">
                        FORMATION
                      </span>

                      <span className="font-serif text-right">
                        {formation.title}
                      </span>
                    </div>

                    {/* CITY */}

                    <div className="flex items-center justify-between border-b border-ink/10 py-5">
                      <span className="label text-ink/40">
                        VILLE
                      </span>

                      <span className="font-serif">
                        {
                          selectedDay.city
                        }
                      </span>
                    </div>

                    {/* DATE */}

                    <div className="flex items-center justify-between border-b border-ink/10 py-5">
                      <span className="label text-ink/40">
                        DATES
                      </span>

                      <span className="font-serif text-right">
                        {formatDateRange(
                          selectedDay.start_date,
                          selectedDay.end_date
                        )}
                      </span>
                    </div>

                    {/* PRICE */}

                    <div className="flex items-center justify-between border-b border-ink/10 py-5">
                      <span className="label text-ink/40">
                        TARIF
                      </span>

                      <span className="font-serif">
                        {formatPrice(
                          selectedDay.personal_price ??
                            formation.personal_price
                        )}
                      </span>
                    </div>

                    {/* DEPOSIT */}

                    <div className="flex items-center justify-between border-b border-ink/10 py-5">
                      <span className="label text-ink/40">
                        ACOMPTE
                      </span>

                      <span className="font-serif">
                        {formatPrice(
                          formation.deposit_amount ??
                            150
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FORM */}

                <div>
                  <ReservationForm
                    formation={
                      formation
                    }
                    formationDay={
                      selectedDay
                    }
                  />
                </div>
              </div>
            </div>
          </section>
        )}

      {/* =====================================================
          BACK
      ===================================================== */}

      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">
          <Link
            to="/formations"
            className="label text-ink/45 transition-opacity hover:opacity-60"
          >
            ← Toutes les formations
          </Link>
        </div>
      </section>
    </main>
  );
}

/*
 * IMPORTANT:
 *
 * Export the real component.
 */

export { FormationDetailContentReal as FormationDetailPageReal };