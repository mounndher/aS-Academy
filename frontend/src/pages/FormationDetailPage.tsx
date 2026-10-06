import { Link, useSearchParams } from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";

import { ReservationForm } from "@/components/booking/ReservationForm";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

import {
  formatDateRange,
  type FormationDay,
} from "@/components/sections/FormationCard";

/* =========================================================
   PAGE
========================================================= */

export function FormationDetailPage() {
  const [searchParams] = useSearchParams();

  const slug =
    window.location.pathname.split(
      "/formations/"
    )[1];

  const city =
    searchParams.get("city");

  const dayId =
    searchParams.get("day");

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
      <main className="min-h-screen bg-ivory px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <p className="label text-ink/40">
            Chargement...
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
      <main className="min-h-screen bg-ivory px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <p className="label text-ink/40">
            Formation
          </p>

          <h1 className="display mt-5 text-5xl">
            Formation introuvable
          </h1>

          <Link
            to="/formations"
            className="mt-8 inline-block text-sm underline"
          >
            ← Toutes les formations
          </Link>
        </div>
      </main>
    );
  }

  /* =======================================================
     ALL DAYS
  ======================================================= */

  const allDays =
    formation.formationDays ?? [];

  /*
   * IMPORTANT:
   *
   * If city = Paris:
   *
   * Paris 10-12 September
   * Paris 08-15 October
   *
   * Both are displayed.
   *
   * Toulouse / Bruxelles / Bordeaux
   * are hidden.
   */

  const citySessions = city
    ? allDays.filter(
        (day) =>
          day.city.trim().toLowerCase() ===
          city.trim().toLowerCase()
      )
    : allDays;

  /* =======================================================
     SELECTED DAY
  ======================================================= */

  let selectedDay: FormationDay | null =
    null;

  /*
   * First priority:
   * exact day from ?day=
   */

  if (dayId) {
    selectedDay =
      citySessions.find(
        (day) =>
          String(day.id) ===
          String(dayId)
      ) ?? null;
  }

  /*
   * If no exact day:
   * use first session for selected city.
   */

  if (!selectedDay) {
    selectedDay =
      citySessions[0] ?? null;
  }

  /* =======================================================
     IMAGE
  ======================================================= */

  const selectedImage =
    selectedDay?.image ||
    formation.image ||
    "";

  /* =======================================================
     PROGRAMME
  ======================================================= */

  const programme =
    formation.programme;

  const duration =
    programme?.duration ??
    "3 jours";

  /* =======================================================
     DATE
  ======================================================= */

  const selectedDate =
    selectedDay
      ? formatDateRange(
          selectedDay.start_date,
          selectedDay.end_date
        )
      : "";

  /* =======================================================
     PRICE
  ======================================================= */

  const personalPrice =
    selectedDay?.personal_price ??
    formation.personal_price;

  const cpfPrice =
    selectedDay?.cpf_price;

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="bg-ivory">

      {/* ===================================================
          HERO / DETAIL
      =================================================== */}

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-12 md:px-10 md:pt-20">

        {/* BACK */}

        <Link
          to="/formations"
          className="label flex items-center gap-3 text-ink/40 transition-opacity hover:opacity-60"
        >
          ←
          <span>
            Toutes les formations
          </span>
        </Link>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-20">

          {/* =================================================
              IMAGE
          ================================================= */}

          <div>
            {selectedImage ? (
              <ImageReveal
                src={selectedImage}
                alt={formation.title}
                className="aspect-[4/5] w-full"
              />
            ) : (
              <div className="aspect-[4/5] w-full bg-ink/5" />
            )}
          </div>

          {/* =================================================
              TEXT
          ================================================= */}

          <Reveal>
            <p className="label text-ink/40">
              {programme?.name ??
                formation.title}

              {" · "}

              {duration}
            </p>

            {/* CITY */}

            <h1 className="display mt-5 text-[clamp(3.5rem,7vw,6rem)] leading-[0.9]">
              {selectedDay?.city ??
                city ??
                "Formation"}
            </h1>

            {/* DATE */}

            {selectedDate && (
              <p className="mt-5 font-serif text-xl text-ink/70 md:text-2xl">
                {selectedDate}
              </p>
            )}

            {/* DESCRIPTION */}

            {formation.description && (
              <div
                className="mt-8 max-w-xl text-base font-light leading-relaxed text-ink/60"
                dangerouslySetInnerHTML={{
                  __html:
                    formation.description,
                }}
              />
            )}

            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="mt-10 border-t border-ink/10">

              <div className="flex items-center justify-between border-b border-ink/10 py-4">
                <span className="label text-[9px] text-ink/40">
                  Durée
                </span>

                <span className="font-serif">
                  {duration}
                </span>
              </div>

              {selectedDate && (
                <div className="flex items-center justify-between border-b border-ink/10 py-4">
                  <span className="label text-[9px] text-ink/40">
                    Dates
                  </span>

                  <span className="font-serif text-right">
                    {selectedDate}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-ink/10 py-4">
                <span className="label text-[9px] text-ink/40">
                  Ville
                </span>

                <span className="font-serif">
                  {selectedDay?.city ??
                    city ??
                    "—"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-ink/10 py-4">
                <span className="label text-[9px] text-ink/40">
                  Financement personnel
                </span>

                <span className="font-serif">
                  {personalPrice !== null &&
                  personalPrice !== undefined
                    ? `${Number(
                        personalPrice
                      ).toLocaleString(
                        "fr-FR"
                      )} €`
                    : "—"}
                </span>
              </div>

              {selectedDay?.cpf_eligible &&
                cpfPrice && (
                  <div className="flex items-center justify-between border-b border-ink/10 py-4">
                    <span className="label text-[9px] text-ink/40">
                      Financement CPF
                    </span>

                    <span className="font-serif">
                      {Number(
                        cpfPrice
                      ).toLocaleString(
                        "fr-FR"
                      )}{" "}
                      €
                    </span>
                  </div>
                )}

              <div className="flex items-center justify-between border-b border-ink/10 py-4">
                <span className="label text-[9px] text-ink/40">
                  Acompte
                </span>

                <span className="font-serif">
                  {formation.deposit_amount
                    ? `${Number(
                        formation.deposit_amount
                      ).toLocaleString(
                        "fr-FR"
                      )} €`
                    : "—"}
                </span>
              </div>
            </div>

            {/* =================================================
                PROGRAMME
            ================================================= */}

            {formation.steps?.length > 0 && (
              <div className="mt-10">
                <p className="label text-[9px] text-ink/40">
                  Programme
                </p>

                <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {formation.steps.map(
                    (step, index) => (
                      <div
                        key={`${step.title}-${index}`}
                        className="flex gap-4"
                      >
                        <span className="label text-[9px] text-ink/40">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <div>
                          <p className="font-serif text-sm">
                            {step.title}
                          </p>

                          {step.description && (
                            <p className="mt-1 text-xs text-ink/50">
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
              </div>
            )}

            {/* =================================================
                RESERVE BUTTON
            ================================================= */}

            {selectedDay && (
              <a
                href="#reservation"
                className="mt-9 inline-flex items-center gap-5 bg-ink px-7 py-4 text-[10px] font-medium uppercase tracking-[0.22em] text-ivory transition-opacity hover:opacity-80"
              >
                Réserver ma place
                <span>→</span>
              </a>
            )}
          </Reveal>
        </div>
      </section>

      {/* =====================================================
          SESSIONS DISPONIBLES
      ===================================================== */}

      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">

          <div className="max-w-xl">
            <p className="label text-ink/40">
              Sessions disponibles
            </p>

            <h2 className="display mt-5 text-[clamp(2.5rem,5vw,4.5rem)]">
              {city
                ? city
                : "Toutes les sessions"}
            </h2>
          </div>

          {/* =================================================
              SESSIONS
          ================================================= */}

          <div className="mt-12">

            {citySessions.length === 0 ? (
              <div className="border-y border-ink/10 py-10">
                <p className="text-sm text-ink/50">
                  Aucune session disponible
                  pour cette ville.
                </p>
              </div>
            ) : (
              citySessions.map(
                (day) => {
                  const isSelected =
                    selectedDay?.id ===
                    day.id;

                  const sessionUrl =
                    `/formations/${formation.slug}` +
                    `?city=${encodeURIComponent(
                      day.city
                    )}` +
                    `&day=${day.id}`;

                  return (
                    <Link
                      key={day.id}
                      to={
                        sessionUrl +
                        "#reservation"
                      }
                      className={`flex flex-col gap-5 border-b border-ink/10 py-7 transition-opacity hover:opacity-60 md:flex-row md:items-center md:justify-between ${
                        isSelected
                          ? "opacity-100"
                          : ""
                      }`}
                    >
                      {/* LEFT */}

                      <div>
                        <h3 className="font-serif text-2xl md:text-3xl">
                          {day.city}
                        </h3>

                        <p className="mt-2 text-sm text-ink/50">
                          {formatDateRange(
                            day.start_date,
                            day.end_date
                          )}
                        </p>
                      </div>

                      {/* RIGHT */}

                      <div className="flex items-center gap-10 md:text-right">

                        <div>
                          <p className="font-serif text-lg">
                            {day.personal_price !==
                              null &&
                            day.personal_price !==
                              undefined
                              ? `${Number(
                                  day.personal_price
                                ).toLocaleString(
                                  "fr-FR"
                                )} €`
                              : "À venir"}
                          </p>

                          <p className="mt-1 text-xs text-ink/50">
                            {
                              day.remaining_places
                            }{" "}
                            places restantes
                          </p>
                        </div>

                        <span className="label hidden text-[9px] text-ink/40 md:block">
                          {isSelected
                            ? "Sélectionnée"
                            : "Voir"}
                          {" →"}
                        </span>
                      </div>
                    </Link>
                  );
                }
              )
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          RESERVATION
      ===================================================== */}

      {selectedDay && (
        <ReservationForm
          formation={formation}
          formationDay={selectedDay}
        />
      )}

    </main>
  );
}

export default FormationDetailPage;