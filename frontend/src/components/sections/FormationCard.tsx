import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

// =========================================================
// RESERVATION STATE
// =========================================================

export const RESERVE_STATE = {
  scrollTo: "reservation",
} as const;

// =========================================================
// TYPES
// =========================================================

export interface FormationDay {
  id: number;
  formation_id: number;
  city: string;
  start_date: string;
  end_date: string;
  personal_price: string | null;
  cpf_eligible: boolean;
  cpf_price: string | null;
  max_places: number;
  remaining_places: number;
  status: string;
}

export interface Formation {
  id: number;
  programme_id: number;
  title: string;
  slug: string;
  description: string | null;

  steps?: {
    title: string;
    description: string;
  }[];

  image: string | null;
  pdf_program: string | null;

  deposit_amount: string | null;

  personal_price: string | null;

  has_sale: boolean;
  sale_price: string | null;

  installment_enabled: boolean;
  installment_count: number | null;

  is_active: boolean;

  programme?: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    duration: string | null;
    is_active: boolean;
  };

  formationDays: FormationDay[];
}

// =========================================================
// META
// =========================================================

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
        dark
          ? "border-ivory/10"
          : "border-ink/10",
        className
      )}
    >
      <dt
        className={cn(
          "label text-[10px]",
          dark
            ? "text-ivory/40"
            : "text-ink/40"
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
            dark
              ? "text-ivory/45"
              : "text-ink/45"
          )}
        >
          {sub}
        </dd>
      )}
    </div>
  );
}

// =========================================================
// DATE RANGE
// =========================================================

function formatDateRange(
  start: string,
  end: string
): string {
  if (!start || !end) {
    return "";
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return "";
  }

  const startDay =
    startDate.toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
      }
    );

  const endDay =
    endDate.toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
      }
    );

  const month =
    endDate.toLocaleDateString(
      "fr-FR",
      {
        month: "long",
      }
    );

  return `${startDay} — ${endDay} ${month}`;
}

// =========================================================
// PRICE
// =========================================================

function formatPrice(
  price:
    | string
    | number
    | null
    | undefined
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
    return "À venir";
  }

  return `${numericPrice.toLocaleString(
    "fr-FR"
  )} €`;
}

// =========================================================
// PROPS
// =========================================================

interface FormationCardProps {
  formation: Formation;
  formationDay: FormationDay;
  index: number;
  className?: string;
  imageAspect?: string;
  delay?: number;
}

// =========================================================
// FORMATION CARD
// =========================================================

export function FormationCard({
  formation,
  formationDay: day,
  index,
  className,
  imageAspect,
  delay = 0,
}: FormationCardProps) {
  const programme =
    formation.programme;

  const duration =
    programme?.duration ??
    "Durée non précisée";

  const image =
    formation.image;

  const formationUrl =
    `/formations/${formation.slug}`;

  // =======================================================
  // AVAILABILITY
  // =======================================================

  const isAvailable =
    day.status === "available" &&
    day.remaining_places > 0;

  // =======================================================
  // IMAGE RATIO
  // =======================================================

  const cardImageAspect =
    imageAspect ??
    (index === 1
      ? "aspect-[4/5]"
      : "aspect-[4/3]");

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <article
      className={cn(
        "group",
        index === 1 && "lg:mt-20",
        className
      )}
    >
      {/* ===================================================
          IMAGE
      =================================================== */}

      <Link
        to={formationUrl}
        aria-label={`${formation.title} — ${day.city}`}
        className="block"
      >
        {image ? (
          <ImageReveal
            src={image}
            alt={formation.title}
            className={cn(
              "w-full",
              cardImageAspect
            )}
            delay={delay}
          />
        ) : (
          <div
            className={cn(
              "w-full bg-ink/5",
              cardImageAspect
            )}
          />
        )}
      </Link>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <Reveal
        delay={delay + 0.15}
      >
        {/* =================================================
            EYEBROW
        ================================================= */}

        <p className="label mt-7 flex items-center gap-4 text-ink/40">

          <span className="font-serif text-lg tracking-normal text-ink/60">
            {String(index + 1).padStart(
              2,
              "0"
            )}
          </span>

          <span className="h-px w-6 bg-current" />

          <span>
            {programme?.name ??
              formation.title}

            {duration
              ? ` · ${duration}`
              : ""}
          </span>

        </p>

        {/* =================================================
            CITY
        ================================================= */}

        <h3 className="display mt-4 text-[clamp(2rem,5vw,3.25rem)]">
          <Link
            to={formationUrl}
            className="transition-opacity duration-500 hover:opacity-60"
          >
            {day.city}
          </Link>
        </h3>

        {/* =================================================
            DATE
        ================================================= */}

        <p className="mt-2 font-serif text-xl text-ink/70 md:text-2xl">
          {formatDateRange(
            day.start_date,
            day.end_date
          )}
        </p>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        {formation.description && (
          <div
            className="mt-5 max-w-md text-base font-light leading-relaxed text-ink/60"
            dangerouslySetInnerHTML={{
              __html:
                formation.description,
            }}
          />
        )}

        {/* =================================================
            INFORMATION
        ================================================= */}

        <dl className="mt-7 grid grid-cols-2 border-t border-ink/10 sm:grid-cols-3">

          {/* DURÉE */}

          <Meta
            label="Durée"
            value={duration}
          />

          {/* TARIF */}

          <Meta
            label="Tarif"
            value={formatPrice(
              day.personal_price
            )}
            sub={
              day.cpf_eligible &&
              day.cpf_price
                ? `CPF ${formatPrice(
                    day.cpf_price
                  )}`
                : undefined
            }
          />

          {/* ACOMPTE */}

          <Meta
            label="Acompte"
            value={formatPrice(
              formation.deposit_amount
            )}
            sub="PayPal"
            className="col-span-2 sm:col-span-1"
          />

        </dl>

        {/* =================================================
            PLACES
        ================================================= */}

        <div className="mt-5 text-sm font-light text-ink/60">

          <span className="font-medium text-ink">
            {day.remaining_places}
          </span>{" "}

          places restantes sur{" "}

          <span className="font-medium text-ink">
            {day.max_places}
          </span>

        </div>

        {/* =================================================
            BUTTONS
        ================================================= */}

        <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3">

          <Button
            to={formationUrl}
            state={RESERVE_STATE}
            variant={
              isAvailable
                ? "dark"
                : "outline-dark"
            }
            icon="arrow"
          >
            {isAvailable
              ? "Réserver"
              : "Demander une date"}
          </Button>

          <Button
            to={formationUrl}
            variant="link-dark"
          >
            Voir la formation
          </Button>

        </div>
      </Reveal>
    </article>
  );
}

export default FormationCard;