import { useEffect, useMemo } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";
import type {
  Formation,
  FormationDay,
} from "@/types/formation";

import { ReservationForm } from "@/components/booking/ReservationForm";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

/* =========================================================
   HELPERS
========================================================= */

function isValidDate(value: unknown): boolean {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

/* =========================================================
   DATE RANGE
========================================================= */

function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  if (
    !isValidDate(start) ||
    !isValidDate(end)
  ) {
    return "Dates à venir";
  }

  const startDate = new Date(start as string);
  const endDate = new Date(end as string);

  const startDay = startDate.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
    }
  );

  const endDay = endDate.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
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
    startMonth === endMonth &&
    startYear === endYear
  ) {
    return `${startDay} — ${endDay} ${startMonth}`;
  }

  if (startYear === endYear) {
    return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
  }

  return `${startDay} ${startMonth} ${startYear} — ${endDay} ${endMonth} ${endYear}`;
}

/* =========================================================
   SINGLE DATE
========================================================= */

function formatSingleDate(
  value: string | null | undefined
): string {
  if (!isValidDate(value)) {
    return "Date à venir";
  }

  return new Date(
    value as string
  ).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/* =========================================================
   PRICE
========================================================= */

function formatPrice(
  value: number | string | null | undefined
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "—";
  }

  return `${number.toLocaleString(
    "fr-FR"
  )} €`;
}

/* =========================================================
   DAYS
========================================================= */

function getDuration(
  formation: Formation
): string {
  return (
    formation.programme?.duration ||
    "3 jours"
  );
}

/* =========================================================
   VALID DAY
========================================================= */

function isUsableFormationDay(
  day: FormationDay
): boolean {
  return Boolean(
    day &&
      day.id &&
      day.city &&
      isValidDate(day.start_date) &&
      isValidDate(day.end_date)
  );
}

/* =========================================================
   META ROW
========================================================= */

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center border-t border-ink/10 py-4">
      <span className="label text-[10px] text-ink/40">
        {label}
      </span>

      <span className="text-right font-serif text-base text-ink/80 md:text-lg">
        {children}
      </span>
    </div>
  );
}

/* =========================================================
   PROGRAMME
========================================================= */

