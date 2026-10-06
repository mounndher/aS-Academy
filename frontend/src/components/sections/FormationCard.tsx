import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

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

/* =========================================================
   TYPES
========================================================= */

export interface FormationDay {
  id: number;
  formation_id: number;

  city: string;

  start_date: string;
  end_date: string;

  image?: string | null;

  personal_price: number | string | null;

  cpf_eligible: boolean;
  cpf_price: number | string | null;

  max_places: number;
  remaining_places: number;

  status: string;
}

export interface FormationProgramme {
  id: number;
  name: string;
  slug: string;

  description: string | null;
  duration: string | null;

  is_active: boolean;
}

export interface Formation {
  id: number;

  programme_id: number | null;

  programme: FormationProgramme | null;

  title: string;
  slug: string;

  description: string | null;

  steps: {
    title: string;
    description?: string;
  }[];

  image: string | null;

  pdf_program: string | null;

  deposit_amount: number | string | null;

  personal_price: number | string | null;

  has_sale: boolean;

  sale_price: number | string | null;

  installment_enabled: boolean;

  installment_count: number | null;

  is_active: boolean;

  formationDays: FormationDay[];
}

/* =========================================================
   PROPS
========================================================= */

interface FormationCardProps {
  formation: Formation;

  formationDay: FormationDay;

  index: number;

  className?: string;

  imageAspect?: string;

  delay?: number;
}

/* =========================================================
   DATE
========================================================= */

function formatDateRange(
  start: string,
  end: string
) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startDay =
    startDate.toLocaleDateString(
      "fr-FR",
      { day: "2-digit" }
    );

  const endDay =
    endDate.toLocaleDateString(
      "fr-FR",
      { day: "2-digit" }
    );

  const startMonth =
    startDate.toLocaleDateString(
      "fr-FR",
      { month: "long" }
    );

  const endMonth =
    endDate.toLocaleDateString(
      "fr-FR",
      { month: "long" }
    );

  const startYear =
    startDate.getFullYear();

  const endYear =
    endDate.getFullYear();

  if (
    startMonth === endMonth &&
    startYear === endYear
  ) {
    return `${startDay} — ${endDay} ${endMonth}`;
  }

  return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
}

/* =========================================================
   PRICE
========================================================= */

function formatPrice(
  price: number | string | null
) {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "À venir";
  }

  return `${Number(price).toLocaleString(
    "fr-FR"
  )} €`;
}

/* =========================================================
   IMAGE
========================================================= */

function getFormationImage(
  formation: Formation,
  day: FormationDay
) {
  if (day.image) {
    return day.image;
  }

  if (formation.image) {
    return formation.image;
  }

  return null;
}

/* =========================================================
   CARD
========================================================= */

export function FormationCard({
  formation,
  formationDay,
  index,
  className,
  imageAspect = "aspect-[4/3]",
  delay = 0,
}: FormationCardProps) {
  const programme =
    formation.programme;

  const duration =
    programme?.duration ??
    "3 jours";

  /*
   * IMPORTANT:
   *
   * city identifies the selected session.
   */

  const detailUrl =
    `/formations/${formation.slug}?city=${encodeURIComponent(
      formationDay.city
    )}`;

  /*
   * Reservation keeps both city
   * and exact FormationDay ID.
   */

  const reservationUrl =
    `/formations/${formation.slug}?city=${encodeURIComponent(
      formationDay.city
    )}&day=${formationDay.id}`;

  const image =
    getFormationImage(
      formation,
      formationDay
    );

  const isAvailable =
    formationDay.status ===
      "available" &&
    formationDay.remaining_places > 0;

  return (
    <article
      className={cn(
        "group",
        className
      )}
    >
      {/* IMAGE */}

      <Link
        to={detailUrl}
        aria-label={`${formation.title} — ${formationDay.city}`}
        className="block"
      >
        {image ? (
          <ImageReveal
            src={image}
            alt={`${formation.title} — ${formationDay.city}`}
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

      <Reveal
        delay={delay + 0.15}
      >
        {/* LABEL */}

        <p className="label mt-7 flex items-center gap-4 text-ink/40">
          <span className="font-serif text-lg tracking-normal text-ink/60">
            {String(index + 1).padStart(
              2,
              "0"
            )}
          </span>

          <span className="h-px w-6 bg-current" />

          {programme?.name ??
            formation.title}

          {" · "}

          {duration}
        </p>

        {/* CITY */}

        <h3 className="display mt-4 text-[clamp(2rem,5vw,3.25rem)]">
          <Link
            to={detailUrl}
            className="transition-opacity duration-500 hover:opacity-60"
          >
            {formationDay.city}
          </Link>
        </h3>

        {/* DATE */}

        <p className="mt-2 font-serif text-xl text-ink/70 md:text-2xl">
          {formatDateRange(
            formationDay.start_date,
            formationDay.end_date
          )}
        </p>

        {/* DESCRIPTION */}

        {formation.description && (
          <div
            className="mt-5 max-w-md text-base font-light leading-relaxed text-ink/60"
            dangerouslySetInnerHTML={{
              __html:
                formation.description,
            }}
          />
        )}

        {/* INFORMATION */}

        <dl className="mt-7 grid grid-cols-2 border-t border-ink/10 sm:grid-cols-3">
          <Meta
            label="Durée"
            value={duration}
          />

          <Meta
            label="Tarif"
            value={formatPrice(
              formationDay.personal_price
            )}
            sub={
              formationDay.cpf_eligible &&
              formationDay.cpf_price
                ? `CPF ${formatPrice(
                    formationDay.cpf_price
                  )}`
                : undefined
            }
          />

          <Meta
            label="Acompte"
            value={formatPrice(
              formation.deposit_amount
            )}
            sub="PayPal"
            className="col-span-2 sm:col-span-1"
          />
        </dl>

        {/* BUTTONS */}

        <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Button
            to={reservationUrl}
            state={{
              ...RESERVE_STATE,
              formationDayId:
                formationDay.id,
            }}
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
            to={detailUrl}
            variant="link-dark"
            icon="arrow"
          >
            Voir la formation
          </Button>
        </div>
      </Reveal>
    </article>
  );
}

export default FormationCard;