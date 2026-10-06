import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";
import { getStorageUrl } from "@/services/api";

import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ImageReveal } from "@/components/ui/ImageReveal";

import { ReservationForm } from "@/components/booking/ReservationForm";

import type {
  FormationDay,
} from "@/types/formation";

/* =========================================================
   DATE
========================================================= */

function formatDateRange(
  start: string,
  end: string
) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startDay = startDate.toLocaleDateString(
    "fr-FR",
    { day: "2-digit" }
  );

  const endDay = endDate.toLocaleDateString(
    "fr-FR",
    { day: "2-digit" }
  );

  const startMonth = startDate.toLocaleDateString(
    "fr-FR",
    { month: "long" }
  );

  const endMonth = endDate.toLocaleDateString(
    "fr-FR",
    { month: "long" }
  );

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  if (
    startMonth === endMonth &&
    startYear === endYear
  ) {
    return `${startDay} — ${endDay} ${endMonth}`;
  }

  return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
}

/* =========================================================
   PRICE
========================================================= */

function formatPrice(
  value: number | string | null
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "À venir";
  }

  return `${Number(value).toLocaleString(
    "fr-FR"
  )} €`;
}

/* =========================================================
   RESERVATION BUTTON
========================================================= */

function scrollToReservation() {
  document
    .getElementById("reservation")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
}

/* =========================================================
   PAGE
========================================================= */

