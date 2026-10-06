import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";
import { ReservationForm } from "@/components/booking/ReservationForm";

import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

import type {
  Formation,
  FormationDay,
} from "@/types/formation";

/* =========================================================
   SAFE DATE
========================================================= */

function parseSafeDate(
  value: string | null | undefined
): Date | null {
  if (!value) {
    return null;
  }

  const raw = String(value).trim();

  if (!raw) {
    return null;
  }

  /*
   * YYYY-MM-DD
   *
   * Also works with:
   * YYYY-MM-DDTHH:mm:ss
   * YYYY-MM-DDTHH:mm:ssZ
   */
  const isoMatch = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (!Number.isNaN(date.getTime())) {
      return date;
    }

    return null;
  }

  /*
   * DD/MM/YYYY
   */
  const slashMatch = raw.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (slashMatch) {
    const day = Number(slashMatch[1]);
    const month = Number(slashMatch[2]);
    const year = Number(slashMatch[3]);

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (!Number.isNaN(date.getTime())) {
      return date;
    }

    return null;
  }

  /*
   * DD-MM-YYYY
   */
  const dashMatch = raw.match(
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/
  );

  if (dashMatch) {
    const day = Number(dashMatch[1]);
    const month = Number(dashMatch[2]);
    const year = Number(dashMatch[3]);

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (!Number.isNaN(date.getTime())) {
      return date;
    }

    return null;
  }

  /*
   * Final fallback.
   */
  const fallback = new Date(raw);

  if (!Number.isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  const startDate = parseSafeDate(start);
  const endDate = parseSafeDate(end);

  if (!startDate || !endDate) {
    return "Date à venir";
  }

  const dayFormatter = new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
    }
  );

  const monthFormatter = new Intl.DateTimeFormat(
    "fr-FR",
    {
      month: "long",
    }
  );

  const startDay =
    dayFormatter.format(startDate);

  const endDay =
    dayFormatter.format(endDate);

  const startMonth =
    monthFormatter.format(startDate);

  const endMonth =
    monthFormatter.format(endDate);

  const startYear =
    startDate.getFullYear();

  const endYear =
    endDate.getFullYear();

  if (
    startMonth === endMonth &&
    startYear === endYear
  ) {
    return `${startDay} — ${endDay} ${startMonth}`;
  }

  return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
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
    return "À venir";
  }

  return `${number.toLocaleString(
    "fr-FR"
  )} €`;
}

/* =========================================================
   IMAGE
========================================================= */

function getDayImage(
  formation: Formation,
  day: FormationDay | null
): string | null {
  /*
   * First priority:
   * image of the selected formation day
   *
   * Second priority:
   * formation image
   */
  if (day?.image) {
    return day.image;
  }

  if (formation.image) {
    return formation.image;
  }

  return null;
}

/* =========================================================
   MAIN PAGE
========================================================= */

