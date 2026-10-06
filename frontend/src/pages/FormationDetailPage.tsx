import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";
import { ReservationForm } from "@/components/booking/ReservationForm";

import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

import type {
  Formation,
  FormationDay,
} from "@/types/formation";

/* =========================================================
   DATE HELPERS
========================================================= */

function safeDate(
  value: string | null | undefined
): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  const startDate = safeDate(start);
  const endDate = safeDate(end);

  if (!startDate || !endDate) {
    return "Dates à confirmer";
  }

  const startDay = startDate.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
    }
  );

  const endDay = endDate.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
    }
  );

  const startMonth = startDate.toLocaleDateString(
    "fr-FR",
    {
      month: "long",
    }
  );

  const endMonth = endDate.toLocaleDateString(
    "fr-FR",
    {
      month: "long",
    }
  );

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  if (
    startMonth === endMonth &&
    startYear === endYear
  ) {
    return `${startDay} — ${endDay} ${endMonth}`;
  }

  return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
}

function formatSingleDate(
  value: string | null | undefined
): string {
  const date = safeDate(value);

  if (!date) {
    return "Date à confirmer";
  }

  return date.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
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
   META
========================================================= */

function Meta({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="border-b border-ink/10 py-5 pr-5">
      <dt className="label text-[10px] text-ink/40">
        {label}
      </dt>

      <dd className="mt-2 font-serif text-xl leading-tight">
        {value}
      </dd>

      {sub && (
        <dd className="mt-1 text-xs font-light text-ink/45">
          {sub}
        </dd>
      )}
    </div>
  );
}

/* =========================================================
   SESSION CARD
========================================================= */

function SessionCard({
  day,
  selected,
  onSelect,
}: {
  day: FormationDay;
  selected: boolean;
  onSelect: () => void;
}) {
  const available =
    day.remaining_places > 0 &&
    day.status !== "full" &&
    day.status !== "completed";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full border text-left transition-all duration-300",
        selected
          ? "border-ink bg-ink text-ivory"
          : "border-ink/10 bg-transparent hover:border-ink/30",
      ].join(" ")}
    >
      <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:p-7">
        <div>
          <p
            className={[
              "label text-[10px]",
              selected
                ? "text-ivory/45"
                : "text-ink/40",
            ].join(" ")}
          >
            {day.city}
          </p>

          <p className="mt-3 font-serif text-2xl">
            {formatDateRange(
              day.start_date,
              day.end_date
            )}
          </p>

          <p
            className={[
              "mt-2 text-sm",
              selected
                ? "text-ivory/60"
                : "text-ink/50",
            ].join(" ")}
          >
            {available
              ? `${day.remaining_places} places restantes`
              : "Complet"}
          </p>
        </div>

        <div className="md:text-right">
          <p
            className={[
              "font-serif text-2xl",
              selected
                ? "text-ivory"
                : "text-ink",
            ].join(" ")}
          >
            {formatPrice(day.personal_price)}
          </p>

          {day.cpf_eligible &&
            day.cpf_price !== null &&
            day.cpf_price !== undefined && (
              <p
                className={[
                  "mt-1 text-xs",
                  selected
                    ? "text-ivory/50"
                    : "text-ink/45",
                ].join(" ")}
              >
                CPF : {formatPrice(day.cpf_price)}
              </p>
            )}
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   PAGE
========================================================= */

