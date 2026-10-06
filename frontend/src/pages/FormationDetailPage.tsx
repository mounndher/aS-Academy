import { Link, useParams, useSearchParams } from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";

import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

import { ReservationForm } from "@/components/booking/ReservationForm";

import {
  getStorageUrl,
} from "@/services/api";

import type {
  FormationDay,
} from "@/types/formation";

/* =========================================================
   DATE
========================================================= */

function formatSessionDate(
  start: string,
  end: string
): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startDay = startDate.toLocaleDateString(
    "fr-FR",
    {
      day: "numeric",
    }
  );

  const endDay = endDate.toLocaleDateString(
    "fr-FR",
    {
      day: "numeric",
    }
  );

  const startMonth =
    startDate.toLocaleDateString(
      "fr-FR",
      {
        month: "long",
      }
    );

  const endMonth =
    endDate.toLocaleDateString(
      "fr-FR",
      {
        month: "long",
      }
    );

  const startYear =
    startDate.getFullYear();

  const endYear =
    endDate.getFullYear();

  if (
    startDay === endDay &&
    startMonth === endMonth &&
    startYear === endYear
  ) {
    return `${startDay} ${startMonth}`;
  }

  if (
    startMonth === endMonth &&
    startYear === endYear
  ) {
    return `${startDay} — ${endDay} ${startMonth}`;
  }

  return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
}

/* =========================================================
   PRICE
========================================================= */

