
import { Link } from "react-router-dom";
import { eur } from "@/data/formations";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";


interface FormationDay {
  id: number;
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

interface Formation {
  title: string;
  slug: string;
  deposit_amount: string | null;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const sameDay =
    startDate.toISOString().slice(0, 10) ===
    endDate.toISOString().slice(0, 10);

  if (sameDay) {
    return formatDate(start);
  }

  return `${formatDate(start)} – ${formatDate(end)}`;
}

function Price({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-2.5 sm:block sm:border-0 sm:py-0">
      <dt className="label text-[10px] leading-snug text-ink/45">
        {label}
      </dt>
      <dd className="font-serif text-2xl leading-none sm:mt-3">
        {value}
      </dd>
    </div>
  );
}

export function SessionCard({
  formation,
  day,
  index,
}: {
  formation: Formation;
  day: FormationDay;
  index: number;
}) {
  const to = `/formations/${formation.slug}`;

  const isFull =
    day.remaining_places <= 0 ||
    day.status.toLowerCase() === "full" ||
    day.status.toLowerCase() === "complet";

  const canReserve = !isFull && day.status.toLowerCase() === "available";

  return (
    <Reveal delay={index * 0.08} y={24}>
      <article className="group relative -mx-4 grid gap-7 border-b border-ink/15 px-4 py-9 transition-colors duration-700 hover:bg-white/80 lg:-mx-6 lg:grid-cols-12 lg:items-center lg:gap-6 lg:px-6 lg:py-11">
        <div className="lg:col-span-3">
          <p className="label text-[10px] text-ink/35">
            {formation.title}
          </p>
          <h3 className="display mt-2 text-[clamp(2.25rem,7vw,3rem)]">
            <Link
              to={to}
              className="transition-opacity duration-500 hover:opacity-60"
            >
              {day.city}
            </Link>
          </h3>
        </div>

        <div className="lg:col-span-3">
          <p className="font-serif text-lg leading-relaxed sm:text-xl">
            {formatDateRange(day.start_date, day.end_date)}
          </p>

          <p className="label mt-2.5 text-ink/50">
            {isFull
              ? "Session complète"
              : `${day.remaining_places} place(s) restante(s)`}
          </p>
        </div>

        <dl className="grid grid-cols-1 gap-x-6 sm:grid-cols-3 lg:col-span-4">
          {day.personal_price !== null && (
            <Price
              label="Financement personnel"
              value={eur(Number(day.personal_price))}
            />
          )}

          {day.cpf_eligible && day.cpf_price !== null && (
            <Price
              label="Financement CPF"
              value={eur(Number(day.cpf_price))}
            />
          )}

          {formation.deposit_amount !== null && (
            <Price
              label="Acompte"
              value={eur(Number(formation.deposit_amount))}
            />
          )}
        </dl>

        <div className="lg:col-span-2 lg:text-right">
          {canReserve ? (
            <Button
  to={`${to}#reservation`}
  variant="outline-dark"
  icon="arrow"
  className="w-full sm:w-auto"
>
  Réserver
</Button>
          ) : (
            <span className="inline-block border border-ink/15 px-4 py-3 text-xs text-ink/50">
              {isFull ? "Complet" : "Indisponible"}
            </span>
          )}
        </div>
      </article>
    </Reveal>
  );
}
