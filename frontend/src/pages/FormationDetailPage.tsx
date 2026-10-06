import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";
import { ReservationForm } from "@/components/booking/ReservationForm";

import type {
  Formation,
  FormationDay,
} from "@/types/formation";

/* =========================================================
   FALLBACK DATES
========================================================= */

const DEFAULT_START_DATE = "2026-09-10";
const DEFAULT_END_DATE = "2026-09-12";

/* =========================================================
   SAFE DATE
========================================================= */

function safeDate(
  value: string | null | undefined,
  fallback: string
): Date {
  const raw =
    typeof value === "string" &&
    value.trim() !== ""
      ? value.trim()
      : fallback;

  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(raw)
      ? `${raw}T00:00:00`
      : raw
  );

  if (Number.isNaN(date.getTime())) {
    return new Date(`${fallback}T00:00:00`);
  }

  return date;
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  const startDate = safeDate(
    start,
    DEFAULT_START_DATE
  );

  const endDate = safeDate(
    end,
    DEFAULT_END_DATE
  );

  const startDay = String(
    startDate.getDate()
  ).padStart(2, "0");

  const endDay = String(
    endDate.getDate()
  ).padStart(2, "0");

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
    return "À venir";
  }

  return `${number.toLocaleString("fr-FR")} €`;
}

/* =========================================================
   IMAGE
========================================================= */

function getImage(
  formation: Formation,
  day: FormationDay | null
): string | null {
  if (
    day?.image &&
    typeof day.image === "string" &&
    day.image.trim() !== ""
  ) {
    return day.image;
  }

  if (
    formation.image &&
    typeof formation.image === "string" &&
    formation.image.trim() !== ""
  ) {
    return formation.image;
  }

  return null;
}

/* =========================================================
   PAGE
========================================================= */

