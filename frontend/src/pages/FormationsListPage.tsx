import { Link } from "react-router-dom";

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

function formatPrice(price: string | number | null | undefined) {
  if (price === null || price === undefined || price === "") {
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

function getStatusClass(status: string) {
  switch (status) {
    case "available":
      return "text-green-700";

    case "complete":
      return "text-red-600";

    case "cancelled":
      return "text-red-600";

    case "finished":
      return "text-ink/40";

    default:
      return "text-ink/50";
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
      {/* IMAGE */}
      <Link
        to={to}
        aria-label={formation.title}
        className="block"
      >
        {formation.image ? (
          <ImageReveal
            src={formation.image}
            alt={formation.title}
            className="aspect-[4/5] w-full"
            priority={index < 3}
          />
        ) : (
          <div className="aspect-[4/5] w-full bg-ink/5 flex items-center justify-center">
            <span className="text-sm text-ink/40">
              Image non disponible
            </span>
          </div>
        )}
      </Link>

      {/* CONTENT */}
      <Reveal delay={0.1 + index * 0.08}>
        {/* PROGRAMME */}
        <p className="label mt-6 text-ink/40">
          {formation.programme || "Formation"}
        </p>

        {/* TITLE */}
        <h2 className="display mt-3 text-[clamp(2rem,5vw,3rem)]">
          <Link
            to={to}
            className="transition-opacity duration-500 hover:opacity-60"
          >
            {formation.title}
          </Link>
        </h2>

        {/* DESCRIPTION */}
        {formation.description && (
          <p className="mt-3 line-clamp-3 text-sm font-light leading-relaxed text-ink/55">
            {formation.description}
          </p>
        )}

        {/* FORMATION DAY */}
        {day ? (
          <>
            {/* CITY */}
            <p className="mt-5 font-serif text-xl text-ink/70 md:text-2xl">
              {day.city}
            </p>

            {/* DATES */}
            <p className="mt-1 text-sm font-light text-ink/50">
              Du {formatDate(day.start_date)} au{" "}
              {formatDate(day.end_date)}
            </p>

            {/* PRICE */}
            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2 border-t border-ink/10 pt-5">
              <span className="font-serif text-2xl leading-none">
                {formatPrice(day.personal_price)}
              </span>

              {day.cpf_price !== null && (
                <span className="text-xs font-light text-ink/50">
                  CPF {formatPrice(day.cpf_price)}
                </span>
              )}
            </div>

            {/* STATUS */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className={`text-sm ${getStatusClass(
                  day.status
                )}`}
              >
                {getStatusLabel(day.status)}
              </span>

              {day.status === "available" && (
                <span className="text-xs text-ink/50">
                  {day.remaining_places}{" "}
                  {day.remaining_places > 1
                    ? "places restantes"
                    : "place restante"}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="mt-5 border-t border-ink/10 pt-5">
            <p className="text-sm font-light text-ink/50">
              Dates à venir
            </p>
          </div>
        )}

        {/* PDF */}
        {formation.pdf_program && (
          <a
            href={formation.pdf_program}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-xs uppercase tracking-[0.15em] text-ink/50 underline underline-offset-4 transition-opacity hover:opacity-60"
          >
            Télécharger le programme PDF
          </a>
        )}

        {/* BUTTON */}
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

  const {
    data: formations,
    loading,
    error,
  } = useFormations();

  /* =========================
     LOADING
  ========================= */

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

  /* =========================
     ERROR
  ========================= */

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

        {/* HEADER */}
        <SectionHeader
          label="Formations"
          title={["Nos", "Formations"]}
          subtitle="Découvrez nos formations professionnelles, leurs dates, leurs villes et leurs tarifs. Réservez directement en ligne."
        />

        {/* FORMATIONS */}
        {formations.length === 0 ? (
          <div className="mt-20 text-center">
            <p className="text-ink/50">
              Aucune formation disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:mt-24 lg:grid-cols-3">
            {formations.map((formation, index) => (
              <Card
                key={formation.id}
                formation={formation}
                index={index}
              />
            ))}
          </div>
        )}

        {/* INSTAGRAM */}
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