function formatPrice(
  price: number | string | null | undefined
): string {
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
   MAIN PAGE
========================================================= */

export function FormationDetailPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const [searchParams] =
    useSearchParams();

  const selectedCity =
    searchParams.get("city");

  const selectedDayId =
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
        <div className="mx-auto max-w-6xl">
          <p className="label text-ink/40">
            CHARGEMENT...
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
        <div className="mx-auto max-w-6xl">
          <p className="label text-ink/40">
            FORMATION
          </p>

          <h1 className="display mt-6 text-5xl">
            Formation introuvable
          </h1>

          <Link
            to="/formations"
            className="mt-8 inline-flex text-sm uppercase tracking-[0.2em] underline"
          >
            ← Toutes les formations
          </Link>
        </div>
      </main>
    );
  }

  /* =======================================================
     SESSIONS
  ======================================================= */

  const allSessions: FormationDay[] =
    Array.isArray(
      formation.formationDays
    )
      ? formation.formationDays
      : [];

  /*
   * IMPORTANT:
   *
   * If city exists in URL:
   *
   * ?city=Paris
   *
   * only Paris sessions are displayed.
   *
   * If city doesn't exist:
   * all sessions are displayed.
   */

  const sessions =
    selectedCity
      ? allSessions.filter(
          (session) =>
            session.city
              .trim()
              .toLowerCase() ===
            selectedCity
              .trim()
              .toLowerCase()
        )
      : allSessions;

  /*
   * Selected session:
   *
   * If ?day=5 exists and that day belongs
   * to the selected city, use it.
   *
   * Otherwise use first session.
   */

  const selectedSession =
    sessions.find(
      (session) =>
        String(session.id) ===
        String(selectedDayId)
    ) ??
    sessions[0] ??
    null;

  /* =======================================================
     IMAGE
  ======================================================= */

  /*
   * Detail image:
   *
   * 1. selected session image
   * 2. first session image
   * 3. formation image
   */

  const sessionImage =
    selectedSession?.image ??
    sessions.find(
      (session) => session.image
    )?.image ??
    null;

  const imagePath =
    sessionImage ??
    formation.image;

  const imageUrl =
    getStorageUrl(imagePath);

  /* =======================================================
     PROGRAMME
  ======================================================= */

  const programme =
    Array.isArray(formation.steps)
      ? formation.steps
      : [];

  /* =======================================================
     DURATION
  ======================================================= */

  const duration =
    formation.programme?.duration ??
    "3 jours";

  /*
   * Keep only the day count.
   *
   * Example:
   *
   * "3 jours consécutifs"
   *
   * becomes:
   *
   * "3 jours"
   */

  const shortDuration =
    duration
      .replace(
        /consécutifs?/gi,
        ""
      )
      .trim();

  /* =======================================================
     SELECTED DATE
  ======================================================= */

  const selectedDate =
    selectedSession
      ? formatSessionDate(
          selectedSession.start_date,
          selectedSession.end_date
        )
      : null;

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="bg-ivory text-ink">

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16">

        <Link
          to="/formations"
          className="label text-ink/40 transition-opacity hover:opacity-60"
        >
          ← Toutes les formations
        </Link>

        <div className="mt-14 grid gap-16 lg:grid-cols-2 lg:items-start">

          {/* IMAGE */}

          <Reveal>
            <div className="overflow-hidden">
              {imageUrl ? (
                <ImageReveal
                  src={imageUrl}
                  alt={
                    formation.title
                  }
                  className="aspect-[4/5] w-full"
                />
              ) : (
                <div className="aspect-[4/5] w-full bg-ink/5" />
              )}
            </div>
          </Reveal>

          {/* CONTENT */}

          <Reveal delay={0.1}>

            <div className="label text-ink/40">
              {formation.programme?.name ??
                formation.title}

              {" · "}

              {shortDuration}
            </div>

            {/* CITY */}

            <h1 className="display mt-5 text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.9]">
              {selectedSession?.city ??
                selectedCity ??
                formation.title}
            </h1>

            {/* DATE */}

            {selectedDate && (
              <p className="mt-5 font-serif text-2xl text-ink/70">
                {selectedDate}
              </p>
            )}

            {/* DESCRIPTION */}

            {formation.description && (
              <div
                className="mt-7 max-w-xl text-base font-light leading-relaxed text-ink/65"
                dangerouslySetInnerHTML={{
                  __html:
                    formation.description,
                }}
              />
            )}

            {/* INFORMATION */}

            {selectedSession && (
              <div className="mt-10 border-t border-ink/10">

                {/* DURATION */}

                <div className="flex items-center justify-between border-b border-ink/10 py-5">
                  <span className="label text-ink/40">
                    Durée
                  </span>

                  <span className="font-serif text-lg">
                    {shortDuration}
                  </span>
                </div>

                {/* DATES */}

                <div className="flex items-center justify-between border-b border-ink/10 py-5">
                  <span className="label text-ink/40">
                    Dates
                  </span>

                  <span className="font-serif text-lg">
                    {selectedDate}
                  </span>
                </div>

                {/* CITY */}

                <div className="flex items-center justify-between border-b border-ink/10 py-5">
                  <span className="label text-ink/40">
                    Ville
                  </span>

                  <span className="font-serif text-lg">
                    {selectedSession.city}
                  </span>
                </div>

                {/* PRICE */}

                <div className="flex items-center justify-between border-b border-ink/10 py-5">
                  <span className="label text-ink/40">
                    Financement personnel
                  </span>

                  <span className="font-serif text-lg">
                    {formatPrice(
                      selectedSession.personal_price
                    )}
                  </span>
                </div>

                {/* CPF */}

                {selectedSession.cpf_eligible &&
                  selectedSession.cpf_price && (
                    <div className="flex items-center justify-between border-b border-ink/10 py-5">
                      <span className="label text-ink/40">
                        Financement CPF
                      </span>

                      <span className="font-serif text-lg">
                        {formatPrice(
                          selectedSession.cpf_price
                        )}
                      </span>
                    </div>
                  )}

                {/* DEPOSIT */}

                <div className="flex items-center justify-between border-b border-ink/10 py-5">
                  <span className="label text-ink/40">
                    Acompte
                  </span>

                  <span className="font-serif text-lg">
                    {formatPrice(
                      formation.deposit_amount
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* =================================================
                PROGRAMME
            ================================================= */}

            <div className="mt-10">

              <p className="label text-ink/40">
                Programme
              </p>

              {programme.length > 0 ? (
                <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">

                  {programme.map(
                    (step, index) => (
                      <div
                        key={`${step.title}-${index}`}
                        className="flex gap-4 font-serif text-base"
                      >
                        <span className="label shrink-0 text-ink/35">
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </span>

                        <div>
                          <p>
                            {step.title}
                          </p>

                          {step.description && (
                            <p className="mt-1 text-sm font-light text-ink/50">
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
                <p className="mt-5 text-sm text-ink/50">
                  Programme disponible
                  prochainement.
                </p>
              )}

            </div>

            {/* =================================================
                PDF
            ================================================= */}

            {formation.pdf_program && (
              <a
                href={getStorageUrl(
                  formation.pdf_program
                )}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex text-xs uppercase tracking-[0.2em] underline underline-offset-4"
              >
                Voir le programme PDF
              </a>
            )}

            {/* =================================================
                RESERVE
            ================================================= */}

            {selectedSession && (
              <Button
                to="#reservation"
                className="mt-8"
                variant="dark"
                icon="arrow"
              >
                Réserver ma place
              </Button>
            )}

          </Reveal>
        </div>
      </section>

      {/* =====================================================
          SESSIONS DISPONIBLES
      ===================================================== */}

      <section className="border-t border-ink/10 py-24">

        <div className="mx-auto max-w-6xl px-6">

          <div className="mb-10">
            <p className="label text-ink/40">
              Sessions disponibles
            </p>

            <h2 className="display mt-4 text-5xl">
              {selectedCity
                ? selectedCity
                : "Toutes les sessions"}
            </h2>
          </div>

          {sessions.length === 0 ? (
            <div className="border-y border-ink/10 py-10">
              <p className="font-serif text-xl">
                Aucune session disponible
                pour cette ville.
              </p>

              <Link
                to={`/formations/${formation.slug}`}
                className="mt-4 inline-block text-sm underline"
              >
                Voir toutes les sessions
              </Link>
            </div>
          ) : (
            <div className="border-t border-ink/10">

              {sessions.map(
                (session) => {
                  const available =
                    session.remaining_places >
                      0 &&
                    session.status !==
                      "full";

                  const sessionDate =
                    formatSessionDate(
                      session.start_date,
                      session.end_date
                    );

                  return (
                    <div
                      key={session.id}
                      className="grid gap-5 border-b border-ink/10 py-7 md:grid-cols-[1fr_auto_auto]"
                    >

                      <div>
                        <h3 className="font-serif text-2xl">
                          {session.city}
                        </h3>

                        <p className="mt-2 text-sm text-ink/55">
                          {sessionDate}
                        </p>
                      </div>

                      <div className="flex items-center">
                        <div className="text-right">
                          <p className="font-serif text-xl">
                            {formatPrice(
                              session.personal_price
                            )}
                          </p>

                          <p className="mt-1 text-xs text-ink/50">
                            {session.remaining_places}{" "}
                            place
                            {session.remaining_places >
                            1
                              ? "s"
                              : ""}{" "}
                            restante
                            {session.remaining_places >
                            1
                              ? "s"
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">

                        {available ? (
                          <Link
                            to={`/formations/${formation.slug}?city=${encodeURIComponent(
                              session.city
                            )}&day=${session.id}#reservation`}
                            className="inline-flex bg-ink px-7 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition-opacity hover:opacity-80"
                          >
                            Réserver
                          </Link>
                        ) : (
                          <span className="text-xs uppercase tracking-[0.16em] text-ink/40">
                            Complet
                          </span>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>
      </section>

      {/* =====================================================
          RESERVATION
      ===================================================== */}

      {selectedSession && (
        <section
          id="reservation"
          className="border-t border-ink/10 py-24"
        >
          <div className="mx-auto max-w-6xl px-6">

            <ReservationForm
              formation={formation}
              formationDay={
                selectedSession
              }
            />

          </div>
        </section>
      )}

    </main>
  );
}

export default FormationDetailPage;