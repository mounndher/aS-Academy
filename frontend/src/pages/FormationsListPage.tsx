import { Link } from "react-router-dom";

import { mainProgramme } from "@/data/programmes";
import { site } from "@/data/site";

import { useFormations } from "@/hooks/useFormations";
import { useScrollToState } from "@/hooks/useScrollToState";

import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatPrice(price: string | number | null) {
  if (price === null || price === undefined) {
    return "Sur demande";
  }

  return `${Number(price).toLocaleString("fr-FR")} €`;
}

function getStatusLabel(status: string) {
  switch (status) {
    case "available":
      return "Disponible";

    case "complete":
      return "Complet";

    case "cancelled":
      return "Annulée";

    case "finished":
      return "Terminée";

    default:
      return status;
  }
}

function Card({
  formation,
  index,
}: {
  formation: any;
  index: number;
}) {
  const day = formation.formationDays?.[0];

  const to = `/formations/${formation.slug}`;

  return (
    <article>
      <Link
        to={to}
        aria-label={formation.title}
        className="block"
      >
        <ImageReveal
          src={formation.image}
          alt={formation.title}
          className="aspect-[4/5] w-full"
          priority={index < 3}
        />
      </Link>

      <Reveal delay={0.1 + index * 0.08}>
        <p className="label mt-6 text-ink/40">
          {formation.programme || "Formation"}
        </p>

        <h2 className="display mt-3 text-[clamp(2rem,5vw,3rem)]">
          <Link
            to={to}
            className="transition-opacity duration-500 hover:opacity-60"
          >
            {formation.title}
          </Link>
        </h2>

        {day && (
          <>
            <p className="mt-2 font-serif text-xl text-ink/70 md:text-2xl">
              {day.city}
            </p>

            <p className="mt-1 text-sm font-light text-ink/50">
              Du {formatDate(day.start_date)} au{" "}
              {formatDate(day.end_date)}
            </p>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2 border-t border-ink/10 pt-5">
              <span className="font-serif text-2xl leading-none">
                {formatPrice(day.personal_price)}
              </span>

              <span className="text-xs font-light text-ink/50">
                CPF {formatPrice(day.cpf_price)}
              </span>
            </div>

            <div className="mt-3">
              <span
                className={
                  day.status === "available"
                    ? "text-sm text-green-700"
                    : "text-sm text-red-600"
                }
              >
                {getStatusLabel(day.status)}
              </span>

              <span className="ml-3 text-xs text-ink/50">
                {day.remaining_places} place
                {day.remaining_places > 1 ? "s" : ""} restante
                {day.remaining_places > 1 ? "s" : ""}
              </span>
            </div>
          </>
        )}

        <Button
          to={to}
          variant="outline-dark"
          icon="arrow"
          className="mt-6 w-full sm:w-auto"
        >
          Voir la formation
        </Button>
      </Reveal>
    </article>
  );
}

export function FormationsListPage() {
  useScrollToState();

  const p = mainProgramme;

  const {
    data: formations,
    loading,
    error,
  } = useFormations();

  if (loading) {
    return (
      <section className="bg-ivory pt-28 pb-24 lg:pt-36 lg:pb-36">
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
      <section className="bg-ivory pt-28 pb-24 lg:pt-36 lg:pb-36">
        <div className="wrap">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-ivory pt-28 pb-24 lg:pt-36 lg:pb-36">
      <div className="wrap">

        <SectionHeader
          label="Formations"
          title={["Nos", "Formations"]}
          subtitle={
            <>
              {p.title} — {p.duration}. Choisissez votre
              ville et vos dates, puis réservez en ligne.
            </>
          }
        />

        {formations.length === 0 ? (
          <div className="mt-20 text-center">
            <p className="text-ink/50">
              Aucune formation disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:mt-24 lg:grid-cols-3">
            {formations.map((formation, i) => (
              <Card
                key={formation.id}
                formation={formation}
                index={i}
              />
            ))}
          </div>
        )}

        <Reveal>
          <p className="mt-20 border-t border-ink/10 pt-8 text-sm font-light text-ink/55">
            Une autre ville ou une autre date ? Écrivez-nous
            sur Instagram{" "}
            <a
              href={site.instagram.url}
              target="_blank"
              rel="noreferrer"
              className="link-line text-ink"
            >
              {site.instagram.handle}
            </a>
            .
          </p>
        </Reveal>

      </div>
    </section>
  );
}
