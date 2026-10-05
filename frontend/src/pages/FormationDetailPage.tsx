import { ArrowLeft, Check, MapPin } from "lucide-react";
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

import type {
  Formation,
  FormationDay,
} from "@/types/formation";

// =========================================================
// HELPERS
// =========================================================

function formatDate(date: string): string {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function formatDateRange(
  startDate: string,
  endDate: string
): string {
  if (!startDate) return "";

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;

  if (Number.isNaN(start.getTime())) {
    return "";
  }

  if (Number.isNaN(end.getTime())) {
    return formatDate(startDate);
  }

  const startDay = start.getDate();
  const endDay = end.getDate();

  const startMonth = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
  }).format(start);

  const endMonth = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
  }).format(end);

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

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
    return `${startDay} — ${endDay} ${endMonth} ${endYear}`;
  }

  return `${startDay} ${startMonth} ${startYear} — ${endDay} ${endMonth} ${endYear}`;
}

function formatPrice(
  value: number | string | null | undefined
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "—";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(number);
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "available":
      return "Disponible";

    case "full":
      return "Complet";

    case "cancelled":
      return "Annulée";

    case "finished":
      return "Terminée";

    default:
      return status;
  }
}

function getStatusClass(status: string): string {
  switch (status) {
    case "available":
      return "text-emerald-700";

    case "full":
      return "text-red-600";

    case "cancelled":
      return "text-red-600";

    case "finished":
      return "text-ink/40";

    default:
      return "text-ink/60";
  }
}

// =========================================================
// ROW
// =========================================================

function Row({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-8 border-b border-ink/10 py-5">
      <span className="label text-ink/45">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm text-ink">
        {value}
      </span>
    </div>
  );
}

// =========================================================
// SESSION CARD
// =========================================================