function Programme({
  formation,
}: {
  formation: Formation;
}) {
  if (
    !formation.steps ||
    formation.steps.length === 0
  ) {
    return null;
  }

  return (
    <div className="mt-12">
      <p className="label mb-6 text-[10px] text-ink/45">
        PROGRAMME
      </p>

      <div className="grid grid-cols-1 gap-x-12 gap-y-7 md:grid-cols-2">
        {formation.steps.map(
          (step, index) => (
            <div
              key={`${step.title}-${index}`}
              className="grid grid-cols-[28px_1fr] gap-3"
            >
              <span className="label text-[10px] text-ink/40">
                {String(index + 1).padStart(
                  2,
                  "0"
                )}
              </span>

              <div>
                <h3 className="font-serif text-lg text-ink">
                  {step.title}
                </h3>

                {step.description && (
                  <p className="mt-2 max-w-sm text-sm font-light leading-relaxed text-ink/50">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SESSIONS
========================================================= */

function Sessions({
  sessions,
  selectedDayId,
}: {
  sessions: FormationDay[];
  selectedDayId: number | null;
}) {
  if (sessions.length === 0) {
    return (
      <div className="border-t border-ink/10 py-10">
        <p className="font-serif text-xl text-ink/60">
          Aucune session disponible
          pour cette ville.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <p className="label text-[10px] text-ink/45">
        SESSIONS DISPONIBLES
      </p>

      <div className="mt-7 border-t border-ink/10">
        {sessions.map((day) => {
          const isSelected =
            day.id === selectedDayId;

          const personalPrice =
            formatPrice(
              day.personal_price
            );

          const cpfPrice =
            day.cpf_eligible
              ? formatPrice(day.cpf_price)
              : null;

          return (
            <div
              key={day.id}
              className={`grid grid-cols-1 gap-6 border-b border-ink/10 py-7 md:grid-cols-[1fr_auto] md:items-center ${
                isSelected
                  ? "bg-ink/[0.015]"
                  : ""
              }`}
            >
              {/* LEFT */}
              <div>
                <h3 className="font-serif text-xl text-ink md:text-2xl">
                  {day.city}
                </h3>

                <p className="mt-2 font-serif text-base text-ink/60">
                  {formatDateRange(
                    day.start_date,
                    day.end_date
                  )}
                </p>

                <p className="mt-2 text-xs font-light text-ink/45">
                  {day.remaining_places > 0
                    ? `${day.remaining_places} ${
                        day.remaining_places > 1
                          ? "places"
                          : "place"
                      } restante${
                        day.remaining_places > 1
                          ? "s"
                          : ""
                      }`
                    : "Complet"}
                </p>
              </div>

              {/* RIGHT */}
              <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-right md:min-w-[330px]">
                <div>
                  <p className="label text-[9px] text-ink/35">
                    FINANCEMENT PERSONNEL
                  </p>

                  <p className="mt-1 font-serif text-lg">
                    {personalPrice}
                  </p>
                </div>

                {cpfPrice && (
                  <div>
                    <p className="label text-[9px] text-ink/35">
                      CPF
                    </p>

                    <p className="mt-1 font-serif text-lg">
                      {cpfPrice}
                    </p>
                  </div>
                )}

                <div>
                  <p className="label text-[9px] text-ink/35">
                    ACCOMPTE
                  </p>

                  <p className="mt-1 font-serif text-lg">
                    {formatPrice(
                      undefined
                    )}
                  </p>
                </div>

                {isSelected && (
                  <div>
                    <p className="label text-[9px] text-ink/35">
                      SESSION
                    </p>

                    <p className="mt-1 text-xs text-ink/45">
                      Sélectionnée
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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

  const {
    data: formation,
    loading,
    error,
  } = useFormation(slug);

  /* =======================================================
     QUERY PARAMETERS

     Example:
     /formations/extension-de-cils?city=Paris&day=4
  ======================================================= */

  const requestedCity =
    searchParams.get("city");

  const requestedDayId =
    searchParams.get("day");

  /* =======================================================
     VALID SESSIONS
  ======================================================= */

  const validDays = useMemo(() => {
    if (!formation) {
      return [];
    }

    return Array.isArray(
      formation.formationDays
    )
      ? formation.formationDays.filter(
          isUsableFormationDay
        )
      : [];
  }, [formation]);

  /* =======================================================
     SELECTED DAY

     Priority:
     1. ?day=ID
     2. ?city=Paris
     3. first valid session
  ======================================================= */

  const selectedDay = useMemo(() => {
    if (validDays.length === 0) {
      return null;
    }

    if (requestedDayId) {
      const id = Number(
        requestedDayId
      );

      const foundById =
        validDays.find(
          (day) => day.id === id
        );

      if (foundById) {
        return foundById;
      }
    }

    if (requestedCity) {
      const normalizedCity =
        requestedCity
          .trim()
          .toLowerCase();

      const foundByCity =
        validDays.find(
          (day) =>
            day.city
              .trim()
              .toLowerCase() ===
            normalizedCity
        );

      if (foundByCity) {
        return foundByCity;
      }
    }

    return validDays[0] ?? null;
  }, [
    validDays,
    requestedDayId,
    requestedCity,
  ]);

  /* =======================================================
     CITY

     If user clicked Paris from the card,
     we keep Paris.
  ======================================================= */

  const activeCity =
    selectedDay?.city ||
    requestedCity ||
    validDays[0]?.city ||
    "";

  /* =======================================================
     SESSIONS FOR ACTIVE CITY ONLY
  ======================================================= */

  const citySessions = useMemo(() => {
    if (!activeCity) {
      return [];
    }

    const normalizedCity =
      activeCity
        .trim()
        .toLowerCase();

    return validDays.filter(
      (day) =>
        day.city
          .trim()
          .toLowerCase() ===
        normalizedCity
    );
  }, [
    validDays,
    activeCity,
  ]);

  /* =======================================================
     SCROLL TO RESERVATION

     Only after selectedDay exists.
  ======================================================= */

  useEffect(() => {
    if (
      loading ||
      !formation ||
      !selectedDay
    ) {
      return;
    }

    const hash =
      window.location.hash;

    if (hash.includes("reservation")) {
      window.setTimeout(() => {
        document
          .getElementById("reservation")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    }
  }, [
    loading,
    formation,
    selectedDay,
  ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <div className="min-h-[50vh] animate-pulse">
          <div className="h-4 w-32 bg-ink/5" />

          <div className="mt-10 grid gap-12 md:grid-cols-2">
            <div className="aspect-[4/5] bg-ink/5" />

            <div>
              <div className="h-4 w-40 bg-ink/5" />

              <div className="mt-6 h-20 w-3/4 bg-ink/5" />

              <div className="mt-6 h-5 w-1/2 bg-ink/5" />

              <div className="mt-10 space-y-3">
                <div className="h-4 w-full bg-ink/5" />
                <div className="h-4 w-full bg-ink/5" />
                <div className="h-4 w-2/3 bg-ink/5" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !formation) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <p className="label text-[10px] text-ink/40">
          FORMATION
        </p>

        <h1 className="display mt-5 text-[clamp(3rem,8vw,6rem)]">
          Formation introuvable
        </h1>

        <Link
          to="/formations"
          className="label mt-10 inline-flex text-ink/50 transition-opacity hover:opacity-60"
        >
          ← Toutes les formations
        </Link>
      </main>
    );
  }

  /* =======================================================
     VALUES
  ======================================================= */

  const duration =
    getDuration(formation);

  const image =
    selectedDay?.image ||
    formation.image ||
    null;

  const description =
    formation.description;

  const programmeName =
    formation.programme?.name ||
    formation.title;

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="bg-ivory text-ink">
      {/* ===================================================
          BACK
      =================================================== */}

      <section className="mx-auto max-w-7xl px-6 pt-12 md:px-10 md:pt-16">
        <Link
          to="/formations"
          className="label inline-flex items-center gap-3 text-[10px] text-ink/45 transition-opacity hover:opacity-60"
        >
          ← Toutes les formations
        </Link>
      </section>

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <div className="grid items-start gap-12 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.9fr)] md:gap-20">
          {/* IMAGE */}

          <div>
            {image ? (
              <ImageReveal
                src={image}
                alt={formation.title}
                className="aspect-[4/5] w-full"
              />
            ) : (
              <div className="aspect-[4/5] w-full bg-ink/5" />
            )}
          </div>

          {/* CONTENT */}

          <Reveal>
            <div>
              {/* LABEL */}

              <p className="label text-[10px] text-ink/45">
                {programmeName}
                {" · "}
                {duration}
              </p>

              {/* CITY */}

              <h1 className="display mt-5 text-[clamp(3.2rem,7vw,5.8rem)] leading-[0.9]">
                {selectedDay?.city ||
                  formation.title}
              </h1>

              {/* DATE */}

              {selectedDay && (
                <p className="mt-5 font-serif text-xl text-ink/70 md:text-2xl">
                  {formatDateRange(
                    selectedDay.start_date,
                    selectedDay.end_date
                  )}
                </p>
              )}

              {/* DESCRIPTION */}

              {description && (
                <div
                  className="mt-7 max-w-xl text-base font-light leading-relaxed text-ink/65"
                  dangerouslySetInnerHTML={{
                    __html: description,
                  }}
                />
              )}

              {/* INFORMATION */}

              {selectedDay && (
                <div className="mt-10 border-t border-ink/10">
                  <InfoRow label="DURÉE">
                    {duration}
                  </InfoRow>

                  <InfoRow label="DATES">
                    {formatDateRange(
                      selectedDay.start_date,
                      selectedDay.end_date
                    )}
                  </InfoRow>

                  <InfoRow label="VILLE">
                    {selectedDay.city}
                  </InfoRow>

                  <InfoRow label="FINANCEMENT PERSONNEL">
                    {formatPrice(
                      selectedDay.personal_price
                    )}
                  </InfoRow>

                  {selectedDay.cpf_eligible && (
                    <InfoRow label="FINANCEMENT CPF">
                      {formatPrice(
                        selectedDay.cpf_price
                      )}
                    </InfoRow>
                  )}

                  <InfoRow label="ACOMPTE">
                    {formatPrice(
                      formation.deposit_amount
                    )}
                  </InfoRow>
                </div>
              )}

              {/* PROGRAMME */}

              <Programme
                formation={formation}
              />

              {/* RESERVE */}

              {selectedDay &&
                selectedDay.remaining_places >
                  0 && (
                  <div className="mt-9">
                    <Button
                      to="#reservation"
                      variant="dark"
                      icon="arrow"
                    >
                      RÉSERVER MA PLACE
                    </Button>
                  </div>
                )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================================================
          SESSIONS AVAILABLE
      =================================================== */}

      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
          <div className="max-w-2xl">
            <p className="label text-[10px] text-ink/45">
              SESSIONS DISPONIBLES
            </p>

            <h2 className="display mt-5 text-[clamp(2.8rem,6vw,5rem)]">
              {activeCity || "Sessions"}
            </h2>
          </div>

          <Sessions
            sessions={citySessions}
            selectedDayId={
              selectedDay?.id ?? null
            }
          />
        </div>
      </section>

      {/* ===================================================
          RESERVATION
      =================================================== */}

      {selectedDay && (
        <section
          id="reservation"
          className="scroll-mt-20 border-t border-ink/10"
        >
          <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
            <div className="grid gap-12 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
              {/* LEFT */}

              <Reveal>
                <div>
                  <p className="label flex items-center gap-4 text-[10px] text-ink/45">
                    <span className="h-px w-7 bg-ink/40" />
                    RÉSERVATION
                  </p>

                  <h2 className="display mt-6 text-[clamp(3rem,6vw,5rem)] leading-[0.95]">
                    RÉSERVER
                    <br />
                    MA PLACE
                  </h2>

                  <p className="mt-7 max-w-sm text-sm font-light leading-relaxed text-ink/55">
                    Remplissez vos coordonnées
                    afin de réserver votre place
                    pour cette session.
                  </p>

                  <div className="mt-10 border-t border-ink/10">
                    <InfoRow label="FORMATION">
                      {formation.title}
                    </InfoRow>

                    <InfoRow label="VILLE">
                      {selectedDay.city}
                    </InfoRow>

                    <InfoRow label="DATES">
                      {formatDateRange(
                        selectedDay.start_date,
                        selectedDay.end_date
                      )}
                    </InfoRow>

                    <InfoRow label="TARIF">
                      {formatPrice(
                        selectedDay.personal_price
                      )}
                    </InfoRow>

                    {selectedDay.cpf_eligible && (
                      <InfoRow label="CPF">
                        {formatPrice(
                          selectedDay.cpf_price
                        )}
                      </InfoRow>
                    )}

                    <InfoRow label="ACOMPTE">
                      {formatPrice(
                        formation.deposit_amount
                      )}
                    </InfoRow>
                  </div>
                </div>
              </Reveal>

              {/* FORM */}

              <Reveal delay={0.1}>
                <ReservationForm
                  formation={formation}
                  formationDay={selectedDay}
                />
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================
          BOTTOM
      =================================================== */}

      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
          <Link
            to="/formations"
            className="label text-[10px] text-ink/45 transition-opacity hover:opacity-60"
          >
            ← Toutes les formations
          </Link>
        </div>
      </section>
    </main>
  );
}

export default FormationDetailPage;