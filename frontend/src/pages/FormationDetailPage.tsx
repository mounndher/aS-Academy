import { useMemo } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";
import { Reveal } from "@/components/ui/Reveal";
import { ReservationForm } from "@/components/booking/ReservationForm";

/* =========================================================
   TYPES
========================================================= */

interface FormationDay {
  id: number;
  formation_id: number;

  city: string;

  start_date: string | null;
  end_date: string | null;

  image?: string | null;

  personal_price: number | string | null;

  cpf_eligible: boolean;
  cpf_price: number | string | null;

  max_places: number;
  remaining_places: number;

  status: string;
}

/* =========================================================
   DATE HELPER
   NEVER throws "Invalid time value"
========================================================= */

function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  if (!start || !end) {
    return "Dates à confirmer";
  }

  /*
   * Handles:
   * 2026-09-10
   * 2026-09-10T00:00:00
   * 2026-09-10T00:00:00.000000Z
   */

  const parseDate = (value: string): Date | null => {
    const clean = value.trim();

    if (!clean) {
      return null;
    }

    // YYYY-MM-DD
    const match = clean.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

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

      const date = new Date(
        year,
        month - 1,
        day
      );

      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return date;
    }

    const date = new Date(clean);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  const startDate = parseDate(start);
  const endDate = parseDate(end);

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
   PRICE HELPER
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
   PAGE
========================================================= */

export function FormationDetailPage() {
  /* =======================================================
     ROUTER
  ======================================================= */

  const { slug } =
    useParams<{ slug: string }>();

  const [searchParams] =
    useSearchParams();

  /* =======================================================
     URL CITY

     Example:

     #/formations/extension-de-cils?city=Paris

     => only Paris sessions
  ======================================================= */

  const selectedCity =
    searchParams.get("city")?.trim() || "";

  /* =======================================================
     URL DAY

     Example:

     ?city=Paris&day=1

     => selected session = id 1
  ======================================================= */

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

  const allSessions: FormationDay[] =
    useMemo(() => {
      if (
        !formation ||
        !Array.isArray(
          formation.formationDays
        )
      ) {
        return [];
      }

      return formation.formationDays as FormationDay[];
    }, [formation]);

  /* =======================================================
     FILTER BY CITY
  ======================================================= */

  const sessions: FormationDay[] =
    useMemo(() => {
      if (!selectedCity) {
        return allSessions;
      }

      const normalizedCity =
        selectedCity
          .trim()
          .toLowerCase();

      return allSessions.filter(
        (day) =>
          day.city
            ?.trim()
            .toLowerCase() ===
          normalizedCity
      );
    }, [
      allSessions,
      selectedCity,
    ]);

  /* =======================================================
     SELECTED SESSION

     IMPORTANT:
     If ?day=1 exists, use that session.
     Otherwise there is NO selected session.

     This means ReservationForm does NOT appear
     until the user clicks RÉSERVER.
  ======================================================= */

  const selectedSession =
    useMemo(() => {
      if (!selectedDayId) {
        return null;
      }

      return (
        sessions.find(
          (day) =>
            String(day.id) ===
            String(selectedDayId)
        ) ?? null
      );
    }, [
      sessions,
      selectedDayId,
    ]);

  /* =======================================================
     PROGRAMME
  ======================================================= */

  const programme =
    formation?.programme;

  const duration =
    programme?.duration ??
    "3 jours";

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

            <Reveal>
              {formation.image ? (
                <img
                  src={formation.image}
                  alt={formation.title}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="aspect-[4/3] w-full bg-ink/5" />
              )}
            </Reveal>

            {/* TITLE */}

            <Reveal delay={0.1}>
              <p className="label text-ink/40">
                {programme?.name ??
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
            </Reveal>

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

          <Reveal>
            <p className="label text-ink/40">
              Sessions disponibles
            </p>

            <h2 className="display mt-5 text-4xl lg:text-6xl">
              {selectedCity
                ? selectedCity
                : "Toutes les sessions"}
            </h2>
          </Reveal>

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
              sessions.map((day) => {

                const reserveUrl =
                  `/formations/${formation.slug}?city=${encodeURIComponent(
                    day.city
                  )}&day=${day.id}`;

                return (
                  <div
                    key={day.id}
                    className="border-b border-ink/10 py-8"
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
                          {day.remaining_places}{" "}
                          {day.remaining_places ===
                          1
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

                        <p className="mt-1 text-xs text-ink/40">
                          Acompte{" "}
                          {formatPrice(
                            formation.deposit_amount
                          )}
                        </p>

                      </div>

                      {/* RESERVE */}

                      <div className="md:text-right">
                        {day.remaining_places >
                        0 ? (
                          <Link
                            to={reserveUrl}
                            className="inline-flex min-w-[135px] items-center justify-center border border-ink px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors duration-300 hover:bg-ink hover:text-white"
                          >
                            RÉSERVER
                          </Link>
                        ) : (
                          <span className="inline-flex min-w-[135px] items-center justify-center border border-ink/20 px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink/30">
                            COMPLET
                          </span>
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
          RESERVATION FORM

          Appears on SAME PAGE after clicking RÉSERVER.
          No PayPal.
          No separate reservation page.
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
          PROGRAMME
      ================================================= */}

      <section className="border-t border-ink/10 py-20 lg:py-32">
        <div className="wrap">

          <div className="grid gap-12 lg:grid-cols-[0.35fr_0.65fr]">

            {/* LEFT */}

            <Reveal>
              <p className="label text-ink/40">
                Programme
              </p>

              <h2 className="display mt-5 text-4xl lg:text-5xl">
                Le programme
              </h2>
            </Reveal>

            {/* RIGHT */}

            <Reveal delay={0.1}>
              {formation.steps &&
              formation.steps.length >
                0 ? (
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
            </Reveal>

          </div>
        </div>
      </section>

      {/* =================================================
          BACK
      ================================================= */}

      <section className="border-t border-ink/10 py-16">
        <div className="wrap">
          <Link
            to="/formations"
            className="label text-ink/40 transition-opacity hover:opacity-60"
          >
            ← Toutes les formations
          </Link>
        </div>
      </section>

    </main>
  );
}

export default FormationDetailPage;