function FormationDayCard({
  day,
  onReserve,
}: {
  day: FormationDay;
  onReserve: () => void;
}) {
  const isAvailable =
    day.status === "available" &&
    day.remaining_places > 0;

  return (
    <article className="border border-ink/10 bg-white">
      {/* IMAGE */}

      {day.image ? (
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={day.image}
            alt={`Formation à ${day.city}`}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      {/* CONTENT */}

      <div className="p-6 lg:p-8">
        {/* CITY */}

        <div className="flex items-center gap-2">
          <MapPin
            size={15}
            strokeWidth={1.5}
            className="text-ink/50"
          />

          <p className="label text-ink/50">
            {day.city}
          </p>
        </div>

        {/* DATE */}

        <h3 className="mt-5 font-serif text-2xl text-ink">
          {formatDateRange(
            day.start_date,
            day.end_date
          )}
        </h3>

        {/* INFO */}

        <div className="mt-6">
          <Row
            label="Prix"
            value={formatPrice(day.personal_price)}
          />

          {day.cpf_eligible && (
            <Row
              label="CPF"
              value={formatPrice(day.cpf_price)}
            />
          )}

          <Row
            label="Places"
            value={
              day.remaining_places > 0
                ? `${day.remaining_places} place${
                    day.remaining_places > 1
                      ? "s"
                      : ""
                  }`
                : "Aucune place"
            }
          />

          <Row
            label="Statut"
            value={
              <span
                className={getStatusClass(
                  day.status
                )}
              >
                {getStatusLabel(day.status)}
              </span>
            }
          />
        </div>

        {/* BUTTON */}

        <div className="mt-7">
          <Button
            type="button"
            variant="dark"
            icon="arrow"
            onClick={onReserve}
            disabled={!isAvailable}
          >
            {isAvailable
              ? "Réserver cette session"
              : getStatusLabel(day.status)}
          </Button>
        </div>
      </div>
    </article>
  );
}

// =========================================================
// PAGE
// =========================================================

export function FormationDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const {
    formation,
    loading,
    error,
  } = useFormationFeature(slug);

  useScrollToState();

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <main className="bg-white">
        <section className="wrap py-32 lg:py-48">
          <p className="text-sm text-ink/50">
            Chargement de la formation...
          </p>
        </section>
      </main>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error) {
    return (
      <main className="bg-white">
        <section className="wrap py-32 lg:py-48">
          <p className="text-sm text-red-500">
            {error}
          </p>

          <div className="mt-8">
            <Button
              to="/formations"
              variant="link-dark"
              icon="arrow"
            >
              Retour aux formations
            </Button>
          </div>
        </section>
      </main>
    );
  }

  // =======================================================
  // NOT FOUND
  // =======================================================

  if (!formation) {
    return (
      <main className="bg-white">
        <section className="wrap py-32 lg:py-48">
          <p className="text-sm text-ink/50">
            Formation introuvable.
          </p>

          <div className="mt-8">
            <Button
              to="/formations"
              variant="link-dark"
              icon="arrow"
            >
              Retour aux formations
            </Button>
          </div>
        </section>
      </main>
    );
  }

  // =======================================================
  // DATA
  // =======================================================

  const safeDays = Array.isArray(
    formation.formationDays
  )
    ? formation.formationDays
    : [];

  const safeSteps = Array.isArray(
    formation.steps
  )
    ? formation.steps
    : [];

  const programme = formation.programme;

  // =======================================================
  // RESERVE
  // =======================================================

  function handleReserve() {
    scrollToId("reservation");
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <main className="bg-white">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="wrap pt-10 lg:pt-16">
        <Reveal>
          <Link
            to="/formations"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/50 transition hover:text-ink"
          >
            <ArrowLeft size={14} />
            Toutes les formations
          </Link>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-20">
          {/* IMAGE */}

          <ImageReveal>
            <div className="aspect-[4/3] overflow-hidden bg-ink/5">
              {formation.image ? (
                <img
                  src={formation.image}
                  alt={formation.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-ink/40">
                  Aucune image
                </div>
              )}
            </div>
          </ImageReveal>

          {/* TEXT */}

          <Reveal>
            <div>
              <p className="label text-ink/45">
                Formation professionnelle
              </p>

              <Headline
                title={formation.title}
                className="mt-5"
              />

              {programme?.name && (
                <p className="mt-5 text-sm text-ink/50">
                  {programme.name}
                </p>
              )}

              {formation.description && (
                <div
                  className="prose prose-sm mt-8 max-w-none text-ink/65"
                  dangerouslySetInnerHTML={{
                    __html:
                      formation.description,
                  }}
                />
              )}

              <div className="mt-10">
                <Button
                  type="button"
                  variant="dark"
                  icon="arrow"
                  onClick={handleReserve}
                >
                  Réserver une formation
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =================================================
          PROGRAMME
      ================================================= */}

      <section className="wrap mt-24 lg:mt-40">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
          {/* LEFT */}

          <Reveal>
            <div>
              <p className="label text-ink/45">
                Le programme
              </p>

              <h2 className="mt-4 font-serif text-3xl text-ink lg:text-5xl">
                Une formation complète
              </h2>
            </div>
          </Reveal>

          {/* RIGHT */}

          <Reveal>
            <div>
              {programme?.description && (
                <div
                  className="prose prose-sm max-w-none text-ink/65"
                  dangerouslySetInnerHTML={{
                    __html:
                      programme.description,
                  }}
                />
              )}

              <div className="mt-8">
                {programme?.duration && (
                  <Row
                    label="Durée"
                    value={programme.duration}
                  />
                )}

                {programme?.name && (
                  <Row
                    label="Programme"
                    value={programme.name}
                  />
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =================================================
          STEPS
      ================================================= */}

      {safeSteps.length > 0 && (
        <section className="wrap mt-24 lg:mt-40">
          <Reveal>
            <div className="border-t border-ink/10 pt-10">
              <p className="label text-ink/45">
                Déroulement
              </p>

              <h2 className="mt-4 font-serif text-3xl text-ink lg:text-5xl">
                Le programme de formation
              </h2>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-0 md:grid-cols-2">
            {safeSteps.map((step, index) => (
              <Reveal
                key={`${step.title}-${index}`}
                delay={index * 0.08}
              >
                <div className="border-b border-ink/10 p-6 md:p-8">
                  <div className="flex items-start gap-5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/15 text-xs text-ink/50">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <div>
                      <h3 className="font-serif text-xl text-ink">
                        {step.title}
                      </h3>

                      {step.description && (
                        <p className="mt-3 text-sm leading-7 text-ink/55">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* =================================================
          SESSIONS / VILLES
      ================================================= */}

      <section className="wrap mt-24 lg:mt-40">
        <Reveal>
          <div className="border-t border-ink/10 pt-10">
            <p className="label text-ink/45">
              Prochaines sessions
            </p>

            <h2 className="mt-4 font-serif text-3xl text-ink lg:text-5xl">
              Choisissez votre ville
            </h2>
          </div>
        </Reveal>

        {safeDays.length === 0 ? (
          <div className="mt-12 border border-ink/10 p-8">
            <p className="text-sm text-ink/50">
              Aucune session disponible
              actuellement.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {safeDays.map((day) => (
              <Reveal key={day.id}>
                <FormationDayCard
                  day={day}
                  onReserve={handleReserve}
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* =================================================
          RESERVATION
      ================================================= */}

      <section
        id="reservation"
        className="wrap scroll-mt-24 py-24 lg:py-40"
      >
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
          <Reveal>
            <div>
              <p className="label text-ink/45">
                Réservation
              </p>

              <h2 className="mt-4 font-serif text-3xl text-ink lg:text-5xl">
                Réservez votre formation
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-ink/55">
                Choisissez votre session et
                complétez vos informations pour
                effectuer votre réservation.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <ReservationForm
              formation={formation}
            />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
export default FormationDetailPage;