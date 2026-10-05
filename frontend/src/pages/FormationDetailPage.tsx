import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  Link,
  Navigate,
  useParams,
} from "react-router-dom";

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

function formatDate(date: string): string {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function formatShortDate(date: string): string {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
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
    (day) => day && typeof day === "object"
  );
}

// =========================================================
// ROW
// =========================================================

function Row({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
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

        {sub ? (
          <span className="mt-0.5 block text-xs font-light text-ink/50">
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
  const { slug } = useParams<{ slug: string }>();

  useScrollToState();

  const [formation, setFormation] =
    useState<Formation | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // =======================================================
  // LOAD FORMATION
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

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <main className="bg-ivory">
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
      <main className="bg-ivory">
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

  // =======================================================
  // DATA
  // =======================================================

  const programme = formation.programme;

  const days = getAvailableDays(formation);

  /*
   * First scheduled day.
   *
   * Used as the main image/date/city.
   */
  const firstDay =
    days.length > 0 ? days[0] : null;

  const mainImage = getDayImage(
    formation,
    firstDay
  );

  /*
   * Price:
   *
   * Formation day price has priority because
   * the price belongs to a specific city/date.
   */
  const personalPrice =
    firstDay?.personal_price ??
    formation.personal_price;

  const deposit =
    formation.deposit_amount;

  /*
   * Safe steps.
   */
  const steps = Array.isArray(
    formation.steps
  )
    ? formation.steps
    : [];

  /*
   * Safe programme description.
   */
  const programmeDescription =
    programme?.description ?? null;

  /*
   * Reservation availability.
   */
  const hasAvailablePlace =
    days.some(
      (day) =>
        day.status === "available" &&
        Number(day.remaining_places) > 0
    );

  const ctaText =
    hasAvailablePlace
      ? "Réserver ma place"
      : "Demander une date";

  return (
    <article className="bg-ivory">

      {/* =====================================================
          HERO / INFORMATION
      ===================================================== */}

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

          {/* CONTENT */}

          <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-16">

            {/* =================================================
                IMAGE
            ================================================= */}

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

            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="lg:col-span-5 lg:col-start-8">

              {/* PROGRAMME */}

              {programme ? (
                <p className="label text-ink/50">
                  {programme.name}
                </p>
              ) : (
                <p className="label text-ink/50">
                  Formation
                </p>
              )}

              {/* TITLE */}

              <Headline
                as="h1"
                immediate
                lines={[formation.title]}
                className="mt-5 text-[clamp(2.75rem,9vw,5.5rem)]"
              />

              {/* DESCRIPTION */}

              <Reveal delay={0.2}>

                {formation.description ? (
                  <div
                    className="prose prose-sm mt-8 max-w-none font-light leading-relaxed text-ink/60"
                    dangerouslySetInnerHTML={{
                      __html:
                        formation.description,
                    }}
                  />
                ) : null}

              </Reveal>

              {/* =================================================
                  FORMATION DAYS
              ================================================= */}

              <Reveal delay={0.3}>

                <div className="mt-10 border-y border-ink/10">

                  <div className="py-4">

                    <p className="label text-[10px] text-ink/45">
                      Sessions disponibles
                    </p>

                  </div>

                  {days.length === 0 ? (
                    <div className="border-t border-ink/10 py-5">
                      <p className="text-sm text-ink/50">
                        Aucune date disponible actuellement.
                      </p>
                    </div>
                  ) : (
                    days.map((day) => (
                      <div
                        key={day.id}
                        className="border-t border-ink/10 py-5"
                      >

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                          <div>

                            {/* CITY */}

                            <p className="font-serif text-2xl">
                              {day.city}
                            </p>

                            {/* DATES */}

                            <p className="mt-1 text-sm font-light text-ink/55">
                              {formatDate(
                                day.start_date
                              )}

                              {day.end_date &&
                              day.end_date !==
                                day.start_date
                                ? ` — ${formatDate(
                                    day.end_date
                                  )}`
                                : ""}
                            </p>

                          </div>

                          <div className="text-left sm:text-right">

                            {/* PRICE */}

                            <p className="font-serif text-xl">
                              {formatPrice(
                                day.personal_price
                              )}
                            </p>

                            {/* PLACES */}

                            <p className="mt-1 text-xs text-ink/50">
                              {day.remaining_places > 0
                                ? `${day.remaining_places} place${
                                    day.remaining_places > 1
                                      ? "s"
                                      : ""
                                  } restante${
                                    day.remaining_places > 1
                                      ? "s"
                                      : ""
                                  }`
                                : "Complet"}
                            </p>

                          </div>

                        </div>

                      </div>
                    ))
                  )}

                </div>

              </Reveal>

              {/* =================================================
                  GENERAL INFORMATION
              ================================================= */}

              <Reveal delay={0.35}>

                <dl className="mt-10 divide-y divide-ink/10 border-y border-ink/10">

                  {/* DURATION */}

                  {programme?.duration ? (
                    <Row
                      label="Durée"
                      value={programme.duration}
                    />
                  ) : null}

                  {/* PRICE */}

                  <Row
                    label="Prix"
                    value={formatPrice(
                      personalPrice
                    )}
                  />

                  {/* CPF */}

                  {firstDay?.cpf_eligible &&
                  firstDay.cpf_price ? (
                    <Row
                      label="Financement CPF"
                      value={formatPrice(
                        firstDay.cpf_price
                      )}
                    />
                  ) : null}

                  {/* DEPOSIT */}

                  {deposit !== null &&
                  deposit !== undefined ? (
                    <Row
                      label="Acompte"
                      value={formatPrice(
                        deposit
                      )}
                    />
                  ) : null}

                  {/* INSTALLMENTS */}

                  {formation.installment_enabled &&
                  formation.installment_count ? (
                    <Row
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
                <Reveal delay={0.4}>

                  <div className="mt-10">

                    <p className="label text-ink/50">
                      Programme
                    </p>

                    <ol className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">

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

              {/* =================================================
                  PROGRAMME DESCRIPTION
              ================================================= */}

              {programmeDescription ? (
                <Reveal delay={0.45}>

                  <div
                    className="prose prose-sm mt-10 max-w-none font-light leading-relaxed text-ink/60"
                    dangerouslySetInnerHTML={{
                      __html:
                        programmeDescription,
                    }}
                  />

                </Reveal>
              ) : null}

              {/* =================================================
                  CTA
              ================================================= */}

              <Reveal delay={0.5}>

                <div className="mt-10">

                  <Button
                    variant="dark"
                    size="lg"
                    icon="arrow"
                    className="w-full sm:w-auto"
                    onClick={() =>
                      scrollToId(
                        "reservation"
                      )
                    }
                  >
                    {ctaText}
                  </Button>

                </div>

              </Reveal>

            </div>
          </div>
        </div>
      </section>

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
              lines={[
                hasAvailablePlace
                  ? "Réserver"
                  : "Demander",
                hasAvailablePlace
                  ? "ma place"
                  : "une date",
              ]}
              className="mt-6 text-[clamp(2.5rem,7vw,4.5rem)]"
            />

            <Reveal delay={0.2}>

              <p className="mt-6 max-w-sm text-base font-light leading-relaxed text-ink/60">

                {hasAvailablePlace ? (
                  <>
                    Remplissez vos coordonnées
                    pour réserver votre place
                    pour cette formation.
                  </>
                ) : (
                  <>
                    Aucune place n'est
                    actuellement disponible.
                    Laissez-nous vos
                    coordonnées afin d'être
                    recontacté.
                  </>
                )}

              </p>

              <dl className="mt-8 divide-y divide-ink/10 border-t border-ink/10">

                <Row
                  label="Formation"
                  value={formation.title}
                />

                {firstDay ? (
                  <>
                    <Row
                      label="Ville"
                      value={firstDay.city}
                    />

                    <Row
                      label="Date"
                      value={formatShortDate(
                        firstDay.start_date
                      )}
                      sub={
                        firstDay.end_date !==
                        firstDay.start_date
                          ? `jusqu'au ${formatShortDate(
                              firstDay.end_date
                            )}`
                          : undefined
                      }
                    />
                  </>
                ) : null}

                {deposit !== null &&
                deposit !== undefined ? (
                  <Row
                    label="Acompte"
                    value={formatPrice(
                      deposit
                    )}
                  />
                ) : null}

              </dl>

            </Reveal>

          </div>

          {/* =================================================
              RESERVATION FORM
          ================================================= */}

          <div className="lg:col-span-7 lg:col-start-6">

            <Reveal delay={0.15}>

              <ReservationForm
                formation={formation}
                programme={programme}
              />

            </Reveal>

          </div>

        </div>
      </section>

    </article>
  );
}

export default FormationDetailPage;