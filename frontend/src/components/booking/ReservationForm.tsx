import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { getFormation } from "@/services/api";
import type {
  Formation,
  FormationDay,
} from "@/types/formation";

import { useScrollToState } from "@/hooks/useScrollToState";
import { scrollToId } from "@/lib/scroll";

import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

import { ReservationForm } from "@/components/booking/ReservationForm";

// =========================================================
// HELPERS
// =========================================================

function Row({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-4">
      <dt className="label shrink-0 text-[10px] text-ink/45">
        {label}
      </dt>

      <dd className="text-right">
        <span className="font-serif text-xl leading-tight">
          {value}
        </span>

        {sub && (
          <span className="mt-0.5 block text-xs font-light text-ink/50">
            {sub}
          </span>
        )}
      </dd>
    </div>
  );
}

// =========================================================
// PRICE
// =========================================================

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

// =========================================================
// DATE
// =========================================================

function formatDate(
  date: string | null | undefined
): string {
  if (!date) {
    return "Date à venir";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date à venir";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

// =========================================================
// DATE RANGE
// =========================================================

function formatDateRange(
  day: FormationDay | null
): string {
  if (!day) {
    return "Date à venir";
  }

  if (!day.start_date) {
    return "Date à venir";
  }

  const start = new Date(day.start_date);

  if (Number.isNaN(start.getTime())) {
    return "Date à venir";
  }

  if (!day.end_date) {
    return formatDate(day.start_date);
  }

  const end = new Date(day.end_date);

  if (Number.isNaN(end.getTime())) {
    return formatDate(day.start_date);
  }

  const startDay = start.getDate();
  const endDay = end.getDate();

  const startMonth = new Intl.DateTimeFormat(
    "fr-FR",
    { month: "long" }
  ).format(start);

  const endMonth = new Intl.DateTimeFormat(
    "fr-FR",
    { month: "long" }
  ).format(end);

  const year = end.getFullYear();

  /*
   * Same day
   *
   * 10 septembre 2026
   */
  if (
    startDay === endDay &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    return `${startDay} ${startMonth} ${year}`;
  }

  /*
   * Same month
   *
   * 10 — 12 septembre 2026
   */
  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    return `${startDay} — ${endDay} ${endMonth} ${year}`;
  }

  /*
   * Different months
   *
   * 28 septembre — 2 octobre 2026
   */
  return `${startDay} ${startMonth} — ${endDay} ${endMonth} ${year}`;
}

// =========================================================
// SELECT DAY
// =========================================================

function getSelectedDay(
  formation: Formation
): FormationDay | null {
  const days = Array.isArray(formation.formationDays)
    ? formation.formationDays
    : [];

  if (days.length === 0) {
    return null;
  }

  const available = days.find(
    (day) =>
      Number(day.remaining_places) > 0 &&
      day.status !== "full" &&
      day.status !== "completed"
  );

  return available ?? days[0] ?? null;
}

// =========================================================
// PAGE
// =========================================================

export function FormationDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  useScrollToState();

  const [formation, setFormation] =
    useState<Formation | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // =======================================================
  // LOAD FROM LARAVEL API
  // =======================================================

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug) {
        setError("Formation introuvable.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getFormation(slug);

        if (!cancelled) {
          setFormation(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger la formation."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // =======================================================
  // SELECTED DAY
  // =======================================================

  const selectedDay = useMemo(() => {
    if (!formation) {
      return null;
    }

    return getSelectedDay(formation);
  }, [formation]);

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <main className="bg-ivory">
        <section className="pt-32 pb-24 lg:pt-40">
          <div className="wrap">
            <p className="label text-ink/50">
              Chargement de la formation...
            </p>
          </div>
        </section>
      </main>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error || !formation) {
    return (
      <main className="bg-ivory">
        <section className="pt-32 pb-24 lg:pt-40">
          <div className="wrap">
            <Link
              to="/formations"
              className="label inline-flex items-center gap-3 text-[10px] text-ink/50"
            >
              <ArrowLeft
                size={14}
                strokeWidth={1.5}
              />

              Toutes les formations
            </Link>

            <h1 className="display mt-10 text-5xl">
              Formation introuvable
            </h1>

            <p className="mt-5 text-ink/50">
              {error ??
                "Cette formation n'existe pas ou n'est plus disponible."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  // =======================================================
  // SAFE DATA
  // =======================================================

  const programme = formation.programme;

  const steps = Array.isArray(formation.steps)
    ? formation.steps
    : [];

  const days = Array.isArray(
    formation.formationDays
  )
    ? formation.formationDays
    : [];

  const image =
    selectedDay?.image ||
    formation.image ||
    null;

  const city =
    selectedDay?.city ||
    "À définir";

  const dates =
    formatDateRange(selectedDay);

  const duration =
    programme?.duration ||
    "À définir";

  const personalPrice =
    selectedDay?.personal_price ??
    formation.personal_price;

  const cpfPrice =
    selectedDay?.cpf_price ?? null;

  const deposit =
    formation.deposit_amount;

  const hasAvailablePlace =
    Boolean(
      selectedDay &&
        Number(selectedDay.remaining_places) > 0 &&
        selectedDay.status !== "full" &&
        selectedDay.status !== "completed"
    );

  // =======================================================
  // IMAGE
  // =======================================================

  const imageSrc =
    image ||
    "/images/placeholder.jpg";

  // =======================================================
  // DESCRIPTION
  // =======================================================

  const description =
    formation.description || "";

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <article className="bg-ivory">

      {/* ===================================================
          HERO / INFORMATION
      =================================================== */}

      <section className="pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="wrap">

          {/* BACK */}
          <Link
            to="/formations"
            className="label inline-flex items-center gap-3 text-[10px] text-ink/50 transition-colors hover:text-ink"
          >
            <ArrowLeft
              size={14}
              strokeWidth={1.5}
            />

            Toutes les formations
          </Link>

          <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-16">

            {/* =================================================
                IMAGE
            ================================================= */}

            <div className="lg:col-span-6">
              <ImageReveal
                src={imageSrc}
                alt={formation.title}
                className="aspect-[4/5] w-full"
                priority
              />
            </div>

            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="lg:col-span-5 lg:col-start-8">

              {/* PROGRAMME */}
              <p className="label text-ink/50">
                {programme?.name ||
                  formation.title}
              </p>

              {/* TITLE */}
              <Headline
                as="h1"
                immediate
                lines={[formation.title]}
                className="mt-5 text-[clamp(2.75rem,9vw,5.5rem)]"
              />

              {/* CITY */}
              <p className="mt-5 font-serif text-2xl leading-none text-ink/70 md:text-3xl">
                {city}
              </p>

              {/* DATE */}
              <p className="mt-3 text-base font-light text-ink/55">
                {dates}
              </p>

              {/* DESCRIPTION */}
              <Reveal delay={0.2}>
                <div
                  className="prose prose-sm mt-8 max-w-none text-ink/70"
                  dangerouslySetInnerHTML={{
                    __html: description,
                  }}
                />
              </Reveal>

              {/* =================================================
                  INFORMATION TABLE
              ================================================= */}

              <Reveal delay={0.3}>
                <dl className="mt-10 divide-y divide-ink/10 border-y border-ink/10">

                  <Row
                    label="Durée"
                    value={duration}
                  />

                  <Row
                    label="Ville"
                    value={city}
                  />

                  <Row
                    label="Dates"
                    value={dates}
                  />

                  <Row
                    label="Places restantes"
                    value={
                      selectedDay
                        ? selectedDay.remaining_places
                        : "À définir"
                    }
                  />

                  <Row
                    label="Financement personnel"
                    value={formatPrice(
                      personalPrice
                    )}
                  />

                  {selectedDay?.cpf_eligible &&
                    cpfPrice !== null && (
                      <Row
                        label="Financement CPF"
                        value={formatPrice(
                          cpfPrice
                        )}
                      />
                    )}

                  {deposit !== null &&
                    deposit !== undefined && (
                      <Row
                        label="Acompte"
                        value={formatPrice(
                          deposit
                        )}
                      />
                    )}

                </dl>
              </Reveal>

              {/* =================================================
                  PROGRAMME STEPS
              ================================================= */}

              {steps.length > 0 && (
                <Reveal delay={0.35}>
                  <p className="label mt-10 text-ink/50">
                    Programme
                  </p>

                  <ol className="mt-4 grid gap-4">
                    {steps.map(
                      (step, index) => (
                        <li
                          key={`${step.title}-${index}`}
                          className="flex gap-4"
                        >
                          <span className="label shrink-0 text-[10px] text-ink/35">
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </span>

                          <div>
                            <p className="font-serif text-lg leading-snug">
                              {step.title}
                            </p>

                            {step.description && (
                              <p className="mt-1 text-sm font-light leading-relaxed text-ink/55">
                                {
                                  step.description
                                }
                              </p>
                            )}
                          </div>
                        </li>
                      )
                    )}
                  </ol>
                </Reveal>
              )}

              {/* =================================================
                  CTA
              ================================================= */}

              <div className="mt-10">
                <Button
                  variant="dark"
                  size="lg"
                  icon="arrow"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    scrollToId("reservation")
                  }
                >
                  {hasAvailablePlace
                    ? "Réserver ma place"
                    : "Demander une date"}
                </Button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          OTHER DATES
      ===================================================== */}

      {days.length > 0 && (
        <section className="border-t border-ink/10 bg-white py-20 lg:py-28">
          <div className="wrap">

            <Reveal>
              <p className="label text-ink/50">
                Sessions disponibles
              </p>

              <Headline
                lines={[
                  "Choisissez",
                  "votre session",
                ]}
                className="mt-5 max-w-xl text-[clamp(2.5rem,7vw,4.5rem)]"
              />
            </Reveal>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              {days.map((day) => {
                const available =
                  Number(
                    day.remaining_places
                  ) > 0 &&
                  day.status !== "full" &&
                  day.status !== "completed";

                return (
                  <div
                    key={day.id}
                    className="border border-ink/10 bg-ivory p-6"
                  >

                    <p className="label text-[10px] text-ink/45">
                      {day.city}
                    </p>

                    <p className="mt-4 font-serif text-2xl">
                      {formatDateRange(day)}
                    </p>

                    <div className="mt-6 space-y-2 text-sm font-light text-ink/60">

                      <p>
                        {day.remaining_places}{" "}
                        place
                        {day.remaining_places !==
                        1
                          ? "s"
                          : ""}{" "}
                        restante
                        {day.remaining_places !==
                        1
                          ? "s"
                          : ""}
                      </p>

                      <p>
                        {formatPrice(
                          day.personal_price
                        )}
                      </p>

                    </div>

                    <div className="mt-6">
                      <span
                        className={
                          available
                            ? "text-xs uppercase tracking-[0.15em] text-ink"
                            : "text-xs uppercase tracking-[0.15em] text-ink/35"
                        }
                      >
                        {available
                          ? "Disponible"
                          : "Complet"}
                      </span>
                    </div>

                  </div>
                );
              })}

            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          RESERVATION
      ===================================================== */}

      <section
        id="reservation"
        className="scroll-mt-20 border-t border-ink/10 bg-white py-20 lg:py-28"
      >
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-16">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="lg:col-span-4">

            <Reveal>
              <p className="label flex items-center gap-4 text-ink/50">
                <span className="h-px w-10 bg-current" />
                Réservation
              </p>
            </Reveal>

            <Headline
              lines={
                hasAvailablePlace
                  ? [
                      "Réserver",
                      "ma place",
                    ]
                  : [
                      "Demander",
                      "une date",
                    ]
              }
              className="mt-6 text-[clamp(2.5rem,7vw,4.5rem)]"
            />

            <Reveal delay={0.2}>
              <p className="mt-6 max-w-sm text-base font-light leading-relaxed text-ink/60">

                {hasAvailablePlace ? (
                  <>
                    Remplissez vos
                    coordonnées pour
                    réserver votre place
                    à{" "}
                    <span className="font-medium text-ink">
                      {city}
                    </span>
                    .
                  </>
                ) : (
                  <>
                    Cette session n'est
                    plus disponible.
                    Laissez vos
                    coordonnées pour
                    demander une nouvelle
                    date.
                  </>
                )}

              </p>

              <dl className="mt-8 divide-y divide-ink/10 border-t border-ink/10">

                <Row
                  label="Formation"
                  value={formation.title}
                />

                <Row
                  label="Ville"
                  value={city}
                />

                <Row
                  label="Dates"
                  value={dates}
                />

                <Row
                  label="Prix"
                  value={formatPrice(
                    personalPrice
                  )}
                />

              </dl>
            </Reveal>

          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <div className="lg:col-span-7 lg:col-start-6">

            <Reveal delay={0.15}>
              <ReservationForm
                formation={formation}
              />
            </Reveal>

          </div>

        </div>
      </section>

    </article>
  );
}

export default FormationDetailPage;