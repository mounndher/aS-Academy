import { Link } from "react-router-dom";
import { eur, formatDays, type Formation } from "@/data/formations";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { RESERVE_STATE } from "./FormationCard";

function Price({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-2.5 sm:block sm:border-0 sm:py-0">
      <dt className="label text-[10px] leading-snug text-ink/45">{label}</dt>
      <dd className="font-serif text-2xl leading-none sm:mt-3">{value}</dd>
    </div>
  );
}

/** Large horizontal calendar row — one bookable formation. */
export function SessionCard({ formation: f, index }: { formation: Formation; index: number }) {
  const to = `/formations/${f.slug}`;

  return (
    <Reveal delay={index * 0.08} y={24}>
      <article className="group relative -mx-4 grid gap-7 border-b border-ink/15 px-4 py-9 transition-colors duration-700 hover:bg-white/80 lg:-mx-6 lg:grid-cols-12 lg:items-center lg:gap-6 lg:px-6 lg:py-11">
        <div className="flex items-baseline gap-5 lg:col-span-3">
          <span className="label text-[10px] text-ink/35">0{index + 1}</span>
          <h3 className="display text-[clamp(2.25rem,7vw,3rem)]">
            <Link to={to} className="transition-opacity duration-500 hover:opacity-60">
              {f.city}
            </Link>
          </h3>
        </div>

        <div className="lg:col-span-3">
          <p className="font-serif text-[clamp(2rem,6vw,3rem)] leading-none tracking-[0.02em]">{formatDays(f)}</p>
          <p className="label mt-2.5 text-ink/50">{f.month}</p>
        </div>

        {f.pricing && (
          <dl className="grid grid-cols-1 gap-x-6 sm:grid-cols-3 lg:col-span-4">
            <Price label="Financement personnel" value={eur(f.pricing.personal)} />
            <Price label="Financement CPF" value={eur(f.pricing.cpf)} />
            <Price label="Acompte" value={eur(f.pricing.deposit)} />
          </dl>
        )}

        <div className="lg:col-span-2 lg:text-right">
          <Button to={to} state={RESERVE_STATE} variant="outline-dark" icon="arrow" className="w-full sm:w-auto">
            Réserver
          </Button>
        </div>
      </article>
    </Reveal>
  );
}