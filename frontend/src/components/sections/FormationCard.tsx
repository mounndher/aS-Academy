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
  steps: {
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

interface FormationCardProps {
  formation: Formation;
  day: FormationDay;
  index: number;
}

function formatDateRange(
  start: string,
  end: string
) {
  if (!start || !end) {
    return "";
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

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

  const month = endDate.toLocaleDateString(
    "fr-FR",
    {
      month: "long",
    }
  );

  return `${startDay} — ${endDay} ${month}`;
}

function formatPrice(
  price: string | number | null | undefined
) {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "À venir";
  }

  return `${Number(price).toLocaleString("fr-FR")} €`;
}

function getStatusText(
  day: FormationDay
) {
  if (day.remaining_places <= 0) {
    return "Complet";
  }

  if (day.status === "available") {
    return "Réserver";
  }

  return "Demander une date";
}

export function FormationCard({
  formation,
  day,
  index,
}: FormationCardProps) {
  const formationSlug = formation.slug;

  const formationUrl =
    `/formations/${formationSlug}`;

  const duration =
    formation.programme?.duration ||
    "À venir";

  const programmeName =
    formation.programme?.name ||
    formation.title;

  const description =
    formation.description ||
    formation.programme?.description ||
    "";

  const isAvailable =
    day.status === "available" &&
    day.remaining_places > 0;

  return (
    <article
      className={cn(
        "group",
        index === 1 && "lg:mt-20"
      )}
    >
      {/* =====================================================
          IMAGE
      ===================================================== */}

      <Link
        to={formationUrl}
        aria-label={`${formation.title} — ${day.city}`}
        className="block"
      >
        {formation.image ? (
          <ImageReveal
            src={formation.image}
            alt={formation.title}
            className={cn(
              "w-full",
              index === 1
                ? "aspect-[4/5]"
                : "aspect-[4/3]"
            )}
            delay={index * 0.08}
          />
        ) : (
          <div
            className={cn(
              "flex w-full items-center justify-center bg-ink/5",
              index === 1
                ? "aspect-[4/5]"
                : "aspect-[4/3]"
            )}
          >
            <span className="text-sm text-ink/40">
              Image indisponible
            </span>
          </div>
        )}
      </Link>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <Reveal
        delay={index * 0.08 + 0.15}
      >
        {/* EYEBROW */}

        <p className="label mt-7 flex items-center gap-4 text-ink/40">
          <span className="font-serif text-lg tracking-normal text-ink/60">
            {String(index + 1).padStart(2, "0")}
          </span>

          <span className="h-px w-6 bg-current" />

          <span>
            {programmeName}
            {duration
              ? ` · ${duration}`
              : ""}
          </span>
        </p>

        {/* CITY */}

        <h3 className="display mt-4 text-[clamp(2rem,5vw,3.25rem)]">
          <Link
            to={formationUrl}
            className="transition-opacity duration-500 hover:opacity-60"
          >
            {day.city}
          </Link>
        </h3>

        {/* DATE */}

        <p className="mt-2 font-serif text-xl text-ink/70 md:text-2xl">
          {formatDateRange(
            day.start_date,
            day.end_date
          )}
        </p>

        {/* DESCRIPTION */}

        {description && (
          <div
            className="mt-5 max-w-md text-base font-light leading-relaxed text-ink/60"
            dangerouslySetInnerHTML={{
              __html: description,
            }}
          />
        )}

        {/* =====================================================
            INFORMATION
        ===================================================== */}

        <dl className="mt-7 grid grid-cols-2 border-t border-ink/10 sm:grid-cols-3">

          {/* DURÉE */}

          <div className="border-b border-ink/10 py-4 pr-4">
            <dt className="label text-[10px] text-ink/40">
              Durée
            </dt>

            <dd className="mt-2 font-serif text-xl leading-tight">
              {duration}
            </dd>
          </div>

          {/* TARIF */}

          <div className="border-b border-ink/10 py-4 pr-4">
            <dt className="label text-[10px] text-ink/40">
              Tarif
            </dt>

            <dd className="mt-2 font-serif text-xl leading-tight">
              {formatPrice(
                day.personal_price
              )}
            </dd>

            {day.cpf_eligible &&
              day.cpf_price && (
                <dd className="mt-1 text-xs font-light text-ink/45">
                  CPF{" "}
                  {formatPrice(
                    day.cpf_price
                  )}
                </dd>
              )}
          </div>

          {/* ACOMPTE */}

          <div className="col-span-2 border-b border-ink/10 py-4 pr-4 sm:col-span-1">
            <dt className="label text-[10px] text-ink/40">
              Acompte
            </dt>

            <dd className="mt-2 font-serif text-xl leading-tight">
              {formatPrice(
                formation.deposit_amount
              )}
            </dd>

            <dd className="mt-1 text-xs font-light text-ink/45">
              PayPal
            </dd>
          </div>

        </dl>

        {/* =====================================================
            PLACES
        ===================================================== */}

        <div className="mt-5 text-sm font-light text-ink/60">
          <span className="font-medium text-ink">
            {day.remaining_places}
          </span>{" "}
          places restantes sur{" "}
          <span className="font-medium text-ink">
            {day.max_places}
          </span>
        </div>

        {/* =====================================================
            BUTTONS
        ===================================================== */}

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
            {getStatusText(day)}
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