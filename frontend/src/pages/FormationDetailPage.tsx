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

type FormationDay =
  Formation["formationDays"][number];

/* =========================================================
   SAFE DATE PARSER
========================================================= */

function parseDate(
  value: unknown
): Date | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(
      value.getTime()
    )
      ? null
      : value;
  }

  const raw =
    String(value).trim();

  if (!raw) {
    return null;
  }

  /*
   * Laravel commonly returns:
   *
   * 2026-09-10
   *
   * or:
   *
   * 2026-09-10T00:00:00.000000Z
   */

  const match =
    raw.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (match) {
    const year =
      Number(match[1]);

    const month =
      Number(match[2]);

    const day =
      Number(match[3]);

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

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (
      date.getFullYear() !==
        year ||
      date.getMonth() !==
        month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  const parsed =
    new Date(raw);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return null;
  }

  return parsed;
}

/* =========================================================
   SAFE DATE RANGE

   Example:

   10 — 12 septembre
   8 — 15 octobre
========================================================= */

function formatDateRange(
  start: unknown,
  end: unknown
): string {
  const startDate =
    parseDate(start);

  const endDate =
    parseDate(end);

  /*
   * NEVER call Intl.DateTimeFormat.format()
   * with Invalid Date.
   */

  if (
    !startDate &&
    !endDate
  ) {
    return "Dates à confirmer";
  }

  if (
    startDate &&
    !endDate
  ) {
    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "numeric",
        month: "long",
      }
    ).format(startDate);
  }

  if (
    !startDate ||
    !endDate
  ) {
    return "Dates à confirmer";
  }

  const startDay =
    startDate.getDate();

  const endDay =
    endDate.getDate();

  const startMonth =
    new Intl.DateTimeFormat(
      "fr-FR",
      {
        month: "long",
      }
    ).format(startDate);

  const endMonth =
    new Intl.DateTimeFormat(
      "fr-FR",
      {
        month: "long",
      }
    ).format(endDate);

  const startYear =
    startDate.getFullYear();

  const endYear =
    endDate.getFullYear();

  if (
    startMonth ===
      endMonth &&
    startYear === endYear
  ) {
    return `${startDay} — ${endDay} ${endMonth}`;
  }

  if (
    startYear === endYear
  ) {
    return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
  }

  return `${startDay} ${startMonth} ${startYear} — ${endDay} ${endMonth} ${endYear}`;
}

/* =========================================================
   SAFE PRICE
========================================================= */

function formatPrice(
  value:
    | number
    | string
    | null
    | undefined
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "À venir";
  }

  const number =
    Number(value);

  if (
    Number.isNaN(number)
  ) {
    return `${String(value)} €`;
  }

  return `${number.toLocaleString(
    "fr-FR"
  )} €`;
}

/* =========================================================
   NORMALIZE CITY
========================================================= */

function normalizeCity(
  value: unknown
): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/* =========================================================
   PAGE
========================================================= */

