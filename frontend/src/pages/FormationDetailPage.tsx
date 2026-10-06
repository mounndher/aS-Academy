import { useMemo } from "react";
import {
  Link,
  useLocation,
  useParams,
} from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";

import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

import type {
  FormationDay,
} from "@/types/formation";

import {
  Meta,
  RESERVE_STATE,
} from "@/components/sections/FormationCard";

/* =========================================================
   DATE
========================================================= */

function formatDateRange(
  start: string,
  end: string
) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startDay =
    startDate.toLocaleDateString(
      "fr-FR",
      { day: "2-digit" }
    );

  const endDay =
    endDate.toLocaleDateString(
      "fr-FR",
      { day: "2-digit" }
    );

  const startMonth =
    startDate.toLocaleDateString(
      "fr-FR",
      { month: "long" }
    );

  const endMonth =
    endDate.toLocaleDateString(
      "fr-FR",
      { month: "long" }
    );

  const startYear =
    startDate.getFullYear();

  const endYear =
    endDate.getFullYear();

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
  price: number | string | null
) {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "À venir";
  }

  return `${Number(price).toLocaleString(
    "fr-FR"
  )} €`;
}

/* =========================================================
   PAGE
========================================================= */

export function FormationDetailPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const location =
    useLocation();

  const {
    data: formation,
    loading,
    error,
  } = useFormation(slug);

  /* =======================================================
     URL PARAMETERS
  ======================================================= */

  const searchParams =
    new URLSearchParams(
      location.search
    );

  const cityParam =
    searchParams.get("city");

  const dayParam =
    searchParams.get("day");

  /* =======================================================
     FILTER DAYS
  ======================================================= */

  const selectedDays =
    useMemo(() => {
      if (!formation) {
        return [];
      }

      const days =
        Array.isArray(
          formation.formationDays
        )
          ? formation.formationDays
          : [];

      /*
       * No city selected:
       * display all sessions.
       */

      if (!cityParam) {
        return days;
      }

      /*
       * City selected:
       * display ONLY that city.
       */

      return days.filter(
        (day) =>
          day.city
            .trim()
            .toLowerCase() ===
          cityParam
            .trim()
            .toLowerCase()
      );
    }, [
      formation,
      cityParam,
    ]);

  /* =======================================================
     SELECTED DAY
  ======================================================= */

  const selectedDay =
    useMemo(() => {
      if (!selectedDays.length) {
        return null;
      }

      /*
       * If ?day= exists,
       * use the exact session.
       */

      if (dayParam) {
        const dayId =
          Number(dayParam);

        const found =
          selectedDays.find(
            (day) =>
              day.id === dayId
          );

        if (found) {
          return found;
        }
      }

      /*
       * Otherwise use first
       * session of the city.
       */

      return selectedDays[0];
    }, [
      selectedDays,
      dayParam,
    ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="bg-white py-32">
        <div className="wrap">
          <p className="text-sm text-ink/50">
            Chargement de la formation...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !formation) {
    return (
      <main className="bg-white py-32">
        <div className="wrap">
          <p className="text-red-500">
            {error ??
              "Formation introuvable."}
          </p>

          <div className="mt-8">
            <Button
              to="/formations"
              variant="dark"
              icon="arrow"
            >
              Retour aux formations
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const programme =
    formation.programme;

  const duration =
    programme?.duration ??
    "3 jours";

  /* =======================================================
     IMAGE
  ======================================================= */

  const image =
    selectedDay?.image ??
    formation.image;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="bg-white">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="py-20 lg:py-32">
        <div className="wrap">

          {/* BACK */}

          <Link
            to="/formations"
            className="label text-ink/40 transition-opacity hover:opacity-60"
          >
            ← Toutes les formations
          </Link>

          <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:items-start">

            {/* IMAGE */}

            <Reveal>
              {image ? (
                <ImageReveal
                  src={image}
                  alt={formation.title}
                  className="aspect-[4/3] w-full"
                />
              ) : (
                <div className="aspect-[4/3] w-full bg-ink/5" />
              )}
            </Reveal>

            {/* CONTENT */}

            <div>

              <p className="label text-ink/40">
                {programme?.name ??
                  formation.title}
                {" · "}
                {duration}
              </p>

              <h1 className="display mt-5 text-[clamp(3rem,7vw,6rem)]">
                {formation.title}
              </h1>

              {cityParam && (
                <p className="mt-5 font-serif text-2xl text-ink/60">
                  {cityParam}
                </p>
              )}

              {formation.description && (
                <div
                  className="mt-8 max-w-xl text-base font-light leading-relaxed text-ink/60"
                  dangerouslySetInnerHTML={{
                    __html:
                      formation.description,
                  }}
                />
              )}

            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          SESSIONS
      ================================================= */}

      <section className="border-t border-ink/10 py-20 lg:py-32">
        <div className="wrap">

          <div className="flex flex-col gap-3 border-b border-ink/10 pb-5 sm:flex-row sm:items-end sm:justify-between">

            <p className="label text-ink/40">
              Sessions disponibles
            </p>

            {cityParam && (
              <p className="font-serif text-xl">
                {cityParam}
              </p>
            )}

          </div>

          {selectedDays.length === 0 ? (
            <div className="mt-14 border border-ink/10 p-8">
              <p className="text-sm text-ink/50">
                Aucune session disponible
                pour cette ville.
              </p>
            </div>
          ) : (
            <div className="mt-14 space-y-12">

              {selectedDays.map(
                (day) => {
                  const isAvailable =
                    day.status ===
                      "available" &&
                    day.remaining_places >
                      0;

                  const reservationUrl =
                    `/formations/${formation.slug}?city=${encodeURIComponent(
                      day.city
                    )}&day=${day.id}#reservation`;

                  return (
                    <article
                      key={day.id}
                      className="border-b border-ink/10 pb-12"
                    >

                      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">

                        <div>

                          <p className="label text-ink/40">
                            {day.city}
                          </p>

                          <h2 className="mt-3 font-serif text-3xl">
                            {formatDateRange(
                              day.start_date,
                              day.end_date
                            )}
                          </h2>

                          <dl className="mt-7 grid grid-cols-2 sm:grid-cols-3">

                            <Meta
                              label="Durée"
                              value={
                                duration
                              }
                            />

                            <Meta
                              label="Tarif"
                              value={formatPrice(
                                day.personal_price
                              )}
                              sub={
                                day.cpf_eligible &&
                                day.cpf_price
                                  ? `CPF ${formatPrice(
                                      day.cpf_price
                                    )}`
                                  : undefined
                              }
                            />

                            <Meta
                              label="Places"
                              value={
                                day.remaining_places
                              }
                              sub={`sur ${day.max_places}`}
                            />

                          </dl>

                        </div>

                        <Button
                          to={reservationUrl}
                          state={{
                            ...RESERVE_STATE,
                            formationDayId:
                              day.id,
                          }}
                          variant={
                            isAvailable
                              ? "dark"
                              : "outline-dark"
                          }
                          icon="arrow"
                        >
                          {isAvailable
                            ? "Réserver"
                            : "Demander une date"}
                        </Button>

                      </div>
                    </article>
                  );
                }
              )}

            </div>
          )}
        </div>
      </section>

      {/* =================================================
          RESERVATION
      ================================================= */}

      <section
        id="reservation"
        className="scroll-mt-20 border-t border-ink/10 bg-ink py-24 text-ivory lg:py-40"
      >
        <div className="wrap">

          <p className="label text-ivory/40">
            Réservation
          </p>

          <h2 className="display mt-5 text-[clamp(3rem,7vw,6rem)]">
            Réserver votre formation
          </h2>

          {selectedDay && (
            <div className="mt-10 max-w-xl">

              <p className="font-serif text-2xl">
                {selectedDay.city}
              </p>

              <p className="mt-2 text-ivory/60">
                {formatDateRange(
                  selectedDay.start_date,
                  selectedDay.end_date
                )}
              </p>

            </div>
          )}

          {/*
            IMPORTANT:
            Keep your existing Reservation component here.
            
            Example:

            <Reservation
              formation={formation}
              formationDay={selectedDay}
            />
          */}

        </div>
      </section>

    </main>
  );
}

export default FormationDetailPage;