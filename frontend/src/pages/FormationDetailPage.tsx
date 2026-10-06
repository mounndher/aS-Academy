import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getFormation } from "@/services/api";

import type {
  Formation,
  FormationDay,
} from "@/types/formation";

import { useScrollToState } from "@/hooks/useScrollToState";

import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

import { ReservationForm } from "@/components/booking/ReservationForm";

// =========================================================
// HELPERS
// =========================================================

function formatPrice(
  value: number | string | null | undefined
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Sur demande";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
}

/**
 * Safe date parser.
 *
 * IMPORTANT:
 * Never call Intl.DateTimeFormat.format()
 * with an Invalid Date.
 */
function parseSafeDate(
  value: string | null | undefined
): Date | null {
  if (!value) {
    return null;
  }

  const clean = String(value).trim();

  if (!clean) {
    return null;
  }

  // YYYY-MM-DD
  const match = clean.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }

    return null;
  }

  const parsed = new Date(clean);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function formatDate(
  value: string | null | undefined
): string {
  const date = parseSafeDate(value);

  if (!date) {
    return "Date à venir";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  const startDate = parseSafeDate(start);
  const endDate = parseSafeDate(end);

  if (!startDate && !endDate) {
    return "Dates à venir";
  }

  if (!startDate) {
    return endDate
      ? formatDate(end)
      : "Dates à venir";
  }

  if (!endDate) {
    return formatDate(start);
  }

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  const startMonth = new Intl.DateTimeFormat(
    "fr-FR",
    { month: "long" }
  ).format(startDate);

  const endMonth = new Intl.DateTimeFormat(
    "fr-FR",
    { month: "long" }
  ).format(endDate);

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  if (
    startDay === endDay &&
    startMonth === endMonth &&
    startYear === endYear
  ) {
    return `${startDay} ${startMonth} ${startYear}`;
  }

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

function getDayImage(
  formation: Formation,
  day: FormationDay | null
): string | null {
  if (day?.image) {
    return day.image;
  }

  return formation.image ?? null;
}

function getAvailableDays(
  formation: Formation
): FormationDay[] {
  if (!Array.isArray(formation.formationDays)) {
    return [];
  }

  return formation.formationDays.filter(
    (day): day is FormationDay =>
      Boolean(day) &&
      typeof day === "object"
  );
}

// =========================================================
// ROW
// =========================================================

function InfoRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-t border-ink/10 py-4">
      <dt className="label shrink-0 text-[10px] text-ink/45">
        {label}
      </dt>

      <dd className="text-right">
        <span className="font-serif text-xl leading-tight">
          {value}
        </span>

        {sub ? (
          <span className="mt-1 block text-xs font-light text-ink/50">
            {sub}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

// =========================================================
// PAGE
// =========================================================

export function FormationDetailPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  useScrollToState();

  const [formation, setFormation] =
    useState<Formation | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /**
   * IMPORTANT:
   * This is the session selected by the user.
   */
  const [selectedDay, setSelectedDay] =
    useState<FormationDay | null>(null);

  // =======================================================
  // LOAD FORMATION
  // =======================================================

  useEffect(() => {
    let cancelled = false;

    async function loadFormation() {
      if (!slug) {
        setError("Formation introuvable.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await getFormation(slug);

        if (!cancelled) {
          setFormation(result);
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

    loadFormation();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // =======================================================
  // DATA
  // =======================================================

  const days = useMemo(() => {
    if (!formation) {
      return [];
    }

    return getAvailableDays(formation);
  }, [formation]);

  const programme = formation?.programme ?? null;

  const steps = useMemo(() => {
    if (!formation) {
      return [];
    }

    return Array.isArray(formation.steps)
      ? formation.steps
      : [];
  }, [formation]);

  const firstDay =
    days.length > 0 ? days[0] : null;

  const mainImage = formation
    ? getDayImage(formation, firstDay)
    : null;

  const personalPrice =
    selectedDay?.personal_price ??
    firstDay?.personal_price ??
    formation?.personal_price ??
    null;

  const hasAvailablePlace = days.some(
    (day) =>
      Number(day.remaining_places) > 0 &&
      day.status !== "completed" &&
      day.status !== "full"
  );

  // =======================================================
  // SELECT SESSION
  // =======================================================

  function handleSelectDay(day: FormationDay) {
    if (Number(day.remaining_places) <= 0) {
      return;
    }

    setSelectedDay(day);

    // Wait for React to render ReservationForm,
    // then scroll to it.
    window.setTimeout(() => {
      document
        .getElementById("reservation")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory">
        <section className="py-32 lg:py-40">
          <div className="wrap">
            <p className="text-sm text-ink/50">
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
      <main className="min-h-screen bg-ivory">
        <section className="py-32 lg:py-40">
          <div className="wrap">
            <p className="text-sm text-red-500">
              {error ?? "Formation introuvable."}
            </p>

            <Link
              to="/formations"
              className="mt-6 inline-flex items-center gap-3 text-sm underline"
            >
              <ArrowLeft size={16} />
              Retour aux formations
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <article className="bg-ivory">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="wrap">

          {/* BACK */}

          <Link
            to="/formations"
            className="label inline-flex items-center gap-3 text-[10px] text-ink/50 transition-opacity hover:opacity-60"
          >
            <ArrowLeft
              size={14}
              strokeWidth={1.5}
            />

            Toutes les formations
          </Link>

          {/* HERO CONTENT */}

          <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-16">

            {/* IMAGE */}

            <div className="lg:col-span-6">
              {mainImage ? (
                <ImageReveal
                  src={mainImage}
                  alt={formation.title}
                  className="aspect-[4/5] w-full"
                  priority
                />
              ) : (
                <div className="flex aspect-[4/5] w-full items-center justify-center bg-ink/5">
                  <span className="text-sm text-ink/40">
                    Image non disponible
                  </span>
                </div>
              )}
            </div>

            {/* INFORMATION */}

            <div className="lg:col-span-5 lg:col-start-8">

              <p className="label text-ink/50">
                {programme?.name ?? "Formation"}
              </p>

              <Headline
                as="h1"
                immediate
                lines={[formation.title]}
                className="mt-5 text-[clamp(2.75rem,9vw,5.5rem)]"
              />

              {formation.description ? (
                <Reveal delay={0.2}>
                  <div
                    className="prose prose-sm mt-8 max-w-none font-light leading-relaxed text-ink/60"
                    dangerouslySetInnerHTML={{
                      __html:
                        formation.description,
                    }}
                  />
                </Reveal>
              ) : null}

              {/* =================================================
                  GENERAL INFORMATION
              ================================================= */}

              <Reveal delay={0.25}>
                <dl className="mt-10 divide-y divide-ink/10 border-y border-ink/10">

                  {programme?.duration ? (
                    <InfoRow
                      label="Durée"
                      value={programme.duration}
                    />
                  ) : null}

                  <InfoRow
                    label="Prix"
                    value={formatPrice(personalPrice)}
                  />

                  {firstDay?.cpf_eligible &&
                  firstDay.cpf_price ? (
                    <InfoRow
                      label="CPF"
                      value={formatPrice(
                        firstDay.cpf_price
                      )}
                    />
                  ) : null}

                  {formation.deposit_amount !==
                    null &&
                  formation.deposit_amount !==
                    undefined ? (
                    <InfoRow
                      label="Acompte"
                      value={formatPrice(
                        formation.deposit_amount
                      )}
                    />
                  ) : null}

                  {formation.installment_enabled &&
                  formation.installment_count ? (
                    <InfoRow
                      label="Paiement"
                      value={`${formation.installment_count} fois`}
                    />
                  ) : null}
                </dl>
              </Reveal>

              {/* =================================================
                  PROGRAMME
              ================================================= */}

              {steps.length > 0 ? (
                <Reveal delay={0.3}>
                  <div className="mt-10">
                    <p className="label text-ink/50">
                      Programme
                    </p>

                    <ol className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                      {steps.map(
                        (step, index) => (
                          <li
                            key={`${step.title}-${index}`}
                            className="flex gap-3"
                          >
                            <span className="label shrink-0 pt-1 text-[10px] text-ink/35">
                              {String(
                                index + 1
                              ).padStart(2, "0")}
                            </span>

                            <div>
                              <p className="font-serif text-lg leading-snug">
                                {step.title}
                              </p>

                              {step.description ? (
                                <p className="mt-1 text-sm font-light leading-relaxed text-ink/55">
                                  {step.description}
                                </p>
                              ) : null}
                            </div>
                          </li>
                        )
                      )}
                    </ol>
                  </div>
                </Reveal>
              ) : null}

              {/* PROGRAMME DESCRIPTION */}

              {programme?.description ? (
                <Reveal delay={0.35}>
                  <div
                    className="prose prose-sm mt-10 max-w-none font-light leading-relaxed text-ink/60"
                    dangerouslySetInnerHTML={{
                      __html:
                        programme.description,
                    }}
                  />
                </Reveal>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SESSIONS
      ===================================================== */}

      <section
        id="sessions"
        className="border-t border-ink/10 bg-ivory py-20 lg:py-28"
      >
        <div className="wrap">

          <p className="label text-ink/45">
            Sessions disponibles
          </p>

          <h2 className="display mt-5 text-[clamp(3rem,7vw,5.5rem)]">
            Sessions
          </h2>

          <div className="mt-12">

            {days.length === 0 ? (
              <div className="border-y border-ink/10 py-8">
                <p className="text-sm text-ink/50">
                  Aucune session disponible
                  actuellement.
                </p>
              </div>
            ) : (
              days.map((day) => {
                const places =
                  Number(day.remaining_places) || 0;

                const available =
                  places > 0 &&
                  day.status !== "completed" &&
                  day.status !== "full";

                const selected =
                  selectedDay?.id === day.id;

                return (
                  <div
                    key={day.id}
                    className={`border-t border-ink/10 py-7 last:border-b ${
                      selected
                        ? "bg-ink/[0.025]"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                      {/* SESSION INFO */}

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

                        <p className="mt-2 text-xs text-ink/50">
                          {places > 0
                            ? `${places} place${
                                places > 1
                                  ? "s"
                                  : ""
                              } restante${
                                places > 1
                                  ? "s"
                                  : ""
                              }`
                            : "Complet"}
                        </p>
                      </div>

                      {/* PRICE + BUTTON */}

                      <div className="flex items-center gap-6 md:gap-8">

                        <div className="text-right">
                          <p className="font-serif text-xl">
                            {formatPrice(
                              day.personal_price ??
                                formation.personal_price
                            )}
                          </p>

                          {day.cpf_eligible &&
                          day.cpf_price ? (
                            <p className="mt-1 text-xs text-ink/45">
                              CPF{" "}
                              {formatPrice(
                                day.cpf_price
                              )}
                            </p>
                          ) : null}

                          {formation.deposit_amount !==
                            null &&
                          formation.deposit_amount !==
                            undefined ? (
                            <p className="mt-1 text-xs text-ink/45">
                              Acompte{" "}
                              {formatPrice(
                                formation.deposit_amount
                              )}
                            </p>
                          ) : null}
                        </div>

                        <Button
                          variant="outline"
                          size="lg"
                          disabled={!available}
                          onClick={() =>
                            handleSelectDay(day)
                          }
                        >
                          {selected
                            ? "Session sélectionnée"
                            : available
                            ? "Réserver"
                            : "Complet"}
                        </Button>
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
          ONLY ONE ReservationForm
      ===================================================== */}

      {selectedDay ? (
        <section
          id="reservation"
          className="scroll-mt-20 border-t border-ink/10 bg-white"
        >
          <ReservationForm
            formation={formation}
            formationDay={selectedDay}
          />
        </section>
      ) : (
        <section className="border-t border-ink/10 bg-white py-20 lg:py-28">
          <div className="wrap">
            <div className="grid gap-10 lg:grid-cols-12">

              <div className="lg:col-span-5">
                <p className="label flex items-center gap-4 text-ink/50">
                  <span className="h-px w-10 bg-current" />
                  Réservation
                </p>

                <Headline
                  lines={[
                    "Choisissez",
                    "votre session",
                  ]}
                  className="mt-6 text-[clamp(3rem,7vw,5rem)]"
                />
              </div>

              <div className="lg:col-span-5 lg:col-start-7">
                <p className="max-w-md text-sm font-light leading-relaxed text-ink/60">
                  Sélectionnez une session
                  ci-dessus pour continuer
                  votre réservation.
                </p>
              </div>

            </div>
          </div>
        </section>
      )}
    </article>
  );
}

export default FormationDetailPage;