export function FormationDetailPage() {
  /*
   * Hooks are ALWAYS called.
   *
   * This is important because conditional hooks can cause
   * React error #310.
   */
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

  /*
   * City coming from:
   *
   * /formations/xxx?city=Paris
   */
  const requestedCity =
    searchParams.get("city");

  /*
   * Day coming from:
   *
   * /formations/xxx?day=12
   */
  const requestedDayId =
    searchParams.get("day");

  /*
   * Selected session.
   */
  const [selectedDayId, setSelectedDayId] =
    useState<number | null>(
      requestedDayId
        ? Number(requestedDayId)
        : null
    );

  /* =======================================================
     UPDATE SELECTED DAY FROM URL
  ======================================================= */

  useEffect(() => {
    if (!formation) {
      return;
    }

    const days =
      Array.isArray(
        formation.formationDays
      )
        ? formation.formationDays
        : [];

    if (days.length === 0) {
      setSelectedDayId(null);
      return;
    }

    /*
     * If ?day= exists and is valid.
     */
    if (requestedDayId) {
      const id = Number(requestedDayId);

      const found = days.find(
        (day) => day.id === id
      );

      if (found) {
        setSelectedDayId(found.id);
        return;
      }
    }

    /*
     * If ?city= exists, select the first
     * session of that city.
     */
    if (requestedCity) {
      const cityDay = days.find(
        (day) =>
          day.city.toLowerCase() ===
          requestedCity.toLowerCase()
      );

      if (cityDay) {
        setSelectedDayId(cityDay.id);
        return;
      }
    }

    /*
     * Otherwise select first session.
     */
    setSelectedDayId(days[0].id);
  }, [
    formation,
    requestedCity,
    requestedDayId,
  ]);

  /* =======================================================
     ALL DAYS
  ======================================================= */

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

    return formation.formationDays.filter(
      (day) => day && day.id
    );
  }, [formation]);

  /* =======================================================
     CURRENT CITY
  ======================================================= */

  const currentCity =
    requestedCity ||
    allDays.find(
      (day) =>
        day.id === selectedDayId
    )?.city ||
    allDays[0]?.city ||
    "";

  /* =======================================================
     CITY SESSIONS
  ======================================================= */

  const cityDays = useMemo(() => {
    if (!currentCity) {
      return allDays;
    }

    return allDays.filter(
      (day) =>
        day.city.toLowerCase() ===
        currentCity.toLowerCase()
    );
  }, [allDays, currentCity]);

  /* =======================================================
     SELECTED DAY
  ======================================================= */

  const selectedDay =
    cityDays.find(
      (day) =>
        day.id === selectedDayId
    ) ||
    cityDays[0] ||
    null;

  /* =======================================================
     PROGRAMME
  ======================================================= */

  const programme =
    formation?.programme;

  const duration =
    programme?.duration ||
    "3 jours";

  /* =======================================================
     RESERVATION
  ======================================================= */

  function handleReservation(
    day: FormationDay
  ) {
    setSelectedDayId(day.id);

    setSearchParams({
      city: day.city,
      day: String(day.id),
    });

    /*
     * Wait for React render, then scroll.
     */
    window.setTimeout(() => {
      document
        .getElementById(
          "reservation"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="label text-ink/40">
            FORMATION
          </p>

          <h1 className="display mt-6 text-5xl md:text-7xl">
            Chargement...
          </h1>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !formation) {
    return (
      <main className="min-h-screen bg-ivory px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="label text-ink/40">
            FORMATION
          </p>

          <h1 className="display mt-6 text-5xl md:text-7xl">
            Formation introuvable
          </h1>

          <Link
            to="/formations"
            className="label mt-10 inline-flex border-b border-ink/30 pb-2 text-ink/60 transition-opacity hover:opacity-60"
          >
            ← Toutes les formations
          </Link>
        </div>
      </main>
    );
  }

  /* =======================================================
     IMAGE
  ======================================================= */

  const image =
    getDayImage(
      formation,
      selectedDay
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="bg-ivory text-ink">
      {/* ===================================================
          HERO / DETAIL
      =================================================== */}

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-12 md:px-10 md:pb-28 md:pt-16">
        {/* BACK */}
        <Link
          to="/formations"
          className="label inline-flex items-center gap-3 text-ink/45 transition-opacity hover:opacity-60"
        >
          <span>←</span>
          Toutes les formations
        </Link>

        <div className="mt-12 grid gap-12 md:grid-cols-[1fr_0.82fr] md:gap-20 lg:mt-16">
          {/* =================================================
              IMAGE
          ================================================= */}

          <div>
            {image ? (
              <ImageReveal
                src={image}
                alt={
                  selectedDay
                    ? `${formation.title} — ${selectedDay.city}`
                    : formation.title
                }
                className="aspect-[4/5] w-full"
              />
            ) : (
              <div className="aspect-[4/5] w-full bg-ink/5" />
            )}
          </div>

          {/* =================================================
              INFORMATION
          ================================================= */}

          <div className="flex flex-col justify-center">
            <Reveal>
              {/* PROGRAMME */}
              <p className="label text-ink/40">
                {programme?.name ||
                  formation.title}

                {" · "}

                {duration}
              </p>

              {/* CITY */}
              <h1 className="display mt-5 text-[clamp(3.5rem,8vw,6rem)] leading-[0.9]">
                {selectedDay?.city ||
                  currentCity ||
                  "Formation"}
              </h1>

              {/* DATE */}
              <p className="mt-5 font-serif text-xl text-ink/65 md:text-2xl">
                {selectedDay
                  ? formatDateRange(
                      selectedDay.start_date,
                      selectedDay.end_date
                    )
                  : "Date à venir"}
              </p>

              {/* DESCRIPTION */}
              {formation.description && (
                <div
                  className="mt-7 max-w-xl text-base font-light leading-relaxed text-ink/65"
                  dangerouslySetInnerHTML={{
                    __html:
                      formation.description,
                  }}
                />
              )}

              {/* =================================================
                  INFORMATION TABLE
              ================================================= */}

              {selectedDay && (
                <div className="mt-10 border-t border-ink/10">
                  {/* DUREE */}
                  <div className="flex items-center justify-between border-b border-ink/10 py-4">
                    <span className="label text-[10px] text-ink/40">
                      Durée
                    </span>

                    <span className="font-serif text-lg">
                      {duration}
                    </span>
                  </div>

                  {/* DATES */}
                  <div className="flex items-center justify-between border-b border-ink/10 py-4">
                    <span className="label text-[10px] text-ink/40">
                      Dates
                    </span>

                    <span className="font-serif text-right text-lg">
                      {formatDateRange(
                        selectedDay.start_date,
                        selectedDay.end_date
                      )}
                    </span>
                  </div>

                  {/* VILLE */}
                  <div className="flex items-center justify-between border-b border-ink/10 py-4">
                    <span className="label text-[10px] text-ink/40">
                      Ville
                    </span>

                    <span className="font-serif text-lg">
                      {selectedDay.city}
                    </span>
                  </div>

                  {/* PRIX PERSONNEL */}
                  <div className="flex items-center justify-between border-b border-ink/10 py-4">
                    <span className="label text-[10px] text-ink/40">
                      Financement personnel
                    </span>

                    <span className="font-serif text-lg">
                      {formatPrice(
                        selectedDay.personal_price ??
                          formation.personal_price
                      )}
                    </span>
                  </div>

                  {/* CPF */}
                  {selectedDay.cpf_eligible && (
                    <div className="flex items-center justify-between border-b border-ink/10 py-4">
                      <span className="label text-[10px] text-ink/40">
                        Financement CPF
                      </span>

                      <span className="font-serif text-lg">
                        {formatPrice(
                          selectedDay.cpf_price
                        )}
                      </span>
                    </div>
                  )}

                  {/* ACOMPTE */}
                  <div className="flex items-center justify-between border-b border-ink/10 py-4">
                    <span className="label text-[10px] text-ink/40">
                      Acompte
                    </span>

                    <span className="font-serif text-lg">
                      {formatPrice(
                        formation.deposit_amount
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* =================================================
                  PROGRAMME
              ================================================= */}

              {Array.isArray(
                formation.steps
              ) &&
                formation.steps.length >
                  0 && (
                  <div className="mt-10">
                    <p className="label mb-6 text-ink/40">
                      Programme
                    </p>

                    <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                      {formation.steps.map(
                        (
                          step,
                          index
                        ) => (
                          <div
                            key={`${step.title}-${index}`}
                          >
                            <div className="flex gap-5">
                              <span className="label text-ink/40">
                                {String(
                                  index + 1
                                ).padStart(
                                  2,
                                  "0"
                                )}
                              </span>

                              <div>
                                <h3 className="font-serif text-lg">
                                  {
                                    step.title
                                  }
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
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* =================================================
                  RESERVE CURRENT SESSION
              ================================================= */}

              {selectedDay && (
                <button
                  type="button"
                  onClick={() =>
                    handleReservation(
                      selectedDay
                    )
                  }
                  className="mt-10 inline-flex items-center gap-8 bg-ink px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-ivory transition-opacity hover:opacity-80"
                >
                  Réserver ma place
                  <span className="text-base">
                    →
                  </span>
                </button>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* =====================================================
          SESSIONS DISPONIBLES
      ===================================================== */}

      {cityDays.length > 0 && (
        <section className="border-t border-ink/10">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
            <p className="label text-ink/40">
              Sessions disponibles
            </p>

            <h2 className="display mt-5 text-5xl md:text-7xl">
              {currentCity}
            </h2>

            <div className="mt-12 border-t border-ink/10">
              {cityDays.map(
                (day) => {
                  const isSelected =
                    selectedDayId ===
                    day.id;

                  return (
                    <div
                      key={day.id}
                      className="border-b border-ink/10 py-8"
                    >
                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        {/* DATE */}
                        <div>
                          <p className="font-serif text-2xl">
                            {day.city}
                          </p>

                          <p className="mt-2 text-sm font-light text-ink/55">
                            {formatDateRange(
                              day.start_date,
                              day.end_date
                            )}
                          </p>

                          <p className="mt-2 text-xs text-ink/45">
                            {day.remaining_places >
                            0
                              ? `${day.remaining_places} places restantes`
                              : "Complet"}
                          </p>
                        </div>

                        {/* PRICE */}
                        <div className="flex flex-wrap items-center gap-8 md:justify-end">
                          <div className="text-right">
                            <p className="font-serif text-xl">
                              {formatPrice(
                                day.personal_price ??
                                  formation.personal_price
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
                                formation.deposit_amount
                              )}
                            </p>
                          </div>

                          {/* RESERVE */}
                          <button
                            type="button"
                            disabled={
                              day.remaining_places <=
                              0
                            }
                            onClick={() =>
                              handleReservation(
                                day
                              )
                            }
                            className={`inline-flex items-center gap-6 px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-opacity ${
                              day.remaining_places >
                              0
                                ? "bg-ink text-ivory hover:opacity-80"
                                : "cursor-not-allowed border border-ink/15 text-ink/30"
                            }`}
                          >
                            {day.remaining_places >
                            0
                              ? "Réserver"
                              : "Complet"}

                            {day.remaining_places >
                              0 && (
                              <span className="text-base">
                                →
                              </span>
                            )}
                          </button>
                        </div>
                      </div>

                      {isSelected && (
                        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-ink/35">
                          Session sélectionnée
                        </p>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          RESERVATION
      ===================================================== */}

      {selectedDay && (
        <section
          id="reservation"
          className="border-t border-ink/10"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
            <div className="grid gap-12 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
              {/* LEFT */}
              <div>
                <p className="label text-ink/40">
                  Réservation
                </p>

                <h2 className="display mt-6 text-5xl leading-[0.95] md:text-6xl">
                  Réserver
                  <br />
                  ma place
                </h2>

                <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-ink/55">
                  Remplissez vos coordonnées
                  pour réserver votre place
                  pour cette session.
                </p>

                <div className="mt-10 border-t border-ink/10">
                  <div className="flex items-center justify-between border-b border-ink/10 py-4">
                    <span className="label text-[10px] text-ink/40">
                      Formation
                    </span>

                    <span className="font-serif">
                      {formation.title}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-ink/10 py-4">
                    <span className="label text-[10px] text-ink/40">
                      Ville
                    </span>

                    <span className="font-serif">
                      {selectedDay.city}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-ink/10 py-4">
                    <span className="label text-[10px] text-ink/40">
                      Dates
                    </span>

                    <span className="font-serif text-right">
                      {formatDateRange(
                        selectedDay.start_date,
                        selectedDay.end_date
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-ink/10 py-4">
                    <span className="label text-[10px] text-ink/40">
                      Acompte
                    </span>

                    <span className="font-serif">
                      {formatPrice(
                        formation.deposit_amount
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

export default FormationDetailPage;