export function FormationDetailPage() {
  const [searchParams] =
    useSearchParams();

  const slug =
    searchParams.get("slug") ??
    window.location.hash
      .split("/formations/")
      .pop()
      ?.split("?")[0];

  const city =
    searchParams.get("city");

  const {
    data: formation,
    loading,
    error,
  } = useFormation(slug);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="bg-ivory">
        <section className="wrap py-32 lg:py-48">
          <p className="label text-ink/40">
            Chargement de la formation...
          </p>
        </section>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !formation) {
    return (
      <main className="bg-ivory">
        <section className="wrap py-32 lg:py-48">
          <p className="label text-ink/40">
            Formation
          </p>

          <h1 className="display mt-6 text-5xl lg:text-7xl">
            Formation introuvable
          </h1>

          <Link
            to="/formations"
            className="mt-10 inline-flex text-sm underline underline-offset-8"
          >
            ← Toutes les formations
          </Link>
        </section>
      </main>
    );
  }

  /* =======================================================
     ALL DAYS
  ======================================================= */

  const allDays =
    Array.isArray(
      formation.formationDays
    )
      ? formation.formationDays
      : [];

  /* =======================================================
     SELECTED CITY
     
     If URL:
     
     ?city=Paris
     
     only Paris sessions are displayed.
  ======================================================= */

  const selectedCity =
    city?.trim() ||
    allDays[0]?.city ||
    "";

  /* =======================================================
     CITY DAYS
  ======================================================= */

  const cityDays =
  useMemo(() => {
    if (!selectedCity) {
      return allDays;
    }

    return allDays.filter(
      (day) =>
        day.city
          ?.trim()
          .toLowerCase() ===
        selectedCity
          .trim()
          .toLowerCase()
    );
  }, [
    allDays,
    selectedCity,
  ]);
    

  /* =======================================================
     IMAGE
  ======================================================= */

  const image =
    formation.image
      ? getStorageUrl(
          formation.image
        )
      : null;

  /* =======================================================
     PROGRAMME
  ======================================================= */

  const programme =
    formation.programme;

  const duration =
    programme?.duration ??
    "3 jours";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="bg-ivory">

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="wrap py-20 lg:py-32">

        <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-20">

          {/* IMAGE */}

          <Reveal>
            {image ? (
              <ImageReveal
                src={image}
                alt={formation.title}
                className="aspect-[4/5] w-full"
              />
            ) : (
              <div className="aspect-[4/5] w-full bg-ink/5" />
            )}
          </Reveal>

          {/* CONTENT */}

          <Reveal delay={0.1}>

            <p className="label text-ink/40">
              Formation
            </p>

            <h1 className="display mt-5 text-[clamp(3rem,7vw,6rem)] leading-[.92]">
              {formation.title}
            </h1>

            {programme?.name && (
              <p className="mt-6 font-serif text-xl text-ink/60">
                {programme.name}
              </p>
            )}

            {selectedCity && (
              <p className="mt-3 font-serif text-2xl">
                {selectedCity}
              </p>
            )}

            {formation.description && (
              <div
                className="prose prose-sm mt-8 max-w-xl text-ink/60"
                dangerouslySetInnerHTML={{
                  __html:
                    formation.description,
                }}
              />
            )}

            <div className="mt-10 flex flex-wrap gap-3">

              <Button
                type="button"
                variant="dark"
                icon="arrow"
                onClick={
                  scrollToReservation
                }
              >
                Réserver
              </Button>

              <Link
                to="/formations"
                className="inline-flex items-center px-4 py-3 text-sm underline underline-offset-8"
              >
                ← Toutes les formations
              </Link>

            </div>

          </Reveal>
        </div>
      </section>

      {/* ===================================================
          FORMATION INFO
      =================================================== */}

      <section className="border-y border-ink/10 bg-white">
        <div className="wrap py-16 lg:py-24">

          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">

            <InfoItem
              label="Durée"
              value={duration}
            />

            <InfoItem
              label="Ville"
              value={
                selectedCity ||
                "Toutes les villes"
              }
            />

            <InfoItem
              label="Acompte"
              value={formatPrice(
                formation.deposit_amount ??
                  150
              )}
            />

            <InfoItem
              label="Places"
              value={
                cityDays.length > 0
                  ? `${cityDays[0].remaining_places} restantes`
                  : "Voir les sessions"
              }
            />

          </div>

        </div>
      </section>

      {/* ===================================================
          PROGRAMME
      =================================================== */}

      <section className="wrap py-24 lg:py-36">

        <Reveal>

          <p className="label text-ink/40">
            Programme
          </p>

          <h2 className="display mt-5 max-w-4xl text-[clamp(3rem,6vw,5rem)]">
            Ce que vous allez apprendre
          </h2>

        </Reveal>

        {formation.steps &&
        formation.steps.length > 0 ? (

          <div className="mt-16 border-t border-ink/10">

            {formation.steps.map(
              (step, index) => (
                <div
                  key={index}
                  className="grid gap-5 border-b border-ink/10 py-8 md:grid-cols-[100px_1fr]"
                >

                  <span className="font-serif text-xl text-ink/40">
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>

                  <div>

                    <h3 className="font-serif text-2xl">
                      {step.title}
                    </h3>

                    {step.description && (
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/55">
                        {
                          step.description
                        }
                      </p>
                    )}

                  </div>

                </div>
              )
            )}

          </div>

        ) : (

          <p className="mt-10 text-sm text-ink/50">
            Programme disponible
            prochainement.
          </p>

        )}

      </section>

      {/* ===================================================
          SESSIONS
      =================================================== */}

      <section className="bg-white py-24 lg:py-36">

        <div className="wrap">

          <Reveal>

            <p className="label text-ink/40">
              Sessions disponibles
            </p>

            <h2 className="display mt-5 text-[clamp(3rem,6vw,5rem)]">
              {selectedCity}
            </h2>

          </Reveal>

          {cityDays.length === 0 ? (

            <div className="mt-14 border border-ink/10 p-8">
              <p className="text-sm text-ink/50">
                Aucune session disponible
                pour cette ville.
              </p>
            </div>

          ) : (

            <div className="mt-14 space-y-0 border-t border-ink/10">

              {cityDays.map(
                (
                  day: FormationDay,
                  index
                ) => {

                  const available =
                    day.status ===
                      "available" &&
                    day.remaining_places >
                      0;

                  const price =
                    day.personal_price ??
                    formation.personal_price;

                  const cpfPrice =
                    day.cpf_eligible
                      ? day.cpf_price
                      : null;

                  return (
                    <div
                      key={day.id}
                      className="grid gap-8 border-b border-ink/10 py-10 lg:grid-cols-[1fr_auto]"
                    >

                      <div>

                        <div className="flex items-start gap-6">

                          <span className="font-serif text-xl text-ink/30">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <div>

                            <h3 className="font-serif text-2xl lg:text-3xl">
                              {
                                day.city
                              }
                            </h3>

                            <p className="mt-2 text-lg text-ink/65">
                              {formatDateRange(
                                day.start_date,
                                day.end_date
                              )}
                            </p>

                            <p className="mt-3 text-sm text-ink/45">
                              {day.remaining_places >
                              0
                                ? `${day.remaining_places} places restantes`
                                : "Complet"}
                            </p>

                          </div>

                        </div>

                      </div>

                      <div className="flex flex-col justify-center gap-4 lg:min-w-[220px] lg:items-end">

                        <div className="text-left lg:text-right">

                          <p className="font-serif text-2xl">
                            {formatPrice(
                              price
                            )}
                          </p>

                          {cpfPrice && (
                            <p className="mt-1 text-xs text-ink/45">
                              CPF{" "}
                              {formatPrice(
                                cpfPrice
                              )}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-ink/45">
                            Acompte{" "}
                            {formatPrice(
                              formation.deposit_amount ??
                                150
                            )}
                          </p>

                        </div>

                        <Button
                          type="button"
                          variant={
                            available
                              ? "dark"
                              : "outline-dark"
                          }
                          icon="arrow"
                          onClick={
                            available
                              ? () =>
                                  scrollToReservation()
                              : undefined
                          }
                        >
                          {available
                            ? "Réserver"
                            : "Demander une date"}
                        </Button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>
      </section>

      {/* ===================================================
          RESERVATION
      =================================================== */}

      <section
        id="reservation"
        className="scroll-mt-20 bg-ink py-24 text-ivory lg:py-36"
      >

        <div className="wrap">

          <div className="grid gap-16 lg:grid-cols-[.8fr_1.2fr]">

            <Reveal>

              <p className="label text-ivory/40">
                Réservation
              </p>

              <h2 className="display mt-5 text-[clamp(3rem,6vw,5rem)]">
                Réservez votre
                formation
              </h2>

              <p className="mt-8 max-w-md text-sm leading-relaxed text-ivory/55">
                Choisissez votre session
                et envoyez votre demande
                de réservation.
              </p>

            </Reveal>

            <Reveal delay={0.1}>

              <ReservationForm
                formation={formation}
                formationDays={cityDays}
                selectedCity={
                  selectedCity
                }
              />

            </Reveal>

          </div>

        </div>

      </section>

    </main>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-ink/10 px-0 py-6 sm:px-6 lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0">

      <p className="label text-ink/40">
        {label}
      </p>

      <p className="mt-3 font-serif text-xl">
        {value}
      </p>

    </div>
  );
}

export default FormationDetailPage;