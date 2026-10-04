import { Link } from "react-router-dom";

import { useSiteUI } from "@/context/SiteUIContext";

import { useFormationInformation } from "@/hooks/useFormationInformation";
import { useFormations } from "@/hooks/useFormations";

import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

import { Meta } from "./FormationCard";

export function FormationGrid() {
  const { requestDate } = useSiteUI();

  const {
    data: formationInformationData,
  } = useFormationInformation();

  const {
    data: formations,
    loading,
    error,
  } = useFormations();

  const information = formationInformationData?.information;

  /*
   * Client currently has one formation.
   * If more formations are added later, this will still work.
   */
  const formation = formations[0];

  /*
   * Loading
   */
  if (loading) {
    return (
      <section
        id="formations"
        className="scroll-mt-16 bg-white py-24 lg:py-40"
      >
        <div className="wrap">
          <p className="text-sm text-ink/50">
            Chargement des formations...
          </p>
        </div>
      </section>
    );
  }

  /*
   * Error
   */
  if (error) {
    return (
      <section
        id="formations"
        className="scroll-mt-16 bg-white py-24 lg:py-40"
      >
        <div className="wrap">
          <p className="text-sm text-red-500">
            Impossible de charger les formations.
          </p>
        </div>
      </section>
    );
  }

  /*
   * No formation
   */
  if (!formation) {
    return (
      <section
        id="formations"
        className="scroll-mt-16 bg-white py-24 lg:py-40"
      >
        <div className="wrap">
          <p className="text-sm text-ink/50">
            Aucune formation disponible pour le moment.
          </p>
        </div>
      </section>
    );
  }

  /*
   * Formation sessions / planning
   */
  const formationDays = formation.formation_days ?? [];

  const availableDays = formationDays.filter(
    (day) => day.status === "available"
  );

  /*
   * Cities from database
   */
  const cities = [
    ...new Set(
      formationDays.map((day) => day.city)
    ),
  ];

  /*
   * Lowest normal price
   *
   * Example:
   * Bordeaux = 700 €
   * Paris = 850 €
   *
   * Result = 700 €
   */
  const prices = formationDays
    .map((day) => Number(day.price))
    .filter((price) => !Number.isNaN(price));

  const startingPrice =
    prices.length > 0
      ? Math.min(...prices)
      : Number(formation.personal_price);

  /*
   * CPF price
   */
  const cpfDay = formationDays.find(
    (day) =>
      day.cpf_eligible &&
      day.cpf_price !== null
  );

  const cpfPrice = cpfDay
    ? Number(cpfDay.cpf_price)
    : null;

  /*
   * Format price
   */
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    }).format(price);

  /*
   * Format date
   */
  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));

  return (
    <section
      id="formations"
      className="scroll-mt-16 bg-white py-24 lg:py-40"
    >
      <div className="wrap">

        {/* =====================================================
            SECTION HEADER
        ===================================================== */}

        <SectionHeader
          label={
            information?.eyebrow ||
            "Formations"
          }
          title={[
            information?.title || "Notre",
            information?.subtitle ||
              "Formation",
          ]}
          subtitle={
            information?.description ||
            formation.description ||
            "Formation extension de cils — choisissez votre ville et votre date."
          }
        />

        {/* =====================================================
            MAIN FORMATION
        ===================================================== */}

        <article className="group mt-20 grid gap-10 lg:mt-28 lg:grid-cols-12 lg:items-end lg:gap-14">

          {/* IMAGE */}

          <Link
            to={`/formations/${formation.slug}`}
            className="block lg:col-span-6"
            aria-label={`Découvrir ${formation.title}`}
          >
            {formation.image ? (
              <ImageReveal
                src={formation.image}
                alt={formation.title}
                className="aspect-[4/5] w-full sm:aspect-[4/3] lg:aspect-[4/5]"
                priority
              />
            ) : (
              <div className="flex aspect-[4/5] w-full items-center justify-center bg-ink/5">
                <span className="text-sm text-ink/40">
                  Image de la formation
                </span>
              </div>
            )}
          </Link>

          {/* INFORMATION */}

          <div className="lg:col-span-6 lg:pb-4">

            <Reveal>

              <p className="label flex items-center gap-4 text-ink/40">

                <span className="font-serif text-lg tracking-normal text-ink/60">
                  01
                </span>

                <span className="h-px w-6 bg-current" />

                {formation.programme?.name ||
                  "Formation"}

              </p>

              <h3 className="display mt-5 text-[clamp(2.2rem,6.5vw,4.25rem)]">

                <Link
                  to={`/formations/${formation.slug}`}
                  className="transition-opacity duration-500 hover:opacity-60"
                >
                  {formation.title}
                </Link>

              </h3>

              <p className="mt-3 font-serif text-xl italic text-ink/55 md:text-2xl">
                Extension de cils
              </p>

              <p className="mt-6 max-w-md text-base font-light leading-relaxed text-ink/60">
                {formation.description}
              </p>

            </Reveal>

            {/* =================================================
                METADATA
            ================================================= */}

            <Reveal delay={0.15}>

              <dl className="mt-9 grid grid-cols-2 border-t border-ink/10 sm:grid-cols-3">

                <Meta
                  label="Durée"
                  value="3 jours"
                  sub="Formation intensive"
                />

                <Meta
                  label="Villes"
                  value={`${cities.length} ${
                    cities.length > 1
                      ? "villes"
                      : "ville"
                  }`}
                  sub={cities.join(" · ")}
                />

                <Meta
                  label="Tarif"
                  value={`dès ${formatPrice(
                    startingPrice
                  )} €`}
                  sub={
                    cpfPrice
                      ? `CPF ${formatPrice(
                          cpfPrice
                        )} €`
                      : "Financement personnel"
                  }
                  className="col-span-2 sm:col-span-1"
                />

              </dl>

              {/* CTA */}

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">

                <Button
                  to={`/formations/${formation.slug}`}
                  variant="dark"
                  icon="arrow"
                >
                  Voir les dates & réserver
                </Button>

              </div>

            </Reveal>
          </div>
        </article>

        {/* =====================================================
            PLANNING
        ===================================================== */}

        <div className="mt-24 lg:mt-36">

          <Reveal>

            <div className="flex flex-col gap-3 border-b border-ink/10 pb-5 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p className="label text-ink/50">
                  Planning des formations
                </p>

                <p className="mt-2 text-sm font-light text-ink/50">
                  Choisissez votre ville et votre date.
                </p>
              </div>

              <Button
                to={`/formations/${formation.slug}`}
                variant="link-dark"
                icon="arrow"
              >
                Toutes les dates
              </Button>

            </div>

          </Reveal>

          {/* =================================================
              SESSION CARDS
          ================================================= */}

          {availableDays.length > 0 ? (
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {availableDays.map((day, index) => (
                <Reveal
                  key={day.id}
                  delay={index * 0.08}
                >

                  <article className="border border-ink/10 p-6 transition-colors duration-300 hover:border-ink/30">

                    {/* CITY */}

                    <p className="label text-ink/40">
                      {day.city}
                    </p>

                    {/* DATE */}

                    <h4 className="mt-4 font-serif text-2xl">
                      {formatDate(day.start_date)}
                    </h4>

                    <p className="mt-1 text-sm text-ink/50">
                      au {formatDate(day.end_date)}
                    </p>

                    {/* DETAILS */}

                    <div className="mt-6 border-t border-ink/10 pt-5">

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-ink/50">
                          Tarif
                        </span>

                        <span className="font-medium">
                          {formatPrice(
                            Number(day.price)
                          )} €
                        </span>
                      </div>

                      {/* CPF */}

                      {day.cpf_eligible &&
                        day.cpf_price !== null && (
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm text-ink/50">
                              CPF
                            </span>

                            <span className="font-medium">
                              {formatPrice(
                                Number(
                                  day.cpf_price
                                )
                              )} €
                            </span>
                          </div>
                        )}

                      {/* PLACES */}

                      <div className="mt-2 flex items-center justify-between">

                        <span className="text-sm text-ink/50">
                          Places
                        </span>

                        <span className="font-medium">
                          {day.remaining_places}{" "}
                          / {day.max_places}
                        </span>

                      </div>

                    </div>

                    {/* BUTTON */}

                    <Button
                      to={`/formations/${formation.slug}`}
                      variant="dark"
                      icon="arrow"
                      className="mt-6 w-full"
                    >
                      Réserver
                    </Button>

                  </article>

                </Reveal>
              ))}

            </div>
          ) : (
            /* =================================================
               NO AVAILABLE SESSION
            ================================================= */

            <Reveal>

              <div className="mt-14 border border-ink/10 p-10 text-center">

                <p className="font-serif text-xl">
                  Aucune session disponible
                </p>

                <p className="mt-2 text-sm font-light text-ink/50">
                  Les prochaines dates seront bientôt disponibles.
                </p>

                <Button
                  variant="link-dark"
                  icon="arrow"
                  onClick={requestDate}
                  className="mt-5"
                >
                  Demander une date
                </Button>

              </div>

            </Reveal>
          )}

        </div>
      </div>
    </section>
  );
}
