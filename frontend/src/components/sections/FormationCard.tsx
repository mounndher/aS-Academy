import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

/* =========================================================
   TYPES
========================================================= */

export interface FormationDay {
  id: number;
  formation_id: number;
  city: string;
  start_date: string;
  end_date: string;
  personal_price: number | string | null;
  cpf_eligible: boolean;
  cpf_price: number | string | null;
  max_places: number;
  remaining_places: number;
  status: string;
  image?: string | null;
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

interface FormationCardProps {
  formation: Formation;
  formationDay: FormationDay;
  index: number;
  className?: string;
  imageAspect?: string;
  delay?: number;
}

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
        className,
      )}
    >
      <dt
        className={cn(
          "label text-[10px]",
          dark ? "text-ivory/40" : "text-ink/40",
        )}
      >
        {label}
      </dt>
      <dd className="mt-2 font-serif text-xl leading-tight md:text-[1.35rem]">
        {value}
      </dd>
      {sub ? (
        <dd
          className={cn(
            "mt-1 text-xs font-light",
            dark ? "text-ivory/45" : "text-ink/45",
          )}
        >
          {sub}
        </dd>
      ) : null}
    </div>
  );
}

/* =========================================================
   DATE HELPERS
========================================================= */

function parseDate(value: string): Date {
  // Treat YYYY-MM-DD as a local calendar date to avoid timezone shifts.
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return new Date(value);
}

export function formatDateRange(start: string, end: string): string {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "Dates à confirmer";
  }

  const day = (date: Date) =>
    date.toLocaleDateString("fr-FR", { day: "numeric" });
  const month = (date: Date) =>
    date.toLocaleDateString("fr-FR", { month: "long" });
  const year = (date: Date) => date.getFullYear();

  if (
    day(startDate) === day(endDate) &&
    month(startDate) === month(endDate) &&
    year(startDate) === year(endDate)
  ) {
    return `${day(startDate)} ${month(startDate)} ${year(startDate)}`;
  }

  if (month(startDate) === month(endDate) && year(startDate) === year(endDate)) {
    return `${day(startDate)}–${day(endDate)} ${month(endDate)} ${year(endDate)}`;
  }

  if (year(startDate) === year(endDate)) {
    return `${day(startDate)} ${month(startDate)} – ${day(endDate)} ${month(endDate)} ${year(endDate)}`;
  }

  return `${day(startDate)} ${month(startDate)} ${year(startDate)} – ${day(endDate)} ${month(endDate)} ${year(endDate)}`;
}

/* =========================================================
   PRICE
========================================================= */

function formatPrice(price: number | string | null): string {
  if (price === null || price === undefined || price === "") {
    return "À venir";
  }
  const value = Number(price);
  if (!Number.isFinite(value)) return "À venir";
  return `${value.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €`;
}

/* =========================================================
   FORMATION CARD
========================================================= */

export function FormationCard({
  formation,
  formationDay,
  index,
  className,
  imageAspect = "aspect-[4/3]",
  delay = 0,
}: FormationCardProps) {
  const programme = formation.programme;
  const duration = programme?.duration || "Durée à confirmer";
 const detailUrl =
  `/formations/${formation.slug}` +
  `?city=${encodeURIComponent(formationDay.city)}` +
  `&day=${formationDay.id}`;

const reserveUrl = `${detailUrl}&scrollTo=reservation`;

  const status = (formationDay.status || "").toLowerCase();
  const isAvailable =
    status === "available" && Number(formationDay.remaining_places) > 0;
  const image = formationDay.image || formation.image;

  return (
    <article className={cn("group", className)}>
      <Link
        to={detailUrl}
        aria-label={`${formation.title} — ${formationDay.city}`}
        className="block"
      >
        {image ? (
          <ImageReveal
            src={image}
            alt={`${formation.title} — ${formationDay.city}`}
            className={cn("w-full", imageAspect)}
            delay={delay}
          />
        ) : (
          <div
            role="img"
            aria-label={`Image non disponible pour ${formation.title}`}
            className={cn("w-full bg-ink/5", imageAspect)}
          />
        )}
      </Link>

      <Reveal delay={delay + 0.15}>
        <p className="label mt-7 flex items-center gap-4 text-ink/40">
          <span className="font-serif text-lg tracking-normal text-ink/60">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="h-px w-6 bg-current" />
          {programme?.name || formation.title}
          {duration !== "Durée à confirmer" ? ` · ${duration}` : ""}
        </p>

        <h3 className="display mt-4 text-[clamp(2rem,5vw,3.25rem)]">
          <Link
            to={detailUrl}
            className="transition-opacity duration-500 hover:opacity-60"
          >
            {formationDay.city}
          </Link>
        </h3>

        <p className="mt-3 text-sm font-light text-ink/60">
          {formatDateRange(formationDay.start_date, formationDay.end_date)}
        </p>

        {formation.description ? (
          <div
            className="mt-5 max-w-md text-base font-light leading-relaxed text-ink/60"
            dangerouslySetInnerHTML={{ __html: formation.description }}
          />
        ) : null}

        <dl className="mt-7 grid grid-cols-2 border-t border-ink/10 sm:grid-cols-3">
          <Meta label="Durée" value={duration} />
          <Meta
            label="Tarif"
            value={formatPrice(formationDay.personal_price)}
            sub={
              formationDay.cpf_eligible && formationDay.cpf_price !== null
                ? `CPF : ${formatPrice(formationDay.cpf_price)}`
                : undefined
            }
          />
          <Meta
            label="Acompte"
            value={formatPrice(formation.deposit_amount)}
            sub="À régler après confirmation"
            className="col-span-2 sm:col-span-1"
          />
        </dl>

        {!isAvailable ? (
          <p className="mt-4 text-xs text-ink/50">
            {Number(formationDay.remaining_places) <= 0 ||
              status === "full" ||
              status === "complet"
              ? "Session complète — disponibilité à vérifier"
              : "Disponibilité à confirmer"}
          </p>
        ) : null}

        <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Button
            to={reserveUrl}
            variant={"dark" }
            icon="arrow"
            className="border border-[#111111] bg-[#111111] text-white hover:bg-[#333333]"
          >
            Réserver
          </Button>

          <Button
            to={detailUrl}
            variant="outline-dark"
            className="border border-[#C8C8C8] bg-white text-[#111111] hover:bg-[#E5E5E5]"
          >
            Voir la formation
          </Button>
        </div>
      </Reveal>
    </article>
  );
}

export default FormationCard;