export function FormationDetailPage() {

  /* =======================================================
     ROUTER
  ======================================================= */

  const { slug } =
    useParams<{
      slug: string;
    }>();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  /*
   * Example:
   *
   * #/formations/formation-extension-de-cils?city=Paris
   *
   * After clicking:
   *
   * #/formations/formation-extension-de-cils?city=Paris&day=12
   */

  const selectedCity =
    searchParams
      .get("city")
      ?.trim() || "";

  const selectedDayId =
    searchParams.get("day");

  /* =======================================================
     API
  ======================================================= */

  const {
    data: formation,
    loading,
    error,
  } = useFormation(slug);

  /* =======================================================
     ALL SESSIONS
  ======================================================= */

  const allSessions =
    useMemo<FormationDay[]>(
      () => {
        if (
          !formation ||
          !Array.isArray(
            formation.formationDays
          )
        ) {
          return [];
        }

        return formation.formationDays.filter(
          Boolean
        );
      },
      [formation]
    );

  /* =======================================================
     FILTER BY CITY

     If:
       ?city=Paris

     show ONLY Paris.

     If no city:
       show ALL sessions.
  ======================================================= */

  const sessions =
    useMemo<FormationDay[]>(
      () => {
        if (!selectedCity) {
          return allSessions;
        }

        const wantedCity =
          normalizeCity(
            selectedCity
          );

        return allSessions.filter(
          (day) =>
            normalizeCity(
              day.city
            ) === wantedCity
        );
      },
      [
        allSessions,
        selectedCity,
      ]
    );

  /* =======================================================
     SELECTED SESSION

     VERY IMPORTANT:

     We DO NOT use sessions[0].

     The form only appears after:
     ?day=SESSION_ID
  ======================================================= */

  const selectedSession =
    useMemo<FormationDay | null>(
      () => {
        if (!selectedDayId) {
          return null;
        }

        const found =
          allSessions.find(
            (day) =>
              String(day.id) ===
              String(
                selectedDayId
              )
          );

        return found ?? null;
      },
      [
        allSessions,
        selectedDayId,
      ]
    );

  /* =======================================================
     PROGRAMME
  ======================================================= */

  const programme =
    formation?.programme ??
    null;

  const duration =
    programme?.duration ||
    "3 jours";

  const steps =
    Array.isArray(
      formation?.steps
    )
      ? formation.steps
      : [];

  /* =======================================================
     SCROLL AFTER SELECTING SESSION
  ======================================================= */

  useEffect(() => {
    if (!selectedSession) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        const element =
          document.getElementById(
            "reservation"
          );

        if (!element) {
          return;
        }

        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);

    return () => {
      window.clearTimeout(
        timer
      );
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

  if (
    error ||
    !formation
  ) {
    return (
      <main className="min-h-screen bg-ivory py-32">

        <div className="wrap">

          <p className="label text-ink/40">
            Formation
          </p>

          <h1 className="display mt-6 text-5xl lg:text-7xl">
            Formation introuvable
          </h1>

          {error && (
            <p className="mt-5 max-w-xl text-sm text-ink/50">
              {error}
            </p>
          )}

          <Link
            to="/formations"
            className="mt-10 inline-flex border border-ink px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-white"
          >
            ← Toutes les formations
          </Link>

        </div>

      </main>
    );
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
                  src={
                    formation.image
                  }
                  alt={
                    formation.title
                  }
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
                    {
                      selectedSession.city
                    }
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
          PROGRAMME

          IMPORTANT:
          Programme BEFORE Sessions disponibles.
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
                  {
                    programme.duration
                  }
                </p>

              )}

              {programme?.description && (

                <div
                  className="prose prose-sm mt-8 font-light leading-relaxed text-ink/60"
                  dangerouslySetInnerHTML={{
                    __html:
                      programme.description,
                  }}
                />

              )}

              {formation.pdf_program && (

                <a
                  href={
                    formation.pdf_program
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex border border-ink px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-white"
                >
                  Télécharger le programme
                </a>

              )}

            </div>

            {/* RIGHT */}

            <div>

              {steps.length > 0 ? (

                <div className="border-t border-ink/10">

                  {steps.map(
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
                              {
                                step.title
                              }
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
                  {selectedCity
                    ? ` pour ${selectedCity}.`
                    : "."}
                </p>

              </div>

            ) : (

              sessions.map(
                (day) => {

                  const isSelected =
                    selectedSession?.id ===
                    day.id;

                  const remaining =
                    Number(
                      day.remaining_places
                    ) || 0;

                  const isFull =
                    remaining <= 0;

                  return (
                    <div
                      key={day.id}
                      className="border-b border-ink/10 py-8"
                    >

                      <div className="grid gap-6 md:grid-cols-[1fr_auto_auto] md:items-center">

                        {/* CITY / DATE / PLACES */}

                        <div>

                          <p className="font-serif text-2xl">
                            {day.city ||
                              "Ville à confirmer"}
                          </p>

                          <p className="mt-2 text-sm text-ink/60">
                            {formatDateRange(
                              day.start_date,
                              day.end_date
                            )}
                          </p>

                          <p className="mt-2 text-sm text-ink/50">

                            {remaining}{" "}

                            {remaining ===
                            1
                              ? "place restante"
                              : "places restantes"}

                          </p>

                        </div>

                        {/* PRICE */}

                        <div className="md:text-right">

                          <p className="font-serif text-xl">
                            {formatPrice(
                              day.personal_price ??
                                formation.personal_price
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
                              onClick={() => {

                                const params =
                                  new URLSearchParams();

                                if (
                                  day.city
                                ) {
                                  params.set(
                                    "city",
                                    day.city
                                  );
                                }

                                params.set(
                                  "day",
                                  String(
                                    day.id
                                  )
                                );

                                setSearchParams(
                                  params
                                );

                              }}
                              className={`inline-flex min-w-[135px] items-center justify-center border px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                                isSelected
                                  ? "border-[#111111] bg-[#111111] text-white"
                                  : "border-ink text-ink hover:bg-ink hover:text-white"
                              }`}
                            >
                              {isSelected
                                ? "SÉLECTIONNÉE"
                                : "RÉSERVER"}
                            </button>

                          )}

                        </div>

                      </div>

                    </div>
                  );
                }
              )

            )}

          </div>

        </div>

      </section>

      {/* =================================================
          RESERVATION

          ONLY AFTER CLICKING RÉSERVER
      ================================================= */}

      {selectedSession && (

        <section
          id="reservation"
          className="scroll-mt-20 border-t border-ink/10 bg-white py-20 lg:py-32"
        >

          <div className="wrap">

            <div className="grid gap-12 lg:grid-cols-[0.4fr_0.6fr]">

              {/* LEFT */}

              <div>

                <p className="label flex items-center gap-4 text-ink/50">

                  <span className="h-px w-10 bg-current" />

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
                    {
                      selectedSession.city
                    }
                  </p>

                  <p className="mt-1 text-sm text-ink/55">
                    {formatDateRange(
                      selectedSession.start_date,
                      selectedSession.end_date
                    )}
                  </p>

                  <div className="mt-6 border-t border-ink/10 pt-5">

                    {/* FORMATION */}

                    <div className="flex items-center justify-between gap-6">

                      <span className="label text-[10px] text-ink/40">
                        Formation
                      </span>

                      <span className="text-right font-serif text-xl">
                        {
                          formation.title
                        }
                      </span>

                    </div>

                    {/* PRICE */}

                    <div className="mt-5 flex items-center justify-between gap-6">

                      <span className="label text-[10px] text-ink/40">
                        Tarif
                      </span>

                      <span className="font-serif text-xl">

                        {formatPrice(
                          selectedSession.personal_price ??
                            formation.personal_price
                        )}

                      </span>

                    </div>

                    {/* PLACES */}

                    <div className="mt-5 flex items-center justify-between gap-6">

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

                    {/* DEPOSIT */}

                    <div className="mt-5 flex items-center justify-between gap-6">

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

              {/* RIGHT — FORM */}

              <div>

                <ReservationForm
                  formation={
                    formation
                  }
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
          PDF
      ================================================= */}

      {formation.pdf_program && (

        <section className="border-t border-ink/10 py-16">

          <div className="wrap">

            <a
              href={
                formation.pdf_program
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex border border-ink px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-white"
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