export function FormationDetailPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const [searchParams] = useSearchParams();

  const {
    data: formation,
    loading,
    error,
  } = useFormation(slug);

  /* =======================================================
     SELECTED CITY / SESSION
  ======================================================= */

  const requestedDayId = searchParams.get("day");

  const requestedCity = searchParams.get("city");

  const selectedDay = useMemo(() => {
    if (!formation?.formationDays?.length) {
      return null;
    }

    if (requestedDayId) {
      const byId =
        formation.formationDays.find(
          (day) =>
            String(day.id) === requestedDayId
        );

      if (byId) {
        return byId;
      }
    }

    if (requestedCity) {
      const byCity =
        formation.formationDays.find(
          (day) =>
            day.city.toLowerCase() ===
            requestedCity.toLowerCase()
        );

      if (byCity) {
        return byCity;
      }
    }

    return formation.formationDays[0];
  }, [
    formation,
    requestedDayId,
    requestedCity,
  ]);

  /* =======================================================
     SESSIONS
  ======================================================= */

  const sessions = useMemo(() => {
    if (!formation?.formationDays) {
      return [];
    }

    if (!selectedDay?.city) {
      return formation.formationDays;
    }

    return formation.formationDays.filter(
      (day) =>
        day.city.toLowerCase() ===
        selectedDay.city.toLowerCase()
    );
  }, [
    formation,
    selectedDay,
  ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory">
        <section className="mx-auto max-w-7xl px-6 py-32 md:px-10">
          <div className="animate-pulse">
            <div className="h-4 w-32 bg-ink/10" />

            <div className="mt-8 h-20 max-w-3xl bg-ink/10" />

            <div className="mt-5 h-5 max-w-xl bg-ink/10" />
          </div>
        </section>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !formation) {
    return (
      <main className="min-h-screen bg-ivory">
        <section className="mx-auto max-w-7xl px-6 py-32 md:px-10">
          <p className="label text-ink/40">
            Formation
          </p>

          <h1 className="display mt-6 text-[clamp(3rem,8vw,7rem)]">
            Formation introuvable
          </h1>

          <div className="mt-10">
            <Button
              to="/formations"
              variant="outline-dark"
              icon="arrow"
            >
              Toutes les formations
            </Button>
          </div>
        </section>
      </main>
    );
  }

  const programme =
    formation.programme;

  const duration =
    programme?.duration ?? "3 jours";

  const image =
    selectedDay?.image ||
    formation.image;

  const deposit =
    formation.deposit_amount;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="bg-ivory">

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-20 md:px-10 md:pb-28 md:pt-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-end">

          <Reveal>
            <p className="label text-ink/40">
              {programme?.name ??
                "Formation"}
            </p>

            <h1 className="display mt-6 max-w-4xl text-[clamp(3rem,7vw,7rem)] leading-[0.9]">
              {formation.title}
            </h1>

            {selectedDay && (
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="font-serif text-2xl">
                  {selectedDay.city}
                </span>

                <span className="h-px w-8 bg-ink/20" />

                <span className="font-serif text-xl text-ink/60">
                  {formatDateRange(
                    selectedDay.start_date,
                    selectedDay.end_date
                  )}
                </span>
              </div>
            )}
          </Reveal>

          {image && (
            <Reveal delay={0.1}>
              <ImageReveal
                src={image}
                alt={formation.title}
                className="aspect-[4/3] w-full"
              />
            </Reveal>
          )}
        </div>
      </section>

      {/* ===================================================
          INTRO / INFORMATION
      =================================================== */}

      <section className="border-y border-ink/10">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-[0.8fr_1.2fr]">

          <Reveal>
            <p className="label text-ink/40">
              La formation
            </p>

            <h2 className="display mt-5 text-4xl md:text-6xl">
              Une expérience pensée pour vous.
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            {formation.description && (
              <div
                className="max-w-3xl text-lg font-light leading-relaxed text-ink/65"
                dangerouslySetInnerHTML={{
                  __html:
                    formation.description,
                }}
              />
            )}

            <dl className="mt-10 grid grid-cols-2 border-t border-ink/10 sm:grid-cols-3">
              <Meta
                label="Durée"
                value={duration}
              />

              <Meta
                label="Tarif"
                value={
                  selectedDay
                    ? formatPrice(
                        selectedDay.personal_price
                      )
                    : formatPrice(
                        formation.personal_price
                      )
                }
                sub={
                  selectedDay?.cpf_eligible &&
                  selectedDay.cpf_price
                    ? `CPF ${formatPrice(
                        selectedDay.cpf_price
                      )}`
                    : undefined
                }
              />

              <Meta
                label="Acompte"
                value={formatPrice(deposit)}
                sub="Réservation"
              />
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ===================================================
          PROGRAMME
      =================================================== */}

      {formation.steps &&
        formation.steps.length > 0 && (
          <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
            <Reveal>
              <p className="label text-ink/40">
                Programme
              </p>

              <h2 className="display mt-5 text-[clamp(3rem,6vw,6rem)]">
                Le programme
              </h2>
            </Reveal>

            <div className="mt-14 border-t border-ink/10">
              {formation.steps.map(
                (step, index) => (
                  <Reveal
                    key={`${step.title}-${index}`}
                    delay={index * 0.05}
                  >
                    <div className="grid gap-5 border-b border-ink/10 py-8 md:grid-cols-[100px_1fr] md:py-10">
                      <span className="font-serif text-xl text-ink/35">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>

                      <div>
                        <h3 className="font-serif text-2xl md:text-3xl">
                          {step.title}
                        </h3>

                        {step.description && (
                          <p className="mt-3 max-w-2xl text-base font-light leading-relaxed text-ink/60">
                            {
                              step.description
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </Reveal>
                )
              )}
            </div>
          </section>
        )}

      {/* ===================================================
          PDF PROGRAM
      =================================================== */}

      {formation.pdf_program && (
        <section className="border-y border-ink/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between md:px-10">
            <div>
              <p className="label text-ink/40">
                Programme détaillé
              </p>

              <h3 className="mt-2 font-serif text-2xl">
                Voir le document PDF
              </h3>
            </div>

            <a
              href={formation.pdf_program}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-ink px-7 py-4 text-xs uppercase tracking-[0.18em] transition-opacity hover:opacity-60"
            >
              Consulter le programme
            </a>
          </div>
        </section>
      )}

      {/* ===================================================
          SESSIONS DISPONIBLES
      =================================================== */}

      {sessions.length > 0 && (
        <section
          id="sessions"
          className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28"
        >
          <Reveal>
            <p className="label text-ink/40">
              Sessions disponibles
            </p>

            <h2 className="display mt-5 text-[clamp(3rem,6vw,6rem)]">
              {selectedDay?.city ??
                "Sessions"}
            </h2>

            <p className="mt-5 max-w-xl text-base font-light leading-relaxed text-ink/55">
              Découvrez les prochaines
              dates disponibles pour cette
              ville.
            </p>
          </Reveal>

          <div className="mt-12 space-y-4">
            {sessions.map((day) => (
              <SessionCard
                key={day.id}
                day={day}
                selected={
                  selectedDay?.id === day.id
                }
                onSelect={() => {
                  const url =
                    `/formations/${formation.slug}?day=${day.id}`;

                  window.history.pushState(
                    {},
                    "",
                    `#${url}`
                  );

                  window.location.reload();
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===================================================
          RESERVATION
      =================================================== */}

      <section
        id="reservation"
        className="border-t border-ink/10 bg-[#f7f3ee]"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">

          <Reveal>
            <p className="label text-ink/40">
              Réservation
            </p>

            <h2 className="display mt-5 max-w-4xl text-[clamp(3rem,6vw,6rem)]">
              Réservez votre place.
            </h2>

            {selectedDay && (
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-lg">
                <span className="font-serif">
                  {selectedDay.city}
                </span>

                <span className="text-ink/30">
                  /
                </span>

                <span className="font-serif text-ink/60">
                  {formatDateRange(
                    selectedDay.start_date,
                    selectedDay.end_date
                  )}
                </span>
              </div>
            )}
          </Reveal>

          <div className="mt-12">
            {selectedDay && (
  <ReservationForm
    formation={formation}
    formationDay={selectedDay}
  />
)}
          </div>
        </div>
      </section>

      {/* ===================================================
          BACK
      =================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <Link
          to="/formations"
          className="label text-ink/45 transition-opacity hover:opacity-60"
        >
          ← Toutes les formations
        </Link>
      </section>
    </main>
  );
}

export default FormationDetailPage;