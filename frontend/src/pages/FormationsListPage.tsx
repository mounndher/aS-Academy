import { Link } from "react-router-dom";



import { useScrollToState } from "@/hooks/useScrollToState";
import { useFormations } from "@/hooks/useFormations";

import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";


function formatDate(
  startDate: string,
  endDate?: string
) {
  const start = new Date(startDate);

  const startText = start.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  if (!endDate) {
    return startText;
  }

  const end = new Date(endDate);

  const endText = end.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return `${startText} — ${endText}`;
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


export function FormationsListPage() {
  useScrollToState();

  const p = mainProgramme;

  const {
    formations,
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
          <p className="text-red-600">
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
              {p.title} — {p.duration}. Choisissez votre ville et vos dates,
              puis réservez en ligne.
            </>
          }
        />


        <div className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:mt-24 lg:grid-cols-3">

          {formations.map((formation, index) => {

            const firstDay =
              formation.formationDays?.[0];

            return (
              <article key={formation.id}>

                {/* IMAGE */}

                <Link
                  to={`/formations/${formation.slug}`}
                  aria-label={formation.title}
                  className="block"
                >

                  <ImageReveal
                    src={
                      formation.image ||
                      "/images/placeholder.jpg"
                    }
                    alt={formation.title}
                    className="aspect-[4/5] w-full"
                    priority={index < 3}
                  />

                </Link>


                <Reveal delay={0.1}>

                  {/* PROGRAMME */}

                  <p className="label mt-6 text-ink/40">
                    {formation.programme ||
                      formation.title}
                  </p>


                  {/* TITLE */}

                  <h2 className="display mt-3 text-[clamp(2rem,5vw,3rem)]">

                    <Link
                      to={`/formations/${formation.slug}`}
                      className="transition-opacity duration-500 hover:opacity-60"
                    >
                      {formation.title}
                    </Link>

                  </h2>


                  {/* CITY + DATE */}

                  {firstDay && (
                    <>
                      <p className="mt-1.5 font-serif text-xl text-ink/70 md:text-2xl">
                        {firstDay.city}
                      </p>

                      <p className="mt-2 text-sm font-light text-ink/55">
                        {formatDate(
                          firstDay.start_date,
                          firstDay.end_date
                        )}
                      </p>


                      <p
                        className={`mt-2 text-xs uppercase tracking-[0.18em] ${getStatusClass(
                          firstDay.status
                        )}`}
                      >
                        {getStatusLabel(
                          firstDay.status
                        )}
                      </p>
                    </>
                  )}


                  {/* PRICE */}

                  {firstDay && (
                    <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-ink/10 pt-5">

                      <span className="font-serif text-2xl leading-none">

                        {firstDay.personal_price
                          ? eur(
                              Number(
                                firstDay.personal_price
                              )
                            )
                          : ""}

                      </span>


                      {firstDay.cpf_price && (
                        <span className="text-xs font-light text-ink/50">

                          CPF{" "}
                          {eur(
                            Number(
                              firstDay.cpf_price
                            )
                          )}

                        </span>
                      )}

                    </div>
                  )}


                  {/* PLACES */}

                  {firstDay && (
                    <p className="mt-3 text-xs text-ink/45">

                      {firstDay.remaining_places} place
                      {firstDay.remaining_places > 1
                        ? "s"
                        : ""}{" "}
                      restante
                      {firstDay.remaining_places > 1
                        ? "s"
                        : ""}

                    </p>
                  )}


                  {/* BUTTON */}

                  <Button
                    to={`/formations/${formation.slug}`}
                    variant="outline-dark"
                    icon="arrow"
                    className="mt-6 w-full sm:w-auto"
                  >
                    Voir la formation
                  </Button>

                </Reveal>

              </article>
            );
          })}

        </div>


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
