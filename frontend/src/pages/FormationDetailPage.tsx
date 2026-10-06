import { useEffect, useMemo } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { useFormations } from "@/hooks/useFormations";
import { ReservationForm } from "@/components/booking/ReservationForm";

import type { Formation } from "@/types/formation";

type FormationDay = Formation["formationDays"][number];

/* =========================================================
   SAFE DATE PARSER
========================================================= */

function parseDate(value: unknown): Date | null {
  if (!value) return null;

  const text = String(value).trim();

  if (!text) return null;

  // YYYY-MM-DD
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

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

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/* =========================================================
   SAFE DATE RANGE

   Example:
   10 — 12 septembre
========================================================= */

function formatDateRange(
  start: unknown,
  end: unknown
): string {
  const startDate = parseDate(start);
  const endDate = parseDate(end);

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
   NORMALIZE SLUG
========================================================= */

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");
}

/* =========================================================
   FORMATION FINDER

   Supports:

   extension-de-cils
   formation-extension-de-cils
========================================================= */

function findFormation(
  formations: Formation[],
  slug: string
): Formation | null {
  const requested = normalizeSlug(slug);

  if (!requested) {
    return null;
  }

  // Exact match
  const exact = formations.find(
    (formation) =>
      normalizeSlug(formation.slug) === requested
  );

  if (exact) {
    return exact;
  }

  // Remove "formation-" prefix
  const withoutPrefix = requested.startsWith(
    "formation-"
  )
    ? requested.replace(/^formation-/, "")
    : requested;

  const byWithoutPrefix = formations.find(
    (formation) => {
      const formationSlug = normalizeSlug(
        formation.slug
      );

      const cleanFormationSlug =
        formationSlug.startsWith("formation-")
          ? formationSlug.replace(/^formation-/, "")
          : formationSlug;

      return cleanFormationSlug === withoutPrefix;
    }
  );

  if (byWithoutPrefix) {
    return byWithoutPrefix;
  }

  return null;
}

/* =========================================================
   SESSION STATUS
========================================================= */

function isSessionAvailable(
  day: FormationDay
): boolean {
  const status = String(day.status || "")
    .trim()
    .toLowerCase();

  return (
    Number(day.remaining_places) > 0 &&
    status !== "completed" &&
    status !== "finished" &&
    status !== "cancelled" &&
    status !== "terminee" &&
    status !== "terminée"
  );
}

/* =========================================================
   PAGE
========================================================= */

export function FormationDetailPage() {
  /* -------------------------------------------------------
     ROUTER
  ------------------------------------------------------- */

  const { slug } = useParams<{
    slug: string;
  }>();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const selectedCity =
    searchParams.get("city")?.trim() || "";

  const selectedDayId =
    searchParams.get("day");

  /* -------------------------------------------------------
     LOAD ALL FORMATIONS

     This avoids the "Formation introuvable" problem
     when useFormation() expects another slug format.
  ------------------------------------------------------- */

  const {
    data: formationsData,
    loading,
    error,
  } = useFormations();

  const formations = Array.isArray(
    formationsData
  )
    ? (formationsData as Formation[])
    : [];

  /* -------------------------------------------------------
     FIND CURRENT FORMATION
  ------------------------------------------------------- */

  const formation = useMemo(() => {
    if (!slug) {
      return null;
    }

    return findFormation(
      formations,
      slug
    );
  }, [formations, slug]);

  /* -------------------------------------------------------
     ALL SESSIONS
  ------------------------------------------------------- */

  const allSessions = useMemo<
    FormationDay[]
  >(() => {
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
      Boolean
    );
  }, [formation]);

  /* -------------------------------------------------------
     SESSIONS BY CITY

     ?city=Paris

     => only Paris sessions
  ------------------------------------------------------- */

  const sessions = useMemo<
    FormationDay[]
  >(() => {
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
  }, [
    allSessions,
    selectedCity,
  ]);

  /* -------------------------------------------------------
     SELECTED SESSION

     IMPORTANT:
     No session is selected automatically.

     The ReservationForm appears only after:
     ?day=ID
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     PROGRAMME
  ------------------------------------------------------- */

  const programme =
    formation?.programme ?? null;

  const duration =
    programme?.duration || "3 jours";

  /* -------------------------------------------------------
     SCROLL AFTER RESERVATION CLICK
  ------------------------------------------------------- */

  useEffect(() => {
    if (!selectedSession) {
      return;
    }

    const timer = window.setTimeout(() => {
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

  if (error) {
    return (
      <main className="min-h-screen bg-ivory py-32">
        <div className="wrap">
          <p className="label text-ink/40">
            Formation
          </p>

          <h1 className="display mt-6 text-5xl lg:text-7xl">
            Impossible de charger les formations
          </h1>

          <p className="mt-6 text-sm text-red-500">
            {String(error)}
          </p>

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
     NOT FOUND
  ======================================================= */

  if (!formation) {
    return (
      <main className="min-h-screen bg-ivory py-32">
        <div className="wrap">
          <p className="label text-ink/40">
            Formation
          </p>

          <h1 className="display mt-6 text-5xl lg:text-7xl">
            Formation introuvable
          </h1>

          <p className="mt-6 text-sm text-ink/50">
            Formation demandée :{" "}
            <strong>{slug}</strong>
          </p>

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
     RESERVATION CLICK

     When clicking a session:

     ?city=Paris&day=1

     The page stays the same.
     ReservationForm appears below.
  ======================================================= */

  function handleReserve(
    day: FormationDay
  ) {
    if (!isSessionAvailable(day)) {
      return;
    }

    const params = new URLSearchParams(
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

    setSearchParams(params);
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="bg-ivory text-ink">

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
          PROGRAMME

          PROGRAMME FIRST
          BEFORE SESSIONS
      ================================================= */}

      <section className="border-t border-ink/10 py-20 lg:py-32">
        <div className="wrap">

          <div className="grid gap-12 lg:grid-cols-[0.35fr_0.65fr]">

            {/* LEFT */}

            <div>
              <p className="label text-ink/40">
                Formation
              </p>

              <h2 className="display mt-5 text-4xl lg:text-5xl">
                Le programme
              </h2>

              {programme?.description && (
                <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink/60">
                  {programme.description}
                </p>
              )}
            </div>

            {/* RIGHT */}

            <div>
              {Array.isArray(
                formation.steps
              ) &&
              formation.steps.length > 0 ? (
                <div className="border-t border-ink/10">

                  {formation.steps.map(
                    (step, index) => (
                      <div
                        key={`${index}-${step.title}`}
                        className="border-b border-ink/10 py-7"
                      >
                        <div className="grid gap-5 md:grid-cols-[60px_1fr]">

                          <span className="font-serif text-lg text-ink/40">
                            {String(
                              index + 1
                            ).padStart(2, "0")}
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

                const available =
                  isSessionAvailable(day);

                const selected =
                  selectedSession?.id ===
                  day.id;

                return (
                  <div
                    key={day.id}
                    className={`border-b border-ink/10 py-8 ${
                      selected
                        ? "bg-ink/[0.02]"
                        : ""
                    }`}
                  >

                    <div className="grid gap-6 md:grid-cols-[1fr_auto_auto] md:items-center">

                      {/* CITY / DATE */}

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
                          )}{" "}
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

                        <p className="mt-1 text-xs text-ink/40">
                          Acompte{" "}
                          {formatPrice(
                            formation.deposit_amount ??
                              150
                          )}
                        </p>

                      </div>

                      {/* RESERVE */}

                      <div className="md:text-right">

                        <button
                          type="button"
                          disabled={!available}
                          onClick={() =>
                            handleReserve(day)
                          }
                          className="inline-flex min-h-[50px] min-w-[160px] items-center justify-center border border-ink bg-transparent px-7 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:border-ink/20 disabled:text-ink/30"
                        >
                          {available
                            ? selected
                              ? "Sélectionnée"
                              : "Réserver"
                            : "Complet"}
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

      {/* =================================================
          RESERVATION FORM

          ONLY AFTER CLICKING RÉSERVER
      ================================================= */}

      {selectedSession && (
        <section
          id="reservation"
          className="border-t border-ink/10 py-20 lg:py-32"
        >
          <ReservationForm
            formation={formation}
            formationDay={selectedSession}
          />
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