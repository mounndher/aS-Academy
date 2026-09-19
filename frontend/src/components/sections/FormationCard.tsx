import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";
import {
  CPF_PRICE,
  DEPOSIT,
  dateLabel,
  eur,
  formationImage,
  isScheduled,
  programmeOf,
  type Formation,
} from "@/data/formations";
import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

/** Location state that lands the visitor directly on the reservation form. */
export const RESERVE_STATE = { scrollTo: "reservation" } as const;

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
    <div className={cn("border-b py-4 pr-4", dark ? "border-ivory/10" : "border-ink/10", className)}>
      <dt className={cn("label text-[10px]", dark ? "text-ivory/40" : "text-ink/40")}>{label}</dt>
      <dd className="mt-2 font-serif text-xl leading-tight md:text-[1.35rem]">{value}</dd>
      {sub && (
        <dd className={cn("mt-1 text-xs font-light", dark ? "text-ivory/45" : "text-ink/45")}>
          {sub}
        </dd>
      )}
    </div>
  );
}

interface FormationCardProps {
  formation: Formation;
  index: number;
  className?: string;
  imageAspect?: string;
  delay?: number;
}

/** Editorial card for one bookable formation (city · dates · price). */
export function FormationCard({
  formation: f,
  index,
  className,
  imageAspect = "aspect-[4/3]",
  delay = 0,
}: FormationCardProps) {
  const p = programmeOf(f);
  const img = formationImage(f);
  const to = `/formations/${f.slug}`;
  const scheduled = isScheduled(f);

  return (
    <article className={cn("group", className)}>
      <Link to={to} aria-label={`${p.title} — ${f.city}`} className="block">
        <ImageReveal src={img.src} alt={img.alt} className={cn("w-full", imageAspect)} delay={delay} />
      </Link>

      <Reveal delay={delay + 0.15}>
        <p className="label mt-7 flex items-center gap-4 text-ink/40">
          <span className="font-serif text-lg tracking-normal text-ink/60">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="h-px w-6 bg-current" />
          {p.title} · {p.duration}
        </p>
        <h3 className="display mt-4 text-[clamp(2rem,5vw,3.25rem)]">
          <Link to={to} className="transition-opacity duration-500 hover:opacity-60">
            {f.city}
          </Link>
        </h3>
        <p className="mt-2 font-serif text-xl text-ink/70 md:text-2xl">{dateLabel(f)}</p>
        <p className="mt-5 max-w-md text-base font-light leading-relaxed text-ink/60">{p.short}</p>

        <dl className="mt-7 grid grid-cols-2 border-t border-ink/10 sm:grid-cols-3">
          <Meta label="Durée" value={p.duration} />
          <Meta
            label="Tarif"
            value={f.pricing ? eur(f.pricing.personal) : "À venir"}
            sub={f.pricing ? `CPF ${eur(f.pricing.cpf)}` : `CPF ${eur(CPF_PRICE)}`}
          />
          <Meta
            label="Acompte"
            value={eur(f.pricing?.deposit ?? DEPOSIT)}
            sub="PayPal"
            className="col-span-2 sm:col-span-1"
          />
        </dl>

        <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Button
            to={to}
            state={RESERVE_STATE}
            variant={scheduled ? "dark" : "outline-dark"}
            icon="arrow"
          >
            {scheduled ? "Réserver" : "Demander une date"}
          </Button>
          <Button to={to} variant="link-dark">
            Voir la formation
          </Button>
        </div>
      </Reveal>
    </article>
  );
}
