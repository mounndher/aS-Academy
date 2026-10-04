import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

export const RESERVE_STATE = {
  scrollTo: "reservation",
} as const;

export interface FormationDay {
  id: number;
  formation_id: number;
  city: string;
  start_date: string;
  end_date: string;
  personal_price: number | string | null;
  cpf_price: number | string | null;
  max_places: number;
  remaining_places: number;
  status: string;
}

export interface Formation {
  id: number;
  programme_id: number | null;
  programme: string | null;
  title: string;
  slug: string;
  description: string | null;
  steps: {
    title: string;
    description?: string;
  }[];
  image: string | null;
  pdf_program: string | null;
  is_active: boolean;
  formationDays: FormationDay[];
}

interface FormationCardProps {
  formation: Formation;
  index: number;
  className?: string;
  imageAspect?: string;
  delay?: number;
}

function formatPrice(price: number | string | null) {
  if (price === null || price === undefined) {
    return "Sur demande";
  }

  return `${Number(price).toLocaleString("fr-FR")} €`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getFormationImage(formation: Formation) {
  return {
    src: formation.image ?? "",
    alt: formation.title,
  };
}

function isScheduled(formation: Formation) {
  return formation.formationDays.some(
    (day) =>
      day.status === "available" &&
      day.remaining_places > 0
  );
}

export function Meta({
  label,
  value,
  sub,
  dark = false,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-b py-4 pr-4",
        dark ? "border-ivory/10" : "border-ink/10",
        className
      )}
    >
      <dt
        className={cn(
          "label text-[10px]",
          dark ? "text-ivory/40" : "text-ink/40"
        )}
      >
        {label}
      </dt>

      <dd className="mt-2 font-serif text-xl leading-tight md:text-[1.35rem]">
        {value}
      </dd>

      {sub && (
        <dd
          className={cn(
            "mt-1 text-xs font-light",
            dark ? "text-ivory/45" : "text-ink/45"
          )}
        >
          {sub}
        </dd>
      )}
    </div>
  );
}

export function FormationCard({
  formation,
  index,
  className,
  imageAspect = "aspect-[4/3]",
  delay = 0,
}: FormationCardProps) {
  const formationDays = formation.formationDays ?? [];

  const scheduled = isScheduled(formation);

  const image = getFormationImage(formation);

  const cities = [
    ...new Set(
      formationDays
        .map((day) => day.city)
        .filter(Boolean)
    ),
  ];

  const prices = formationDays
    .map((day) =>
      day.personal_price !== null
        ? Number(day.personal_price)
        : null
    )
    .filter(
      (price): price is number =>
        price !== null && !Number.isNaN(price)
    );

  const cpfPrices = formationDays
    .map((day) =>
      day.cpf_price !== null
        ? Number(day.cpf_price)
        : null
    )
    .filter(
      (price): price is number =>
        price !== null && !Number.isNaN(price)
    );

  const startingPrice =
    prices.length > 0
      ? Math.min(...prices)
      : null;

  const cpfPrice =
    cpfPrices.length > 0
      ? Math.min(...cpfPrices)
      : null;

  const firstDay = formationDays[0];

  const to = `/formations/${formation.slug}`;

  return (
    <article className={cn("group", className)}>
      <Link
        to={to}
        aria-label={`${formation.title}${cities.length ? ` — ${cities.join(", ")}` : ""}`}
        className="block"
      >
        {image.src ? (
          <ImageReveal
            src={image.src}
            alt={image.alt}
            className={cn("w-full", imageAspect)}
            delay={delay}
          />
        ) : (
          <div
            className={cn(
              "flex w-full items-center justify-center bg-ink/5",
              imageAspect
            )}
          >
            <span className="text-sm text-ink/40">
              Image indisponible
            </span>
          </div>
        )}
      </Link>

      <Reveal delay={delay + 0.15}>
        <p className="label mt-7 flex items-center gap-4 text-ink/40">
          <span className="font-serif text-lg tracking-normal text-ink/60">
            {String(index + 1).padStart(2, "0")}
          </span>

          <span className="h-px w-6 bg-current" />

          {formation.programme || "Formation"}
        </p>

        <h3 className="display mt-4 text-[clamp(2rem,5vw,3.25rem)]">
          <Link
            to={to}
            className="transition-opacity duration-500 hover:opacity-60"
          >
            {formation.title}
          </Link>
        </h3>

        {firstDay && (
          <p className="mt-2 font-serif text-xl text-ink/70 md:text-2xl">
            {formatDate(firstDay.start_date)}
          </p>
        )}

        {formation.description && (
          <p className="mt-5 max-w-md text-base font-light leading-relaxed text-ink/60">
            {formation.description}
          </p>
        )}

        <dl className="mt-7 grid grid-cols-2 border-t border-ink/10 sm:grid-cols-3">
          <Meta
            label="Durée"
            value={
              firstDay
                ? `${formatDate(firstDay.start_date)}`
                : "À définir"
            }
          />

          <Meta
            label="Villes"
            value={
              cities.length > 0
                ? `${cities.length} ${
                    cities.length > 1 ? "villes" : "ville"
                  }`
                : "À définir"
            }
            sub={
              cities.length > 0
                ? cities.join(" · ")
                : "À venir"
            }
          />

          <Meta
            label="Tarif"
            value={
              startingPrice !== null
                ? `Dès ${formatPrice(startingPrice)}`
                : "Sur demande"
            }
            sub={
              cpfPrice !== null
                ? `CPF ${formatPrice(cpfPrice)}`
                : "CPF non disponible"
            }
          />
        </dl>

        <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Button
            to={to}
            state={RESERVE_STATE}
            variant={scheduled ? "dark" : "outline-dark"}
            icon="arrow"
          >
            {scheduled
              ? "Réserver"
              : "Demander une date"}
          </Button>

          <Button
            to={to}
            variant="link-dark"
          >
            Voir la formation
          </Button>
        </div>
      </Reveal>
    </article>
  );
}