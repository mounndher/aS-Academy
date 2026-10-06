import { useEffect, useMemo } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { motion } from "framer-motion";

import { useFormation } from "@/hooks/useFormation";
import { ReservationForm } from "@/components/booking/ReservationForm";
import type { Formation } from "@/types/formation";

type FormationDay = Formation["formationDays"][number];

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

  // Laravel date: YYYY-MM-DD
  const dateOnly = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);

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

  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
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
  const startDate = parseDate(start);
  const endDate = parseDate(end);

  if (!startDate && !endDate) {
    return "Dates à confirmer";
  }

  if (startDate && !endDate) {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
    }).format(startDate);
  }

  if (!startDate && endDate) {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
    }).format(endDate);
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

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "À venir";
  }

  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(number)} €`;
}

/* =========================================================
   SESSION PRICE
========================================================= */

function getSessionPrice(
  formation: Formation,
  session: FormationDay
): number | string | null {
  if (
    formation.has_sale &&
    formation.sale_price !== null &&
    formation.sale_price !== undefined
  ) {
    return formation.sale_price;
  }

  if (
    session.personal_price !== null &&
    session.personal_price !== undefined
  ) {
    return session.personal_price;
  }

  return formation.personal_price;
}

/* =========================================================
   SESSION STATUS
========================================================= */

function getStatus(
  session: FormationDay
): "DISPONIBLE" | "COMPLET" | "TERMINÉE" {
  const remaining = Number(
    session.remaining_places ?? 0
  );

  if (remaining <= 0) {
    return "COMPLET";
  }

  const status = String(
    session.status ?? ""
  ).toLowerCase();

  if (
    status === "completed" ||
    status === "terminee" ||
    status === "terminée" ||
    status === "finished"
  ) {
    return "TERMINÉE";
  }

  return "DISPONIBLE";
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
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-ink/10 py-5">
      <span className="text-[9px] uppercase tracking-[0.3em] text-ink/45">
        {label}
      </span>

      <span className="text-right font-serif text-lg">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   RESERVATION INFO ROW
========================================================= */

function ReservationInfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[9px] uppercase tracking-[0.3em] text-ink/45">
        {label}
      </span>

      <span className="font-serif text-lg">
        {value}
      </span>
    </div>
  );
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

  /* =======================================================
     URL

     /formations/xxx?city=Paris

     or

     /formations/xxx?city=Paris&day=12
  ======================================================= */

  const selectedCity =
    searchParams.get("city")?.trim() || "";

  const selectedDayId =
    searchParams.get("day") ||
    searchParams.get("dayId") ||
    "";

  /* =======================================================
     API
  ======================================================= */

  const {
    formation,
    loading,
    error,
  } = useFormation(slug || "");

  /* =======================================================
     ALL SESSIONS
  ======================================================= */

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

  /* =======================================================
     FILTER BY CITY

     IMPORTANT:

     ?city=Paris

     => ONLY Paris

     No other city.
  ======================================================= */

  const sessions = useMemo<
    FormationDay[]
  >(() => {
    if (!selectedCity) {
      return allSessions;
    }

    const city = normalizeCity(
      selectedCity
    );

    return allSessions.filter(
      (session) =>
        normalizeCity(session.city) === city
    );
  }, [
    allSessions,
    selectedCity,
  ]);

  /* =======================================================
     SELECTED SESSION

     IMPORTANT:
     We DO NOT automatically select
     the first session.

     Reservation appears ONLY when:
     ?day=ID
  ======================================================= */

  const selectedSession = useMemo<
    FormationDay | null
  >(() => {
    if (!selectedDayId) {
      return null;
    }

    const found = allSessions.find(
      (session) =>
        String(session.id) ===
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

  const steps =
    Array.isArray(formation?.steps)
      ? formation.steps
      : [];

  const duration =
    programme?.duration ||
    "3 jours";

  /* =======================================================
     SELECT SESSION

     When clicking RÉSERVER:

     Paris
       ↓
     day ID
       ↓
     ReservationForm
  ======================================================= */

  function handleSelectSession(
    session: FormationDay
  ) {
    const status =
      getStatus(session);

    if (status !== "DISPONIBLE") {
      return;
    }

    setSearchParams({
      city: session.city || "",
      day: String(session.id),
    });

    window.setTimeout(() => {
      document
        .getElementById("reservation")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 150);
  }

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
     IMAGE
  ======================================================= */

  const image =
    formation.image ||
    sessions.find(
      (session) => session.image
    )?.image ||
    null;

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

            <div className="overflow-hidden">
              {image ? (
                <img
                  src={image}
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

                {selectedCity && (
                  <span>
                    {selectedCity}
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
          FORMATION INFORMATION
      ================================================= */}

      <section className="border-y border-ink/10">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">

          <div className="grid gap-12 md:grid-cols-2">

            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-ink/45">
                Formation
              </div>

              <h2 className="mt-5 font-serif text-4xl md:text-5xl">
                {formation.title}
              </h2>
            </div>

            <div>

              <InfoRow
                label="Durée"
                value={duration}
              />

              <InfoRow
                label="Tarif"
                value={formatPrice(
                  formation.personal_price
                )}
              />

              {formation.deposit_amount !==
                null &&
                formation.deposit_amount !==
                  undefined && (
                  <InfoRow
                    label="Acompte"
                    value={formatPrice(
                      formation.deposit_amount
                    )}
                  />
                )}

            </div>

          </div>

        </div>
      </section>

      {/* =================================================
          PROGRAMME

          THIS MUST BE BEFORE
          SESSIONS DISPONIBLES
      ================================================= */}

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-32">

        <div className="grid gap-16 md:grid-cols-[0.8fr_1.2fr]">

          {/* LEFT */}

          <div>

            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.35em] text-ink/45">
              <span className="h-px w-8 bg-ink/40" />
              Programme
            </div>

            <h2 className="mt-7 font-serif text-5xl leading-[0.95] md:text-7xl">
              Le programme
            </h2>

            {programme?.description && (
              <p className="mt-8 max-w-md text-sm leading-7 text-ink/60">
                {programme.description}
              </p>
            )}

            {formation.pdf_program && (
              <a
                href={formation.pdf_program}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block border border-ink px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.25em] transition-opacity hover:opacity-60"
              >
                Télécharger le programme
              </a>
            )}

          </div>

          {/* RIGHT — PROGRAMME STEPS */}

          <div>

            {steps.length > 0 ? (
              <div className="border-t border-ink/10">

                {steps.map(
                  (step, index) => (
                    <div
                      key={`${step.title}-${index}`}
                      className="grid gap-6 border-b border-ink/10 py-8 md:grid-cols-[70px_1fr]"
                    >

                      <span className="text-xs tracking-[0.2em] text-ink/40">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>

                      <div>

                        <h3 className="font-serif text-2xl">
                          {step.title}
                        </h3>

                        {step.description && (
                          <p className="mt-3 max-w-xl text-sm leading-7 text-ink/60">
                            {step.description}
                          </p>
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="border-t border-ink/10 py-8 text-sm text-ink/50">
                Programme détaillé à venir.
              </div>
            )}

          </div>

        </div>

      </section>

      {/* =================================================
          SESSIONS DISPONIBLES

          THIS COMES AFTER PROGRAMME
      ================================================= */}

      <section
        id="sessions"
        className="border-t border-ink/10"
      >

        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">

          <p className="label text-ink/40">
            Sessions disponibles
          </p>

          <h2 className="mt-7 font-serif text-6xl uppercase leading-none md:text-8xl">
            {selectedCity
              ? selectedCity
              : "Sessions"}
          </h2>

          {sessions.length === 0 ? (
            <div className="mt-16 border-y border-ink/10 py-12 text-sm text-ink/50">
              Aucune session disponible
              {selectedCity
                ? ` pour ${selectedCity}.`
                : "."}
            </div>
          ) : (
            <div className="mt-16 border-t border-ink/10">

              {sessions.map(
                (session, index) => {
                  const status =
                    getStatus(session);

                  const price =
                    getSessionPrice(
                      formation,
                      session
                    );

                  const isSelected =
                    selectedSession?.id ===
                    session.id;

                  return (
                    <motion.div
                      key={session.id}
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration: 0.4,
                        delay:
                          index * 0.05,
                      }}
                      className={`grid gap-8 border-b border-ink/10 py-10 md:grid-cols-[1fr_auto_auto] md:items-center ${
                        isSelected
                          ? "bg-ink/[0.025]"
                          : ""
                      }`}
                    >

                      {/* SESSION */}

                      <div>

                        <div className="font-serif text-2xl md:text-3xl">
                          {session.city ||
                            "Ville à confirmer"}
                        </div>

                        <div className="mt-3 text-sm text-ink/60">
                          {formatDateRange(
                            session.start_date,
                            session.end_date
                          )}
                        </div>

                        <div className="mt-2 text-sm text-ink/50">
                          {Number(
                            session.remaining_places ??
                              0
                          )}{" "}
                          place
                          {Number(
                            session.remaining_places ??
                              0
                          ) > 1
                            ? "s"
                            : ""}{" "}
                          restante
                          {Number(
                            session.remaining_places ??
                              0
                          ) > 1
                            ? "s"
                            : ""}
                        </div>

                      </div>

                      {/* PRICE */}

                      <div className="text-right">

                        <div className="font-serif text-xl">
                          {formatPrice(
                            price
                          )}
                        </div>

                        {session.cpf_eligible && (
                          <div className="mt-2 text-xs text-ink/50">
                            CPF{" "}
                            {formatPrice(
                              session.cpf_price
                            )}
                          </div>
                        )}

                        {formation.deposit_amount !==
                          null &&
                          formation.deposit_amount !==
                            undefined && (
                            <div className="mt-1 text-xs text-ink/50">
                              Acompte{" "}
                              {formatPrice(
                                formation.deposit_amount
                              )}
                            </div>
                          )}

                      </div>

                      {/* BUTTON */}

                      <div className="md:pl-4">

                        <button
                          type="button"
                          disabled={
                            status !==
                            "DISPONIBLE"
                          }
                          onClick={() =>
                            handleSelectSession(
                              session
                            )
                          }
                          className={`min-w-[145px] border px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all ${
                            status ===
                            "DISPONIBLE"
                              ? isSelected
                                ? "bg-ink text-white"
                                : "border-ink hover:bg-ink hover:text-white"
                              : "cursor-not-allowed border-ink/20 text-ink/30"
                          }`}
                        >
                          {isSelected
                            ? "Sélectionnée"
                            : status ===
                              "DISPONIBLE"
                            ? "Réserver"
                            : status}
                        </button>

                      </div>

                    </motion.div>
                  );
                }
              )}

            </div>
          )}

        </div>

      </section>

      {/* =================================================
          RESERVATION

          ONLY AFTER CLICKING RÉSERVER
      ================================================= */}

     

      {/* =================================================
          BACK
      ================================================= */}

      <section className="border-t border-ink/10">

        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">

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