import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import type { ReactNode } from "react";

import { useFormationFeature } from "@/hooks/useFormationFeature";
import { useScrollToState } from "@/hooks/useScrollToState";

import { scrollToId } from "@/lib/scroll";

import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

import { ReservationForm } from "@/components/booking/ReservationForm";

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

function formatDate(date?: string | null) {
  if (!date) {
    return "Date à venir";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateRange(
  start?: string | null,
  end?: string | null
) {
  if (!start) {
    return "Date à venir";
  }

  if (!end || start === end) {
    return formatDate(start);
  }

  return `${formatDate(start)} — ${formatDate(end)}`;
}

function formatPrice(value?: number | string | null) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Sur demande";
  }

  return `${Number(value).toLocaleString("fr-FR")} €`;
}

export function FormationDetailPage() {
  const { slug } = useParams();

  useScrollToState();

  /*
   * Formation is loaded dynamically from Laravel.
   */
  const {
    formation,
    loading,
    error,
  } = useFormationFeature(slug);

  /*
   * =========================
   * LOADING
   * =========================
   */

  if (loading) {
    return (
      <article className="bg-ivory">
        <section className="pt-28 pb-20 lg:pt-36 lg:pb-28">
          <div className="wrap">
            <p className="text-sm text-ink/50">
              Chargement de la formation...
            </p>
          </div>
        </section>
      </article>
    );
  }

  /*
   * =========================
   * ERROR
   * =========================
   */

  if (error || !formation) {
    return (
      <article className="bg-ivory">
        <section className="pt-28 pb-20 lg:pt-36 lg:pb-28">
          <div className="wrap">
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

            <div className="mt-10">
              <p className="text-sm text-red-500">
                {error ||
                  "Formation introuvable."}
              </p>
            </div>
          </div>
        </section>
      </article>
    );
  }

  /*
   * =========================
   * DYNAMIC DATA
   * =========================
   */

  const days = formation.formationDays ?? [];

  /*
   * Find the first session with available places.
   */
  const availableDay =
    days.find(
      (day) =>
        Number(day.remaining_places) > 0 &&
        day.status !== "full" &&
        day.status !== "completed"
    ) ?? null;

  /*
   * If there is at least one formation day,
   * the formation has a schedule.
   */
  const scheduled = days.length > 0;

  /*
   * Use the first upcoming day for the
   * main information displayed on the page.
   */
  const mainDay =
    availableDay ??
    days[0] ??
    null;

  const city =
    mainDay?.city ?? "À définir";

  const dateText = mainDay
    ? formatDateRange(
        mainDay.start_date,
        mainDay.end_date
      )
    : "Dates à venir";

  const personalPrice =
    mainDay?.personal_price;

  const cpfPrice =
    mainDay?.cpf_price;

  /*
   * Programme comes directly from Laravel.
   */
  const programme =
    formation.programme ?? "Formation";

  /*
   * Steps come directly from Laravel.
   */
  const steps =
    formation.steps ?? [];

  const cta = scheduled
    ? "Réserver ma place"
    : "Demander une date";

  /*
   * =========================
   * PAGE
   * =========================
   */

  return (
    <article className="bg-ivory">
      {/* ---------- Information ---------- */}

      <section className="pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="wrap">

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

            {/* IMAGE */}

            <div className="lg:col-span-6">
              {formation.image ? (
                <ImageReveal
                  src={formation.image}
                  alt={formation.title}
                  className="aspect-[4/5] w-full"
                  priority
                />
              ) : (
                <div className="flex aspect-[4/5] w-full items-center justify-center bg-ink/5">
                  <span className="text-sm text-ink/40">
                    Image indisponible
                  </span>
                </div>
              )}
            </div>

            {/* CONTENT */}

            <div className="lg:col-span-5 lg:col-start-8">

              <p className="label text-ink/50">
                {programme}
              </p>

              <Headline
                as="h1"
                immediate
                lines={[city]}
                className="mt-5 text-[clamp(2.75rem,9vw,5.5rem)]"
              />

              <p className="mt-3 font-serif text-2xl leading-none text-ink/70 md:text-3xl">
                {dateText}
              </p>

              <Reveal delay={0.2}>

                {formation.description && (
                  <p className="mt-8 font-serif text-xl leading-[1.35] text-ink/85 md:text-2xl">
                    {formation.description}
                  </p>
                )}

              </Reveal>

              <Reveal delay={0.3}>

                <dl className="mt-10 divide-y divide-ink/10 border-y border-ink/10">

                  <Row
                    label="Durée"
                    value={
                      days.length > 0
                        ? `${days.length} jours`
                        : "À définir"
                    }
                  />

                  <Row
                    label="Dates"
                    value={dateText}
                  />

                  <Row
                    label="Ville"
                    value={city}
                  />

                  <Row
                    label="Financement personnel"
                    value={formatPrice(
                      personalPrice
                    )}
                  />

                  <Row
                    label="Financement CPF"
                    value={formatPrice(
                      cpfPrice
                    )}
                  />

                </dl>

              </Reveal>

              <Reveal delay={0.35}>

                {/* PROGRAMME */}

                {steps.length > 0 && (
                  <>
                    <p className="label mt-10 text-ink/50">
                      Programme
                    </p>

                    <ol className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">

                      {steps.map(
                        (step, index) => (
                          <li
                            key={`${step.title}-${index}`}
                            className="flex items-baseline gap-3 font-serif text-lg leading-snug"
                          >
                            <span className="label text-[10px] text-ink/35">
                              {String(
                                index + 1
                              ).padStart(2, "0")}
                            </span>

                            {step.title}
                          </li>
                        )
                      )}

                    </ol>
                  </>
                )}

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
                    {cta}
                  </Button>
                </div>

              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Reservation ---------- */}

      <section
        id="reservation"
        className="scroll-mt-20 border-t border-ink/10 bg-white py-20 lg:py-28"
      >
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-16">

          <div className="lg:col-span-4">

            <Reveal>

              <p className="label flex items-center gap-4 text-ink/50">
                <span className="h-px w-10 bg-current" />

                Réservation
              </p>

            </Reveal>

            <Headline
              lines={
                scheduled
                  ? ["Réserver", "ma place"]
                  : ["Demander", "une date"]
              }
              className="mt-6 text-[clamp(2.5rem,7vw,4.5rem)]"
            />

            <Reveal delay={0.2}>

              <p className="mt-6 max-w-sm text-base font-light leading-relaxed text-ink/60">

                {scheduled ? (
                  <>
                    Remplissez vos coordonnées
                    pour réserver votre place.
                    Les informations de la
                    session sélectionnée sont
                    affichées automatiquement.
                  </>
                ) : (
                  <>
                    Les dates pour cette formation
                    ne sont pas encore ouvertes.
                    Laissez-nous vos coordonnées
                    et votre période souhaitée :
                    nous vous recontactons dès
                    l'ouverture.
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
                  value={dateText}
                />

                {personalPrice !== null &&
                  personalPrice !== undefined && (
                    <Row
                      label="Tarif"
                      value={formatPrice(
                        personalPrice
                      )}
                    />
                  )}

              </dl>

            </Reveal>
          </div>

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