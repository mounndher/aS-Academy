import { useMemo } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";
import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";
import { ReservationForm } from "@/components/booking/ReservationForm";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date: string) {
  if (!date) return "";

  const parts = date.split("-");

  if (parts.length !== 3) {
    return new Date(date).toLocaleDateString("fr-FR");
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatShortDate(date: string) {
  if (!date) return "";

  const parts = date.split("-");

  if (parts.length !== 3) {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day));
}

function formatDateRange(start: string, end: string) {
  if (!start) return "";

  if (!end || start === end) {
    return formatShortDate(start);
  }

  const startParts = start.split("-");
  const endParts = end.split("-");

  if (startParts.length === 3 && endParts.length === 3) {
    const startYear = Number(startParts[0]);
    const startMonth = Number(startParts[1]);
    const startDay = Number(startParts[2]);

    const endYear = Number(endParts[0]);
    const endMonth = Number(endParts[1]);
    const endDay = Number(endParts[2]);

    const startDate = new Date(
      startYear,
      startMonth - 1,
      startDay
    );

    const endDate = new Date(
      endYear,
      endMonth - 1,
      endDay
    );

    const startMonthName = new Intl.DateTimeFormat("fr-FR", {
      month: "long",
    }).format(startDate);

    const endMonthName = new Intl.DateTimeFormat("fr-FR", {
      month: "long",
    }).format(endDate);

    if (
      startMonth === endMonth &&
      startYear === endYear
    ) {
      return `${startDay} — ${endDay} ${endMonthName}`;
    }

    if (startYear === endYear) {
      return `${startDay} ${startMonthName} — ${endDay} ${endMonthName}`;
    }

    return `${startDay} ${startMonthName} ${startYear} — ${endDay} ${endMonthName} ${endYear}`;
  }

  return `${formatShortDate(start)} — ${formatShortDate(end)}`;
}

function formatPrice(
  price: number | string | null | undefined
) {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "À venir";
  }

  const number = Number(price);

  if (Number.isNaN(number)) {
    return `${price} €`;
  }

  return `${number.toLocaleString("fr-FR")} €`;
}

/* =========================================================
   PAGE
========================================================= */

