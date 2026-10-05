import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

import { useFormations } from "@/hooks/useFormations";

import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

function formatDate(date: string) {
  if (!date) return "";

  const d = new Date(date);

  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateRange(start: string, end: string) {
  if (!start || !end) return "";

  const startDate = new Date(start);
  const endDate = new Date(end);

  const startDay = startDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
  });

  const endDay = endDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
  });

  const month = endDate.toLocaleDateString("fr-FR", {
    month: "long",
  });

  return `${startDay} — ${endDay} ${month}`;
}

function formatPrice(price: string | number | null | undefined) {
  if (price === null || price === undefined || price === "") {
    return "À venir";
  }

  return `${Number(price).toLocaleString("fr-FR")} €`;
}

function FormationCard({
  formation,
  day,
  index,
}: {
  formation: any;
  day: any;
  index: number;
}) {
  const formationSlug = formation.slug;

  return (
    <article
      className={cn(
        "group",
        index === 1 && "lg:mt-20"
      )}
    >
      {/* IMAGE */}
      <Link
        to={`/formations/${formationSlug}`}
        aria-label={`${formation.title} — ${day.city}`}
        className="block"
      >
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
      </Link>

      <Reveal delay={index * 0.08 + 0.15}>
        {/* EYEBROW */}
        <p className="label mt-7 flex items-center gap-4 text-ink/40">
          <span className="font-serif text-lg tracking-normal text-ink/60">
            {String(index + 1).padStart(2, "0")}
          </span>

          <span className="h-px w-6 bg-current" />

          {formation.programme?.name || formation.title}

          {formation.programme?.duration
            ? ` · ${formation.programme.duration}`
            : ""}
        </p>

        {/* CITY */}
        <h3 className="display mt-4 text-[clamp(2rem,5vw,3.25rem)]">
          <Link
            to={`/formations/${formationSlug}`}
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
        <p
          className="mt-5 max-w-md text-base font-light leading-relaxed text-ink/60"
          dangerouslySetInnerHTML={{
            __html:
              formation.description ||
              formation.programme?.description ||
              "",
          }}
        />

        {/* META */}
        <dl className="mt-7 grid grid-cols-2 border-t border-ink/10 sm:grid-cols-3">
          {/* DURÉE */}
          <div className="border-b border-ink/10 py-4 pr-4">
            <dt className="label text-[10px] text-ink/40">
              Durée
            </dt>

            <dd className="mt-2 font-serif text-xl leading-tight">
              {formation.programme?.duration || "À venir"}
            </dd>
          </div>

          {/* TARIF */}
          <div className="border-b border-ink/10 py-4 pr-4">
            <dt className="label text-[10px] text-ink/40">
              Tarif
            </dt>

            <dd className="mt-2 font-serif text-xl leading-tight">
              {formatPrice(day.personal_price)}
            </dd>

            {day.cpf_eligible && (
              <dd className="mt-1 text-xs font-light text-ink/45">
                CPF {formatPrice(day.cpf_price)}
              </dd>
            )}
          </div>

          {/* ACOMPTE */}
          <div className="col-span-2 border-b border-ink/10 py-4 pr-4 sm:col-span-1">
            <dt className="label text-[10px] text-ink/40">
              Acompte
            </dt>

            <dd className="mt-2 font-serif text-xl leading-tight">
              {formatPrice(formation.deposit_amount)}
            </dd>

            <dd className="mt-1 text-xs font-light text-ink/45">
              PayPal
            </dd>
          </div>
        </dl>

        {/* PLACES */}
        <div className="mt-5 text-sm font-light text-ink/60">
          <span className="font-medium text-ink">
            {day.remaining_places}
          </span>{" "}
          places restantes sur{" "}
          <span className="font-medium text-ink">
            {day.max_places}
          </span>
        </div>

        {/* BUTTONS */}
        <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Button
            to={`/formations/${formationSlug}`}
            variant={
              day.status === "available"
                ? "dark"
                : "outline-dark"
            }
            icon="arrow"
          >
            {day.status === "available"
              ? "Réserver"
              : "Demander une date"}
          </Button>

          <Button
            to={`/formations/${formationSlug}`}
            variant="link-dark"
          >
            Voir la formation
          </Button>
        </div>
      </Reveal>
    </article>
  );
}

export function FormationGrid() {
  const {
    data,
    loading,
    error,
  } = useFormations();

  /*
   * API:
   *
   * {
   *   success: true,
   *   data: [
   *     {
   *       formation,
   *       formationDays: [
   *         Paris,
   *         Toulouse,
   *         Bruxelles,
   *         Bordeaux,
   *         ...
   *       ]
   *     }
   *   ]
   * }
   */

  if (loading) {
    return (
      <section
        id="formations"
        className="bg-white py-24 lg:py-40"
      >
        <div className="wrap">
          <p className="text-sm text-ink/50">
            Chargement des formations...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="formations"
        className="bg-white py-24 lg:py-40"
      >
        <div className="wrap">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </div>
      </section>
    );
  }

  const formations = data?.data ?? [];

  /*
   * Convert:
   *
   * Formation 1
   *   ├── Paris
   *   ├── Toulouse
   *   ├── Bruxelles
   *   ├── Bordeaux
   *   └── Lyon
   *
   * INTO:
   *
   * Card Paris
   * Card Toulouse
   * Card Bruxelles
   * Card Bordeaux
   * Card Lyon
   */

  const cards = formations.flatMap(
    (formation: any) =>
      (formation.formationDays ?? []).map(
        (day: any) => ({
          formation,
          day,
        })
      )
  );

  return (
    <section
      id="formations"
      className="scroll-mt-16 bg-white py-24 lg:py-40"
    >
      <div className="wrap">

        {/* HEADER OF THE CARDS SECTION */}
        <Reveal>
          <div className="flex flex-col gap-3 border-b border-ink/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <p className="label text-ink/50">
              Prochaines formations — réservation en ligne
            </p>

            <Button
              to="/formations"
              variant="link-dark"
              icon="arrow"
            >
              Toutes les formations
            </Button>
          </div>
        </Reveal>

        {/* EMPTY */}
        {cards.length === 0 && (
          <div className="py-20">
            <p className="text-sm font-light text-ink/50">
              Aucune formation disponible pour le moment.
            </p>
          </div>
        )}

        {/* DYNAMIC CARDS */}
        {cards.length > 0 && (
          <div className="mt-14 grid gap-16 md:grid-cols-2 md:gap-10 lg:grid-cols-3">
            {cards.map(
              (
                item: {
                  formation: any;
                  day: any;
                },
                index: number
              ) => (
                <FormationCard
                  key={`${item.formation.id}-${item.day.id}`}
                  formation={item.formation}
                  day={item.day}
                  index={index}
                />
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}