export function FormationDetailPage() {
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

  const [showReservation, setShowReservation] =
    useState(false);

  const [selectedDay, setSelectedDay] =
    useState<FormationDay | null>(null);

  /* =======================================================
     CITY FROM URL
  ======================================================= */

  const cityParam =
    searchParams.get("city");

  const dayParam =
    searchParams.get("day");

  const normalizedCity =
    cityParam?.trim().toLowerCase() ?? "";

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

    return formation.formationDays;
  }, [formation]);

  /* =======================================================
     CITY DAYS
     
     Example:
     ?city=Paris

     Shows ONLY Paris sessions.
  ======================================================= */

  const cityDays = useMemo(() => {
    if (!normalizedCity) {
      return allDays;
    }

    return allDays.filter(
      (day) =>
        String(day.city ?? "")
          .trim()
          .toLowerCase() ===
        normalizedCity
    );
  }, [allDays, normalizedCity]);

  /* =======================================================
     CURRENT DAY
  ======================================================= */

  const currentDay = useMemo(() => {
    if (dayParam) {
      const found = cityDays.find(
        (day) =>
          String(day.id) ===
          String(dayParam)
      );

      if (found) {
        return found;
      }
    }

    return cityDays[0] ?? null;
  }, [cityDays, dayParam]);

  /* =======================================================
     INITIAL SELECTED DAY
  ======================================================= */

  useEffect(() => {
    if (currentDay) {
      setSelectedDay(currentDay);
    }
  }, [currentDay]);

  /* =======================================================
     IMAGE
  ======================================================= */

  const heroImage = useMemo(() => {
    if (!formation) {
      return null;
    }

    return getImage(
      formation,
      selectedDay
    );
  }, [formation, selectedDay]);

  /* =======================================================
     RESERVE
  ======================================================= */

  function handleReserve(
    day: FormationDay
  ) {
    setSelectedDay(day);
    setShowReservation(true);

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

    window.setTimeout(() => {
      document
        .getElementById("reservation")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  /* =======================================================
     LOADING
  ======================================================= */

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

  /* =======================================================
     ERROR
  ======================================================= */

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
          className="label mt-10 inline-block text-ink/50 hover:opacity-60"
        >
          ← Toutes les formations
        </Link>
      </main>
    );
  }

  /* =======================================================
     VALUES
  ======================================================= */

  const programme =
    formation.programme?.name ??
    formation.title;

  const duration =
    formation.programme?.duration ??
    "3 jours";

  const deposit =
    formation.deposit_amount ??
    150;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="bg-ivory text-ink">

      {/* ===================================================
          BACK
      =================================================== */}

      <section className="mx-auto max-w-7xl px-6 pb-8 pt-16 md:px-10">
        <Link
          to="/formations"
          className="label text-ink/45 hover:opacity-60"
        >
          ← Toutes les formations
        </Link>
      </section>

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <div className="grid gap-12 md:grid-cols-2 md:gap-20">

          {/* IMAGE */}

          <div className="overflow-hidden">
            {heroImage ? (
              <img
                src={heroImage}
                alt={formation.title}
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="aspect-[4/5] w-full bg-ink/5" />
            )}
          </div>

          {/* CONTENT */}

          <div className="pt-2">

            <p className="label text-ink/40">
              {programme}
              {" · "}
              {duration}
            </p>

            <h1 className="display mt-5 text-[clamp(3.5rem,8vw,6.5rem)] leading-[0.9]">
              {selectedDay?.city ??
                cityParam ??
                formation.title}
            </h1>

            <p className="mt-6 font-serif text-xl text-ink/60">
              {selectedDay
                ? formatDateRange(
                    selectedDay.start_date,
                    selectedDay.end_date
                  )
                : formatDateRange(
                    null,
                    null
                  )}
            </p>

            {/* DESCRIPTION */}

            {formation.description && (
              <div
                className="mt-7 max-w-xl text-base font-light leading-relaxed text-ink/60"
                dangerouslySetInnerHTML={{
                  __html:
                    formation.description,
                }}
              />
            )}

            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="mt-10 border-t border-ink/10">

              <div className="flex justify-between border-b border-ink/10 py-5">
                <span className="label text-ink/40">
                  DURÉE
                </span>

                <span className="font-serif">
                  {duration}
                </span>
              </div>

              <div className="flex justify-between border-b border-ink/10 py-5">
                <span className="label text-ink/40">
                  VILLE
                </span>

                <span className="font-serif">
                  {selectedDay?.city ??
                    cityParam ??
                    "—"}
                </span>
              </div>

              <div className="flex justify-between border-b border-ink/10 py-5">
                <span className="label text-ink/40">
                  TARIF
                </span>

                <span className="font-serif">
                  {formatPrice(
                    selectedDay?.personal_price ??
                      formation.personal_price
                  )}
                </span>
              </div>

              {selectedDay?.cpf_eligible && (
                <div className="flex justify-between border-b border-ink/10 py-5">
                  <span className="label text-ink/40">
                    CPF
                  </span>

                  <span className="font-serif">
                    {formatPrice(
                      selectedDay.cpf_price
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-b border-ink/10 py-5">
                <span className="label text-ink/40">
                  ACOMPTE
                </span>

                <span className="font-serif">
                  {formatPrice(
                    deposit
                  )}
                </span>
              </div>
            </div>

            {/* =================================================
                PROGRAMME
            ================================================= */}

            {Array.isArray(
              formation.steps
            ) &&
              formation.steps.length > 0 && (
                <div className="mt-12">

                  <p className="label mb-7 text-ink/40">
                    PROGRAMME
                  </p>

                  <div className="space-y-7">
                    {formation.steps.map(
                      (step, index) => (
                        <div
                          key={`${step.title}-${index}`}
                          className="flex gap-5"
                        >
                          <span className="label text-ink/30">
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
              <a
                href={
                  formation.pdf_program
                }
                target="_blank"
                rel="noopener noreferrer"
                className="label mt-8 inline-block border-b border-ink/20 pb-1 text-ink/60 hover:opacity-60"
              >
                Télécharger le programme PDF →
              </a>
            )}

            {/* =================================================
                RESERVE
            ================================================= */}

            {selectedDay && (
              <button
                type="button"
                onClick={() =>
                  handleReserve(
                    selectedDay
                  )
                }
                className="mt-10 inline-flex items-center gap-7 bg-ink px-8 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory hover:opacity-80"
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

      {/* ===================================================
          SESSIONS DISPONIBLES
      =================================================== */}

      <section
        id="sessions"
        className="border-t border-ink/10"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10">

          <p className="label text-ink/40">
            SESSIONS DISPONIBLES
          </p>

          <h2 className="display mt-5 text-[clamp(3rem,7vw,5rem)]">
            {cityParam ??
              selectedDay?.city ??
              "Toutes les villes"}
          </h2>

          <div className="mt-12">

            {cityDays.length === 0 ? (
              <div className="border-t border-ink/10 py-10">
                <p className="font-serif text-xl text-ink/50">
                  Aucune session disponible
                  pour cette ville.
                </p>
              </div>
            ) : (
              cityDays.map((day) => {

                const available =
                  day.remaining_places > 0 &&
                  day.status !==
                    "completed" &&
                  day.status !==
                    "finished";

                return (
                  <div
                    key={day.id}
                    className="border-t border-ink/10 py-7"
                  >

                    <div className="grid gap-6 md:grid-cols-[1fr_auto_auto] md:items-center md:gap-12">

                      {/* SESSION */}

                      <div>
                        <p className="font-serif text-2xl">
                          {day.city}
                        </p>

                        <p className="mt-2 font-serif text-lg text-ink/55">
                          {formatDateRange(
                            day.start_date,
                            day.end_date
                          )}
                        </p>

                        <p className="mt-2 text-xs text-ink/40">
                          {day.remaining_places > 0
                            ? `${day.remaining_places} ${
                                day.remaining_places ===
                                1
                                  ? "place"
                                  : "places"
                              } restante${
                                day.remaining_places ===
                                1
                                  ? ""
                                  : "s"
                              }`
                            : "Complet"}
                        </p>
                      </div>

                      {/* PRICES */}

                      <div className="md:text-right">

                        <p className="font-serif text-xl">
                          {formatPrice(
                            day.personal_price ??
                              formation.personal_price
                          )}
                        </p>

                        {day.cpf_eligible &&
                          day.cpf_price && (
                            <p className="mt-1 text-xs text-ink/40">
                              CPF{" "}
                              {formatPrice(
                                day.cpf_price
                              )}
                            </p>
                          )}

                        <p className="mt-1 text-xs text-ink/40">
                          Acompte{" "}
                          {formatPrice(
                            deposit
                          )}
                        </p>
                      </div>

                      {/* RESERVE */}

                      <button
                        type="button"
                        disabled={!available}
                        onClick={() =>
                          handleReserve(
                            day
                          )
                        }
                        className={
                          available
                            ? "inline-flex min-w-[135px] items-center justify-center gap-5 border border-ink px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-all hover:bg-ink hover:text-ivory"
                            : "inline-flex min-w-[135px] items-center justify-center border border-ink/10 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/25"
                        }
                      >
                        {available
                          ? "RÉSERVER"
                          : "COMPLET"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ===================================================
          RESERVATION
      =================================================== */}

      {showReservation &&
        selectedDay && (
          <section
            id="reservation"
            className="border-t border-ink/10"
          >
            <div className="mx-auto max-w-7xl px-6 py-24 md:px-10">

              <div className="grid gap-14 md:grid-cols-[0.7fr_1.3fr] md:gap-20">

                {/* LEFT */}

                <div>
                  <p className="label text-ink/40">
                    RÉSERVATION
                  </p>

                  <h2 className="display mt-6 text-[clamp(3rem,6vw,5rem)] leading-[0.95]">
                    RÉSERVER
                    <br />
                    MA PLACE
                  </h2>

                  <div className="mt-10 border-t border-ink/10">

                    <div className="flex justify-between border-b border-ink/10 py-5">
                      <span className="label text-ink/40">
                        FORMATION
                      </span>

                      <span className="max-w-[55%] text-right font-serif">
                        {formation.title}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-ink/10 py-5">
                      <span className="label text-ink/40">
                        VILLE
                      </span>

                      <span className="font-serif">
                        {selectedDay.city}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-ink/10 py-5">
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

                    <div className="flex justify-between border-b border-ink/10 py-5">
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

                    <div className="flex justify-between border-b border-ink/10 py-5">
                      <span className="label text-ink/40">
                        ACOMPTE
                      </span>

                      <span className="font-serif">
                        {formatPrice(
                          deposit
                        )}
                      </span>
                    </div>

                  </div>
                </div>

                {/* RESERVATION FORM */}

                <div>
                  <ReservationForm
                    formation={formation}
                    formationDay={
                      selectedDay
                    }
                  />
                </div>

              </div>
            </div>
          </section>
        )}

      {/* ===================================================
          FOOTER LINK
      =================================================== */}

      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">
          <Link
            to="/formations"
            className="label text-ink/40 hover:opacity-60"
          >
            ← Toutes les formations
          </Link>
        </div>
      </section>

    </main>
  );
}

export default FormationDetailPage;