export function FormationDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  /*
   * Example:
   *
   * /formations/formation-extension-de-cils?city=Paris
   *
   * selectedCity = Paris
   */
  const selectedCity = searchParams.get("city");

  /*
   * Example:
   *
   * /formations/formation-extension-de-cils/reservation?day=123
   *
   * selectedDayId = 123
   */
  const selectedDayId = searchParams.get("day");

  const isReservationPage =
    window.location.pathname.includes("/reservation");

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
      <main className="min-h-screen bg-[#f8f7f4] px-6 py-32">
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
      <main className="min-h-screen bg-[#f8f7f4] px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <p className="label text-ink/40">
            Formation
          </p>

          <h1 className="display mt-5 text-5xl">
            Formation introuvable
          </h1>

          <Link
            to="/formations"
            className="mt-8 inline-block text-sm uppercase tracking-[0.18em]"
          >
            ← Toutes les formations
          </Link>
        </div>
      </main>
    );
  }

  /* =======================================================
     ALL SESSIONS
  ======================================================= */

  const allSessions = Array.isArray(
    formation.formationDays
  )
    ? formation.formationDays
    : [];

  /* =======================================================
     FILTER BY CITY
  ======================================================= */

  const sessions = useMemo(() => {
    if (!selectedCity) {
      return allSessions;
    }

    return allSessions.filter(
      (session) =>
        session.city?.trim().toLowerCase() ===
        selectedCity.trim().toLowerCase()
    );
  }, [allSessions, selectedCity]);

  /* =======================================================
     SELECTED SESSION
  ======================================================= */

  const selectedSession = useMemo(() => {
    if (!selectedDayId) {
      return null;
    }

    return (
      allSessions.find(
        (session) =>
          String(session.id) ===
          String(selectedDayId)
      ) ?? null
    );
  }, [allSessions, selectedDayId]);

  /* =======================================================
     RESERVATION PAGE
  ======================================================= */

  if (isReservationPage) {
    if (!selectedSession) {
      return (
        <main className="min-h-screen bg-[#f8f7f4] px-6 py-32">
          <div className="mx-auto max-w-7xl">
            <p className="label text-ink/40">
              Réservation
            </p>

            <h1 className="display mt-5 text-5xl">
              Session introuvable
            </h1>

            <Link
              to={`/formations/${formation.slug}`}
              className="mt-8 inline-block text-sm uppercase tracking-[0.18em]"
            >
              ← Retour à la formation
            </Link>
          </div>
        </main>
      );
    }

    return (
      <ReservationForm
        formation={formation}
        formationDay={selectedSession}
      />
    );
  }

  /* =======================================================
     DETAIL PAGE
  ======================================================= */

  const programme =
    formation.programme;

  const duration =
    programme?.duration || "3 jours";

  const firstSession =
    sessions.length > 0
      ? sessions[0]
      : null;

  return (
    <main className="bg-[#f8f7f4] text-ink">

      {/* ===================================================
          BACK
      =================================================== */}

      <section className="px-6 pt-20 md:px-10 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/formations"
            className="label text-ink/45 transition-opacity hover:opacity-60"
          >
            ← Toutes les formations
          </Link>
        </div>
      </section>

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="px-6 py-14 md:px-10 lg:px-20 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-20">

          {/* IMAGE */}

          <Reveal>
            <div className="overflow-hidden">
              {formation.image ? (
                <ImageReveal
                  src={formation.image}
                  alt={formation.title}
                  className="aspect-[4/5] w-full"
                />
              ) : (
                <div className="aspect-[4/5] w-full bg-ink/5" />
              )}
            </div>
          </Reveal>

          {/* CONTENT */}

          <Reveal delay={0.1}>
            <div className="flex h-full flex-col justify-center">

              {/* LABEL */}

              <p className="label text-ink/45">
                {programme?.name || formation.title}
                {" · "}
                {duration}
              </p>

              {/* CITY */}

              <h1 className="display mt-5 text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.9]">
                {selectedCity ||
                  firstSession?.city ||
                  formation.title}
              </h1>

              {/* FIRST SESSION DATE */}

              {firstSession && (
                <p className="mt-5 font-serif text-xl text-ink/70 md:text-2xl">
                  {formatDateRange(
                    firstSession.start_date,
                    firstSession.end_date
                  )}
                </p>
              )}

              {/* DESCRIPTION */}

              {formation.description && (
                <div
                  className="mt-7 max-w-xl text-base font-light leading-relaxed text-ink/65"
                  dangerouslySetInnerHTML={{
                    __html: formation.description,
                  }}
                />
              )}

              {/* =================================================
                  MAIN INFORMATION
              ================================================= */}

              <div className="mt-10 border-t border-ink/10">

                {/* DURATION */}

                <div className="flex items-center justify-between border-b border-ink/10 py-4">
                  <span className="label text-[10px] text-ink/45">
                    Durée
                  </span>

                  <span className="font-serif text-lg">
                    {duration}
                  </span>
                </div>

                {/* SELECTED / FIRST DATE */}

                {firstSession && (
                  <>
                    <div className="flex items-center justify-between border-b border-ink/10 py-4">
                      <span className="label text-[10px] text-ink/45">
                        Dates
                      </span>

                      <span className="font-serif text-lg text-right">
                        {formatDateRange(
                          firstSession.start_date,
                          firstSession.end_date
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-ink/10 py-4">
                      <span className="label text-[10px] text-ink/45">
                        Ville
                      </span>

                      <span className="font-serif text-lg">
                        {firstSession.city}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-ink/10 py-4">
                      <span className="label text-[10px] text-ink/45">
                        Financement personnel
                      </span>

                      <span className="font-serif text-lg">
                        {formatPrice(
                          firstSession.personal_price ??
                            formation.personal_price
                        )}
                      </span>
                    </div>

                    {firstSession.cpf_eligible && (
                      <div className="flex items-center justify-between border-b border-ink/10 py-4">
                        <span className="label text-[10px] text-ink/45">
                          Financement CPF
                        </span>

                        <span className="font-serif text-lg">
                          {formatPrice(
                            firstSession.cpf_price
                          )}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* DEPOSIT */}

                <div className="flex items-center justify-between border-b border-ink/10 py-4">
                  <span className="label text-[10px] text-ink/45">
                    Acompte
                  </span>

                  <span className="font-serif text-lg">
                    {formatPrice(
                      formation.deposit_amount
                    )}
                  </span>
                </div>
              </div>

              {/* =================================================
                  PROGRAM
              ================================================= */}

              <div className="mt-10">

                <p className="label text-ink/45">
                  Programme
                </p>

                {Array.isArray(
                  formation.steps
                ) &&
                formation.steps.length > 0 ? (
                  <div className="mt-5 grid gap-x-10 gap-y-5 sm:grid-cols-2">

                    {formation.steps.map(
                      (step, index) => (
                        <div
                          key={`${index}-${step.title}`}
                          className="grid grid-cols-[32px_1fr] gap-3"
                        >
                          <span className="label text-[10px] text-ink/40">
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </span>

                          <div>
                            <p className="font-serif text-base">
                              {step.title}
                            </p>

                            {step.description && (
                              <p className="mt-1 text-sm font-light leading-relaxed text-ink/55">
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
                  <p className="mt-4 text-sm text-ink/50">
                    Programme à venir.
                  </p>
                )}
              </div>

              {/* =================================================
                  PDF — OPTIONAL
              ================================================= */}

              {formation.pdf_program && (
                <a
                  href={formation.pdf_program}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block text-xs uppercase tracking-[0.18em] underline underline-offset-4"
                >
                  Télécharger le programme PDF
                </a>
              )}

              {/* =================================================
                  RESERVE
              ================================================= */}

              {firstSession && (
                <div className="mt-8">
                  <Button
                    to={`/formations/${formation.slug}/reservation?day=${firstSession.id}`}
                    variant="dark"
                    icon="arrow"
                  >
                    Réserver ma place
                  </Button>
                </div>
              )}

            </div>
          </Reveal>

        </div>
      </section>

      {/* =====================================================
          AVAILABLE SESSIONS
      ===================================================== */}

      <section className="border-t border-ink/10 px-6 py-20 md:px-10 lg:px-20">
        <div className="mx-auto max-w-7xl">

          <p className="label text-ink/45">
            Sessions disponibles
          </p>

          <h2 className="display mt-5 text-5xl md:text-6xl">
            {selectedCity ||
              (sessions.length > 0
                ? sessions[0].city
                : "Sessions")}
          </h2>

          {sessions.length === 0 ? (
            <div className="mt-10 border-t border-ink/10 py-10">
              <p className="text-ink/55">
                Aucune session disponible
                pour cette ville.
              </p>
            </div>
          ) : (
            <div className="mt-10 border-t border-ink/10">

              {sessions.map((day) => {
                const available =
                  day.remaining_places > 0 &&
                  day.status !== "full";

                return (
                  <div
                    key={day.id}
                    className="grid gap-6 border-b border-ink/10 py-8 md:grid-cols-[1fr_auto_auto] md:items-center"
                  >

                    {/* SESSION */}

                    <div>
                      <h3 className="font-serif text-2xl">
                        {day.city}
                      </h3>

                      <p className="mt-2 text-sm text-ink/55">
                        {formatDateRange(
                          day.start_date,
                          day.end_date
                        )}
                      </p>

                      <p className="mt-2 text-sm text-ink/45">
                        {day.remaining_places > 0
                          ? `${day.remaining_places} places restantes`
                          : "Complet"}
                      </p>
                    </div>

                    {/* PRICES */}

                    <div className="text-left md:text-right">

                      <p className="font-serif text-xl">
                        {formatPrice(
                          day.personal_price ??
                            formation.personal_price
                        )}
                      </p>

                      {day.cpf_eligible &&
                        day.cpf_price && (
                          <p className="mt-1 text-xs text-ink/45">
                            CPF{" "}
                            {formatPrice(
                              day.cpf_price
                            )}
                          </p>
                        )}

                      <p className="mt-1 text-xs text-ink/45">
                        Acompte{" "}
                        {formatPrice(
                          formation.deposit_amount
                        )}
                      </p>

                    </div>

                    {/* RESERVE */}

                    <div>
                      {available ? (
                        <Button
                          to={`/formations/${formation.slug}/reservation?day=${day.id}`}
                          variant="dark"
                        >
                          Réserver
                        </Button>
                      ) : (
                        <span className="inline-flex border border-ink/20 px-6 py-4 text-xs uppercase tracking-[0.18em] text-ink/40">
                          Complet
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>
      </section>

    </main>
  );
}

export default FormationDetailPage;