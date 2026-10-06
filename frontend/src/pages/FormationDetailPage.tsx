import { useMemo } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";

import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/* =========================================================
   TYPES
========================================================= */

interface FormationDay {
  id: number;
  formation_id: number;
  city: string;
  start_date: string;
  end_date: string;
  personal_price: number | string | null;
  cpf_eligible: boolean;
  cpf_price: number | string | null;
  max_places: number;
  remaining_places: number;
  status: string;
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDateRange(
  start: string,
  end: string
) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return `${start} — ${end}`;
  }

  const startDay =
    startDate.toLocaleDateString("fr-FR", {
      day: "numeric",
    });

  const endDay =
    endDate.toLocaleDateString("fr-FR", {
      day: "numeric",
    });

  const startMonth =
    startDate.toLocaleDateString("fr-FR", {
      month: "long",
    });

  const endMonth =
    endDate.toLocaleDateString("fr-FR", {
      month: "long",
    });

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

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return `${price} €`;
  }

  return `${numericPrice.toLocaleString(
    "fr-FR"
  )} €`;
}

/* =========================================================
   FORMATION DETAIL PAGE
========================================================= */

export function FormationDetailPage() {
  /* =======================================================
     IMPORTANT:
     ALL HOOKS MUST BE CALLED BEFORE ANY RETURN
  ======================================================= */

  const { slug } =
    useParams<{ slug: string }>();

  const [searchParams] =
    useSearchParams();

  const selectedCity =
    searchParams.get("city")?.trim() || "";

  const selectedDayId =
    searchParams.get("day");

  const {
    data: formation,
    loading,
    error,
  } = useFormation(slug);

  /* =======================================================
     ALL SESSIONS
  ======================================================= */

  const allSessions: FormationDay[] =
    useMemo(() => {
      if (
        !formation ||
        !Array.isArray(
          formation.formationDays
        )
      ) {
        return [];
      }

      return formation.formationDays;
    }, [formation]);

  /* =======================================================
     FILTER SESSIONS BY CITY
     
     Example:
     
     /formations/formation-extension-de-cils?city=Paris
     
     => ONLY Paris sessions
  ======================================================= */

  const sessions: FormationDay[] =
    useMemo(() => {
      if (!selectedCity) {
        return allSessions;
      }

      const normalizedCity =
        selectedCity.toLowerCase();

      return allSessions.filter(
        (day) =>
          day.city
            ?.trim()
            .toLowerCase() ===
          normalizedCity
      );
    }, [
      allSessions,
      selectedCity,
    ]);

  /* =======================================================
     SELECTED SESSION
  ======================================================= */

  const selectedSession =
    useMemo(() => {
      if (!selectedDayId) {
        return sessions[0] ?? null;
      }

      return (
        sessions.find(
          (day) =>
            String(day.id) ===
            String(selectedDayId)
        ) ??
        sessions[0] ??
        null
      );
    }, [
      sessions,
      selectedDayId,
    ]);

  /* =======================================================
     PROGRAMME
  ======================================================= */

  const programme =
    formation?.programme;

  const duration =
    programme?.duration ??
    "3 jours";

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory py-32">
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
      <main className="min-h-screen bg-ivory py-32">
        <div className="wrap">

          <p className="label text-ink/40">
            Formation
          </p>

          <h1 className="display mt-6 text-5xl lg:text-7xl">
            Formation introuvable
          </h1>

          <Link
            to="/formations"
            className="mt-10 inline-flex text-sm underline underline-offset-4"
          >
            ← Toutes les formations
          </Link>

        </div>
      </main>
    );
  }

  /* =======================================================
     RESERVATION URL
     
     We keep the city in the URL so the reservation
     page knows which city was selected.
  ======================================================= */

  const reservationUrl =
    selectedSession
      ? `/formations/${formation.slug}/reservation?city=${encodeURIComponent(
          selectedSession.city
        )}&day=${selectedSession.id}`
      : `/formations/${formation.slug}/reservation`;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="bg-ivory">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="py-20 lg:py-32">
        <div className="wrap">

          <Link
            to="/formations"
            className="label text-ink/40 transition-opacity hover:opacity-60"
          >
            ← Toutes les formations
          </Link>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">

            {/* =================================================
                IMAGE
            ================================================= */}

            <Reveal>
              {formation.image ? (
                <img
                  src={formation.image}
                  alt={formation.title}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="aspect-[4/3] w-full bg-ink/5" />
              )}
            </Reveal>

            {/* =================================================
                TITLE
            ================================================= */}

            <Reveal delay={0.1}>

              <p className="label text-ink/40">
                {programme?.name ??
                  "Formation"}
              </p>

              <h1 className="display mt-5 text-[clamp(3rem,7vw,6rem)] leading-[0.95]">
                {formation.title}
              </h1>

              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink/50">
                <span>
                  {duration}
                </span>

                {selectedSession && (
                  <span>
                    {selectedSession.city}
                  </span>
                )}
              </div>

            </Reveal>

          </div>
        </div>
      </section>

      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      {formation.description && (
        <section className="pb-20 lg:pb-28">
          <div className="wrap">

            <div
              className="max-w-3xl text-lg font-light leading-relaxed text-ink/70"
              dangerouslySetInnerHTML={{
                __html:
                  formation.description,
              }}
            />

          </div>
        </section>
      )}

      {/* =====================================================
          SESSIONS DISPONIBLES
      ===================================================== */}

      <section className="border-t border-ink/10 py-20 lg:py-28">
        <div className="wrap">

          <Reveal>

            <p className="label text-ink/40">
              Sessions disponibles
            </p>

            <h2 className="display mt-5 text-4xl lg:text-6xl">
              {selectedCity
                ? selectedCity
                : "Toutes les sessions"}
            </h2>

          </Reveal>

          <div className="mt-12 border-t border-ink/10">

            {sessions.length === 0 ? (
              <div className="py-10">
                <p className="text-sm text-ink/50">
                  Aucune session disponible
                  pour cette ville.
                </p>
              </div>
            ) : (
              sessions.map(
                (day) => (
                  <div
                    key={day.id}
                    className="border-b border-ink/10 py-7"
                  >

                    <div className="grid gap-6 md:grid-cols-[1fr_auto_auto] md:items-center">

                      {/* CITY + DATE */}

                      <div>

                        <p className="font-serif text-2xl">
                          {day.city}
                        </p>

                        <p className="mt-2 text-sm text-ink/60">
                          {formatDateRange(
                            day.start_date,
                            day.end_date
                          )}
                        </p>

                      </div>

                      {/* PLACES */}

                      <div className="md:text-right">

                        <p className="text-sm text-ink/50">
                          {day.remaining_places}{" "}
                          {day.remaining_places ===
                          1
                            ? "place restante"
                            : "places restantes"}
                        </p>

                      </div>

                      {/* PRICE */}

                      <div className="md:text-right">

                        <p className="font-serif text-xl">
                          {formatPrice(
                            day.personal_price
                          )}
                        </p>

                        {day.cpf_eligible &&
                          day.cpf_price && (
                            <p className="mt-1 text-xs text-ink/40">
                              CPF{" "}
                              {formatPrice(
                                day.cpf_price
                              )}
                            </p>
                          )}

                      </div>

                    </div>

                  </div>
                )
              )
            )}

          </div>

        </div>
      </section>

      {/* =====================================================
          PROGRAMME
      ===================================================== */}

      <section className="border-t border-ink/10 py-20 lg:py-32">
        <div className="wrap">

          <div className="grid gap-12 lg:grid-cols-[0.35fr_0.65fr]">

            {/* LEFT */}

            <Reveal>

              <p className="label text-ink/40">
                Programme
              </p>

              <h2 className="display mt-5 text-4xl lg:text-5xl">
                Le programme
              </h2>

            </Reveal>

            {/* RIGHT */}

            <Reveal delay={0.1}>

              {formation.steps &&
              formation.steps.length > 0 ? (
                <div className="border-t border-ink/10">

                  {formation.steps.map(
                    (
                      step,
                      index
                    ) => (
                      <div
                        key={`${index}-${step.title}`}
                        className="border-b border-ink/10 py-7"
                      >

                        <div className="grid gap-5 md:grid-cols-[60px_1fr]">

                          <span className="font-serif text-lg text-ink/40">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <div>

                            <h3 className="font-serif text-2xl">
                              {step.title}
                            </h3>

                            {step.description && (
                              <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-ink/60">
                                {
                                  step.description
                                }
                              </p>
                            )}

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <p className="text-sm text-ink/50">
                  Le programme sera communiqué
                  prochainement.
                </p>
              )}

            </Reveal>

          </div>

        </div>
      </section>

      {/* =====================================================
          RESERVATION
      ===================================================== */}

      <section
        id="reservation"
        className="border-t border-ink/10 bg-ink py-20 text-ivory lg:py-32"
      >
        <div className="wrap">

          <div className="grid gap-12 lg:grid-cols-[0.5fr_0.5fr]">

            <Reveal>

              <p className="label text-ivory/40">
                Réservation
              </p>

              <h2 className="display mt-5 text-4xl lg:text-6xl">
                Réserver votre formation
              </h2>

              {selectedSession && (
                <div className="mt-8">

                  <p className="font-serif text-2xl">
                    {selectedSession.city}
                  </p>

                  <p className="mt-2 text-sm text-ivory/50">
                    {formatDateRange(
                      selectedSession.start_date,
                      selectedSession.end_date
                    )}
                  </p>

                </div>
              )}

            </Reveal>

            <Reveal delay={0.1}>

              {selectedSession ? (
                <div className="border border-ivory/10 p-8">

                  <div className="grid grid-cols-2 gap-6">

                    <div>
                      <p className="label text-[10px] text-ivory/40">
                        Tarif
                      </p>

                      <p className="mt-2 font-serif text-2xl">
                        {formatPrice(
                          selectedSession.personal_price
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="label text-[10px] text-ivory/40">
                        Acompte
                      </p>

                      <p className="mt-2 font-serif text-2xl">
                        {formatPrice(
                          formation.deposit_amount
                        )}
                      </p>
                    </div>

                  </div>

                  <Button
                    to={reservationUrl}
                    variant="light"
                    icon="arrow"
                    className="mt-8 w-full justify-center"
                  >
                    Réserver
                  </Button>

                </div>
              ) : (
                <p className="text-sm text-ivory/50">
                  Sélectionnez une session pour
                  continuer votre réservation.
                </p>
              )}

            </Reveal>

          </div>

        </div>
      </section>

    </main>
  );
}

export default FormationDetailPage;