import { useEffect, useMemo } from "react";

import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";
import { ReservationForm } from "@/components/booking/ReservationForm";

import type { Formation } from "@/types/formation";

/* =========================================================
   TYPES
========================================================= */

type FormationDay = Formation["formationDays"][number];

/* =========================================================
   DATE HELPERS
========================================================= */

/**
 * Safely converts a date.
 *
 * Supports:
 * - 2026-09-10
 * - 2026-09-10T00:00:00
 * - 2026-09-10T00:00:00.000000Z
 *
 * Never throws "Invalid time value".
 */
function parseDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const stringValue = String(value).trim();

  if (!stringValue) {
    return null;
  }

  // YYYY-MM-DD
  const dateOnlyMatch = stringValue.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }

    return null;
  }

  const date = new Date(stringValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/**
 * Formats:
 *
 * 10/09/2026 → 10 septembre
 * 10/09/2026 → 12/09/2026
 *               10 — 12 septembre
 */
function formatDateRange(
  start: unknown,
  end: unknown
): string {
  const startDate = parseDate(start);
  const endDate = parseDate(end);

  /*
   * IMPORTANT:
   * Never call Intl.DateTimeFormat.format()
   * with an invalid Date.
   */
  if (!startDate || !endDate) {
    if (start && end) {
      return `${String(start)} — ${String(end)}`;
    }

    if (start) {
      return String(start);
    }

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

  /*
   * Same month / same year
   *
   * 10 — 12 septembre
   */
  if (
    startMonth === endMonth &&
    startYear === endYear
  ) {
    return `${startDay} — ${endDay} ${endMonth}`;
  }

  /*
   * Same year
   *
   * 30 septembre — 2 octobre
   */
  if (startYear === endYear) {
    return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
  }

  /*
   * Different years
   */
  return `${startDay} ${startMonth} ${startYear} — ${endDay} ${endMonth} ${endYear}`;
}

/* =========================================================
   PRICE
========================================================= */

function formatPrice(
  price: number | string | null | undefined
): string {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "À venir";
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return `${price} €`;
  }

  return `${numericPrice.toLocaleString("fr-FR")} €`;
}

/* =========================================================
   FORMATION DETAIL PAGE
========================================================= */

export function FormationDetailPage() {
  /* =======================================================
     ROUTER
  ======================================================= */

  const { slug } = useParams<{
    slug: string;
  }>();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const selectedCity =
    searchParams.get("city")?.trim() || "";

  const selectedDayId =
    searchParams.get("day");

  /* =======================================================
     FORMATION API
  ======================================================= */

  const {
    data: formation,
    loading,
    error,
  } = useFormation(slug);

  /* =======================================================
     ALL SESSIONS
  ======================================================= */

  const allSessions = useMemo<FormationDay[]>(
    () => {
      if (
        !formation ||
        !Array.isArray(
          formation.formationDays
        )
      ) {
        return [];
      }

      return formation.formationDays;
    },
    [formation]
  );

  /* =======================================================
     FILTER BY CITY
  ======================================================= */

  const sessions = useMemo<FormationDay[]>(
    () => {
      if (!selectedCity) {
        return allSessions;
      }

      const normalizedCity =
        selectedCity
          .trim()
          .toLowerCase();

      return allSessions.filter(
        (day) =>
          String(day.city || "")
            .trim()
            .toLowerCase() ===
          normalizedCity
      );
    },
    [
      allSessions,
      selectedCity,
    ]
  );

  /* =======================================================
     SELECTED SESSION
     
     IMPORTANT:
     Do NOT automatically select sessions[0].
     
     The reservation form appears only after the
     user clicks RÉSERVER.
  ======================================================= */

  const selectedSession =
    useMemo<FormationDay | null>(() => {
      if (!selectedDayId) {
        return null;
      }

      const found = allSessions.find(
        (day) =>
          String(day.id) ===
          String(selectedDayId)
      );

      return found ?? null;
    }, [
      allSessions,
      selectedDayId,
    ]);

  /* =======================================================
     PROGRAMME
  ======================================================= */

  const programme =
    formation?.programme ?? null;

  const duration =
    programme?.duration ||
    "3 jours";

  /* =======================================================
     SCROLL TO RESERVATION
     
     When user clicks RÉSERVER:
     
     Sessions
          ↓
     ReservationForm
  ======================================================= */

  useEffect(() => {
    if (!selectedSession) {
      return;
    }

    const timer = window.setTimeout(() => {
      const reservation =
        document.getElementById(
          "reservation"
        );

      if (!reservation) {
        return;
      }

      reservation.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [selectedSession]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory py-32">
        <div className="wrap">
          <p className="text-sm text-ink/50">
            Chargement de la formation...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !formation) {
    return (
      <main className="min-h-screen bg-ivory py-32">
        <div className="wrap">
          <p className="label text-ink/40">
            Formation
          </p>

          <h1 className="display mt-6 text-5xl lg:text-7xl">
            Formation introuvable
          </h1>

          <Link
            to="/formations"
            className="mt-10 inline-flex text-sm underline underline-offset-4"
          >
            ← Toutes les formations
          </Link>
        </div>
      </main>
    );
  }

  /* =======================================================
     RESERVATION URL
  ======================================================= */

  const reservationUrl =
    selectedSession
      ? `/formations/${formation.slug}?city=${encodeURIComponent(
          selectedSession.city
        )}&day=${selectedSession.id}`
      : `/formations/${formation.slug}`;

  /* =======================================================
     HANDLE SESSION
  ======================================================= */

  function selectSession(
    day: FormationDay
  ) {
    const params = new URLSearchParams();

    if (day.city) {
      params.set(
        "city",
        day.city
      );
    }

    params.set(
      "day",
      String(day.id)
    );

    setSearchParams(params);
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="bg-ivory">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="py-20 lg:py-32">
        <div className="wrap">

          {/* BACK */}
          <Link
            to="/formations"
            className="label text-ink/40 transition-opacity hover:opacity-60"
          >
            ← Toutes les formations
          </Link>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">

            {/* IMAGE */}
            <div>
              {formation.image ? (
                <img
                  src={formation.image}
                  alt={formation.title}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="aspect-[4/3] w-full bg-ink/5" />
              )}
            </div>

            {/* TITLE */}
            <div>
              <p className="label text-ink/40">
                {programme?.name ||
                  "Formation"}
              </p>

              <h1 className="display mt-5 text-[clamp(3rem,7vw,6rem)] leading-[0.95]">
                {formation.title}
              </h1>

              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink/50">
                <span>
                  {duration}
                </span>

                {selectedSession && (
                  <span>
                    {selectedSession.city}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          DESCRIPTION
      ================================================= */}

      {formation.description && (
        <section className="pb-20 lg:pb-28">
          <div className="wrap">
            <div
              className="max-w-3xl text-lg font-light leading-relaxed text-ink/70"
              dangerouslySetInnerHTML={{
                __html:
                  formation.description,
              }}
            />
          </div>
        </section>
      )}

      {/* =================================================
          SESSIONS DISPONIBLES
      ================================================= */}

      <section className="border-t border-ink/10 py-20 lg:py-28">
        <div className="wrap">

          <p className="label text-ink/40">
            Sessions disponibles
          </p>

          <h2 className="display mt-5 text-4xl lg:text-6xl">
            {selectedCity ||
              "Toutes les sessions"}
          </h2>

          <div className="mt-12 border-t border-ink/10">

            {sessions.length === 0 ? (
              <div className="py-10">
                <p className="text-sm text-ink/50">
                  Aucune session disponible
                  pour cette ville.
                </p>
              </div>
            ) : (
              sessions.map((day) => {
                const isSelected =
                  selectedSession?.id ===
                  day.id;

                const isFull =
                  Number(
                    day.remaining_places
                  ) <= 0;

                return (
                  <div
                    key={day.id}
                    className={`border-b border-ink/10 py-8 transition-opacity ${
                      isSelected
                        ? "opacity-100"
                        : ""
                    }`}
                  >
                    <div className="grid gap-6 md:grid-cols-[1fr_auto_auto] md:items-center">

                      {/* CITY + DATE */}
                      <div>
                        <p className="font-serif text-2xl">
                          {day.city}
                        </p>

                        <p className="mt-2 text-sm text-ink/60">
                          {formatDateRange(
                            day.start_date,
                            day.end_date
                          )}
                        </p>

                        <p className="mt-2 text-sm text-ink/50">
                          {Number(
                            day.remaining_places
                          ) || 0}{" "}
                          {Number(
                            day.remaining_places
                          ) === 1
                            ? "place restante"
                            : "places restantes"}
                        </p>
                      </div>

                      {/* PRICE */}
                      <div className="md:text-right">
                        <p className="font-serif text-xl">
                          {formatPrice(
                            day.personal_price
                          )}
                        </p>

                        {day.cpf_eligible &&
                          day.cpf_price !==
                            null &&
                          day.cpf_price !==
                            undefined &&
                          day.cpf_price !==
                            "" && (
                            <p className="mt-1 text-xs text-ink/40">
                              CPF{" "}
                              {formatPrice(
                                day.cpf_price
                              )}
                            </p>
                          )}

                        {formation.deposit_amount !==
                          null &&
                          formation.deposit_amount !==
                            undefined && (
                            <p className="mt-1 text-xs text-ink/40">
                              Acompte{" "}
                              {formatPrice(
                                formation.deposit_amount
                              )}
                            </p>
                          )}
                      </div>

                      {/* RESERVE */}
                      <div className="md:text-right">
                        {isFull ? (
                          <span className="inline-flex min-w-[135px] items-center justify-center border border-ink/20 px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink/30">
                            COMPLET
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              selectSession(
                                day
                              )
                            }
                            className={`inline-flex min-w-[135px] items-center justify-center border px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                              isSelected
                                ? "bg-[#111111] text-white border-[#111111]"
                                : "border-ink text-ink hover:bg-ink hover:text-white"
                            }`}
                          >
                            RÉSERVER
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* =================================================
          PROGRAMME
      ================================================= */}

      <section className="border-t border-ink/10 py-20 lg:py-32">
        <div className="wrap">

          <div className="grid gap-12 lg:grid-cols-[0.35fr_0.65fr]">

            {/* LEFT */}
            <div>
              <p className="label text-ink/40">
                Programme
              </p>

              <h2 className="display mt-5 text-4xl lg:text-5xl">
                Le programme
              </h2>

              {programme?.duration && (
                <p className="mt-5 text-sm text-ink/50">
                  Durée :{" "}
                  {programme.duration}
                </p>
              )}
            </div>

            {/* RIGHT */}
            <div>
              {formation.steps &&
              formation.steps.length >
                0 ? (
                <div className="border-t border-ink/10">

                  {formation.steps.map(
                    (
                      step,
                      index
                    ) => (
                      <div
                        key={`${index}-${step.title}`}
                        className="border-b border-ink/10 py-7"
                      >
                        <div className="grid gap-5 md:grid-cols-[60px_1fr]">

                          <span className="font-serif text-lg text-ink/40">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <div>
                            <h3 className="font-serif text-2xl">
                              {step.title}
                            </h3>

                            {step.description && (
                              <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-ink/60">
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
              ) : (
                <p className="text-sm text-ink/50">
                  Le programme sera communiqué
                  prochainement.
                </p>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* =================================================
          RESERVATION FORM

          IMPORTANT:
          Only appears AFTER clicking RÉSERVER.
      ================================================= */}

      {selectedSession && (
        <section
          id="reservation"
          className="border-t border-ink/10 py-20 lg:py-32"
        >
          <div className="wrap">

            <div className="grid gap-12 lg:grid-cols-[0.4fr_0.6fr]">

              {/* LEFT SIDE */}
              <div>

                <p className="label text-ink/40">
                  Réservation
                </p>

                <h2 className="display mt-5 text-5xl md:text-6xl">
                  RÉSERVER
                  <br />
                  MA PLACE
                </h2>

                <p className="mt-6 max-w-md text-sm leading-7 text-ink/55">
                  Remplissez vos coordonnées
                  pour réserver votre place.
                </p>

                {/* SELECTED SESSION */}
                <div className="mt-8 border-t border-ink/10 pt-6">

                  <p className="label text-[10px] text-ink/40">
                    Session sélectionnée
                  </p>

                  <p className="mt-3 font-serif text-2xl">
                    {selectedSession.city}
                  </p>

                  <p className="mt-1 text-sm text-ink/55">
                    {formatDateRange(
                      selectedSession.start_date,
                      selectedSession.end_date
                    )}
                  </p>

                  <div className="mt-6 border-t border-ink/10 pt-5">

                    <div className="flex items-center justify-between">
                      <span className="label text-[10px] text-ink/40">
                        Tarif
                      </span>

                      <span className="font-serif text-xl">
                        {formatPrice(
                          selectedSession.personal_price
                        )}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="label text-[10px] text-ink/40">
                        Places
                      </span>

                      <span className="text-sm text-ink/60">
                        {Number(
                          selectedSession.remaining_places
                        ) || 0}{" "}
                        restantes
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="label text-[10px] text-ink/40">
                        Acompte
                      </span>

                      <span className="font-serif text-xl">
                        {formatPrice(
                          formation.deposit_amount
                        )}
                      </span>
                    </div>

                  </div>
                </div>

              </div>

              {/* RIGHT SIDE */}
              <div>

                <ReservationForm
                  formation={formation}
                  formationDay={
                    selectedSession
                  }
                />

              </div>

            </div>
          </div>
        </section>
      )}

      {/* =================================================
          PDF PROGRAMME
      ================================================= */}

      {formation.pdf_program && (
        <section className="border-t border-ink/10 py-16">
          <div className="wrap">
            <a
              href={formation.pdf_program}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center border border-ink px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-white"
            >
              Télécharger le programme
            </a>
          </div>
        </section>
      )}

      {/* =================================================
          BACK
      ================================================= */}

      <section className="border-t border-ink/10 py-16">
        <div className="wrap">
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