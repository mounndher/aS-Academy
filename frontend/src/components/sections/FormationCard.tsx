import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

/* =========================================================
   RESERVATION STATE
========================================================= */

export const RESERVE_STATE = {
  scrollTo: "reservation",
} as const;

/* =========================================================
   META
========================================================= */

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

/* =========================================================
   FORMATION DAY
========================================================= */

export interface FormationDay {
  id: number;
  formation_id: number;

  city: string;

  /*
   * Image specific to this city/session.
   */
  image: string | null;

  start_date: string;
  end_date: string;

  personal_price: string | null;

  cpf_eligible: boolean;
  cpf_price: string | null;

  max_places: number;
  remaining_places: number;

  status: string;
}

/* =========================================================
   FORMATION
========================================================= */

export interface Formation {
  id: number;
  programme_id: number;

  title: string;
  slug: string;

  description: string | null;

  /*
   * Main formation image.
   * Used as fallback if the FormationDay has no image.
   */
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

/* =========================================================
   PROPS
========================================================= */

export interface FormationCardProps {
  formation: Formation;
  formationDay: FormationDay;
  index: number;
  className?: string;
  imageAspect?: string;
  delay?: number;
}

/* =========================================================
   PRICE FORMAT
========================================================= */

function formatPrice(price: string | null) {
  if (!price) {
    return "À venir";
  }

  return `${Number(price).toLocaleString("fr-FR")} €`;
}

/* =========================================================
   FORMATION CARD
========================================================= */

export function FormationCard({
  formation: f,
  formationDay: day,
  index,
  className,
  imageAspect = "aspect-[4/3]",
  delay = 0,
}: FormationCardProps) {
  /* =======================================================
     URL
  ======================================================= */

  const to = `/formations/${f.slug}`;

  /* =======================================================
     IMAGE

     Priority:
     1. Image of the city/session
     2. Main formation image
  ======================================================= */

  const image = day.image || f.image;

  /* =======================================================
     CITY
  ======================================================= */

  const city = day.city || "Lieu à définir";

  /* =======================================================
     DURATION

     Keep "3 jours".
  ======================================================= */

  const duration =
    f.programme?.duration || "3 jours";

  /* =======================================================
     AVAILABILITY
  ======================================================= */

  const isAvailable =
    day.status === "available" &&
    day.remaining_places > 0;

  /* =======================================================
     PRICE
  ======================================================= */

  const price = day.personal_price;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <article className={cn("group", className)}>

      {/* ===================================================
          IMAGE
      =================================================== */}

      <Link
        to={to}
        aria-label={`${f.title} — ${city}`}
        className="block"
      >
        {image ? (
          <ImageReveal
            src={image}
            alt={`${f.title} — ${city}`}
            className={cn(
              "w-full",
              imageAspect
            )}
            delay={delay}
          />
        ) : (
          <div
            className={cn(
              "w-full bg-ink/5",
              imageAspect
            )}
          />
        )}
      </Link>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <Reveal delay={delay + 0.15}>

        {/* =================================================
            LABEL
        ================================================= */}

        <p className="label mt-7 flex items-center gap-4 text-ink/40">

          <span className="font-serif text-lg tracking-normal text-ink/60">
            {String(index + 1).padStart(2, "0")}
          </span>

          <span className="h-px w-6 bg-current" />

          {f.programme?.name ?? f.title}

        </p>

        {/* =================================================
            CITY
        ================================================= */}

        <h3 className="display mt-4 text-[clamp(2rem,5vw,3.25rem)]">

          <Link
            to={to}
            className="transition-opacity duration-500 hover:opacity-60"
          >
            {city}
          </Link>

        </h3>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        {f.description && (
          <div
            className="mt-5 max-w-md text-base font-light leading-relaxed text-ink/60"
            dangerouslySetInnerHTML={{
              __html: f.description,
            }}
          />
        )}

        {/* =================================================
            INFORMATION

            Date removed.
            PayPal removed.

            We keep:
            - Durée
            - Tarif
            - Acompte
        ================================================= */}

        <dl className="mt-7 grid grid-cols-2 border-t border-ink/10 sm:grid-cols-3">

          {/* =================================================
              DURATION
          ================================================= */}

          <Meta
            label="Durée"
            value={duration}
          />

          {/* =================================================
              PRICE
          ================================================= */}

          <Meta
            label="Tarif"
            value={formatPrice(price)}
            sub={
              day.cpf_eligible &&
              day.cpf_price
                ? `CPF ${formatPrice(
                    day.cpf_price
                  )}`
                : undefined
            }
          />

          {/* =================================================
              DEPOSIT
          ================================================= */}

          <Meta
            label="Acompte"
            value={formatPrice(
              f.deposit_amount
            )}
            className="col-span-2 sm:col-span-1"
          />

        </dl>

        {/* =================================================
            BUTTONS
        ================================================= */}

        <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3">

          {/* =================================================
              RESERVE
          ================================================= */}

          <Button
            to={to}
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

          {/* =================================================
              DETAILS
          ================================================= */}

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

export default FormationCard;