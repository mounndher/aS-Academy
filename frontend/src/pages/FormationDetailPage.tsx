import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";
import { ReservationForm } from "@/components/booking/ReservationForm";
import { getStorageUrl } from "@/services/api";

interface FormationDay {
  id: number;
  formation_id: number;
  city: string;

  start_date: string | null;
  end_date: string | null;

  image?: string | null;

  personal_price: number | string | null;

  cpf_eligible: boolean;
  cpf_price: number | string | null;

  max_places: number;
  remaining_places: number;

  status: string;
}

interface FormationStep {
  title: string;
  description?: string;
}

interface FormationProgramme {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  duration: string | null;
  is_active: boolean;
}

interface Formation {
  id: number;
  programme_id: number | null;

  programme: FormationProgramme | null;

  title: string;
  slug: string;

  description: string | null;

  steps: FormationStep[];

  image: string | null;

  pdf_program: string | null;

  deposit_amount: number | string | null;

  personal_price: number | string | null;

  has_sale: boolean;

  sale_price: number | string | null;

  installment_enabled: boolean;

  installment_count: number | null;

  is_active: boolean;

  formationDays: FormationDay[];
}

/* =========================================================
   DATE HELPERS
========================================================= */

function isValidDate(value?: string | null): boolean {
  if (!value) return false;

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

function formatDate(
  value?: string | null
): string {
  if (!isValidDate(value)) {
    return "Date à confirmer";
  }

  return new Date(value!).toLocaleDateString(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function formatDateRange(
  start?: string | null,
  end?: string | null
): string {
  if (!isValidDate(start)) {
    return "Date à confirmer";
  }

  if (!isValidDate(end)) {
    return formatDate(start);
  }

  const startDate = new Date(start!);
  const endDate = new Date(end!);

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

  const startMonth = startDate.toLocaleDateString(
    "fr-FR",
    {
      month: "long",
    }
  );

  const endMonth = endDate.toLocaleDateString(
    "fr-FR",
    {
      month: "long",
    }
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
  value: number | string | null | undefined
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "À venir";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "À venir";
  }

  return `${number.toLocaleString("fr-FR")} €`;
}

/* =========================================================
   STATUS
========================================================= */

function isAvailable(day: FormationDay): boolean {
  return (
    day.remaining_places > 0 &&
    day.status !== "completed" &&
    day.status !== "finished" &&
    day.status !== "cancelled"
  );
}

/* =========================================================
   PAGE
========================================================= */

export function FormationDetailPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const [searchParams] = useSearchParams();

  /*
   * City comes from:
   *
   * /formations/formation-extension-de-cils?city=Paris
   *
   * or:
   *
   * /formations/formation-extension-de-cils?day=12
   */

  const selectedCity =
    searchParams.get("city");

  const selectedDayId =
    searchParams.get("day");

  /*
   * IMPORTANT:
   *
   * This hook is ALWAYS called.
   * Never put it inside an if().
   *
   * This prevents React error #310.
   */

  const {
    data,
    loading,
    error,
  } = useFormation(slug);

  /*
   * Always call useMemo too.
   * Never conditionally call it.
   */

  const formation =
    data as Formation | null;

  const allDays = useMemo(() => {
    if (!formation) {
      return [];
    }

    if (
      !Array.isArray(
        formation.formationDays
      )
    ) {
      return [];
    }

    return formation.formationDays.filter(
      Boolean
    );
  }, [formation]);

  /*
   * Selected city
   *
   * If URL contains city=Paris,
   * display ONLY Paris sessions.
   *
   * Otherwise display all sessions.
   */

  const visibleDays = useMemo(() => {
    if (!selectedCity) {
      return allDays;
    }

    const normalizedCity =
      selectedCity
        .trim()
        .toLowerCase();

    return allDays.filter(
      (day) =>
        String(day.city ?? "")
          .trim()
          .toLowerCase() ===
        normalizedCity
    );
  }, [
    allDays,
    selectedCity,
  ]);

  /*
   * Selected session
   */

  const selectedDay = useMemo(() => {
    if (!selectedDayId) {
      return null;
    }

    const id =
      Number(selectedDayId);

    if (Number.isNaN(id)) {
      return null;
    }

    return (
      allDays.find(
        (day) => day.id === id
      ) ?? null
    );
  }, [
    allDays,
    selectedDayId,
  ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory px-6 py-32">
        <div className="mx-auto max-w-6xl">
          <p className="label text-ink/40">
            Chargement...
          </p>

          <div className="mt-6 h-px w-full bg-ink/10" />
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
            Formation
          </p>

          <h1 className="display mt-6 text-5xl md:text-7xl">
            Formation introuvable
          </h1>

          <p className="mt-6 max-w-xl text-ink/60">
            {error ??
              "Cette formation n'existe pas ou n'est plus disponible."}
          </p>

          <Link
            to="/formations"
            className="mt-10 inline-flex border-b border-ink pb-2 text-sm uppercase tracking-[0.18em]"
          >
            ← Toutes les formations
          </Link>
        </div>
      </main>
    );
  }

  /* =======================================================
     IMAGE
  ======================================================= */

  const formationImage =
    formation.image
      ? getStorageUrl(
          formation.image
        )
      : null;

  /* =======================================================
     DURATION
  ======================================================= */

  const duration =
    formation.programme
      ?.duration ??
    "3 jours";

  /* =======================================================
     PRICE
  ======================================================= */

  const mainPrice =
    formation.has_sale &&
    formation.sale_price
      ? formation.sale_price
      : formation.personal_price;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="bg-ivory text-ink">

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">

            {/* TEXT */}

            <div>

              <p className="label text-ink/40">
                Formation
              </p>

              <h1 className="display mt-6 max-w-4xl text-[clamp(3.2rem,8vw,7.5rem)] leading-[0.9]">
                {formation.title}
              </h1>

              {formation.programme?.name && (
                <p className="mt-8 font-serif text-2xl text-ink/60 md:text-3xl">
                  {formation.programme.name}
                </p>
              )}

              {formation.description && (
                <div
                  className="mt-8 max-w-2xl text-base font-light leading-8 text-ink/65"
                  dangerouslySetInnerHTML={{
                    __html:
                      formation.description,
                  }}
                />
              )}

              <div className="mt-10 grid max-w-2xl grid-cols-2 border-t border-ink/10 sm:grid-cols-3">

                <div className="border-b border-ink/10 py-5 pr-5">
                  <p className="label text-[10px] text-ink/40">
                    Durée
                  </p>

                  <p className="mt-2 font-serif text-xl">
                    {duration}
                  </p>
                </div>

                <div className="border-b border-ink/10 py-5 pr-5">
                  <p className="label text-[10px] text-ink/40">
                    Tarif
                  </p>

                  <p className="mt-2 font-serif text-xl">
                    {formatPrice(
                      mainPrice
                    )}
                  </p>
                </div>

                <div className="col-span-2 border-b border-ink/10 py-5 sm:col-span-1">
                  <p className="label text-[10px] text-ink/40">
                    Acompte
                  </p>

                  <p className="mt-2 font-serif text-xl">
                    {formatPrice(
                      formation.deposit_amount
                    )}
                  </p>
                </div>

              </div>
            </div>

            {/* IMAGE */}

            <div>
              {formationImage ? (
                <img
                  src={formationImage}
                  alt={formation.title}
                  className="aspect-[4/5] w-full object-cover"
                />
              ) : (
                <div className="aspect-[4/5] w-full bg-ink/5" />
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ===================================================
          PROGRAMME
      =================================================== */}

      {Array.isArray(
        formation.steps
      ) &&
        formation.steps.length > 0 && (
          <section className="border-t border-ink/10 px-6 py-20 md:px-10 md:py-28">
            <div className="mx-auto max-w-7xl">

              <div className="grid gap-12 lg:grid-cols-[0.4fr_0.6fr]">

                <div>
                  <p className="label text-ink/40">
                    Programme
                  </p>

                  <h2 className="display mt-5 text-5xl md:text-6xl">
                    Le programme
                  </h2>
                </div>

                <div className="divide-y divide-ink/10 border-t border-ink/10">

                  {formation.steps.map(
                    (
                      step,
                      index
                    ) => (
                      <div
                        key={`${step.title}-${index}`}
                        className="grid gap-5 py-7 md:grid-cols-[80px_1fr]"
                      >

                        <span className="font-serif text-xl text-ink/30">
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
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/55">
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

            </div>
          </section>
        )}

      {/* ===================================================
          PDF PROGRAM
      =================================================== */}

      {formation.pdf_program && (
        <section className="border-t border-ink/10 px-6 py-12 md:px-10">
          <div className="mx-auto max-w-7xl">

            <a
              href={getStorageUrl(
                formation.pdf_program
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex border-b border-ink pb-2 text-sm uppercase tracking-[0.16em]"
            >
              Voir le programme PDF →
            </a>

          </div>
        </section>
      )}

      {/* ===================================================
          SESSIONS
      =================================================== */}

      <section
        id="sessions"
        className="border-t border-ink/10 px-6 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-7xl">

          <div className="mb-12">
            <p className="label text-ink/40">
              Sessions disponibles
            </p>

            <h2 className="display mt-5 text-5xl md:text-6xl">
              {selectedCity
                ? selectedCity
                : "Toutes les sessions"}
            </h2>
          </div>

          {visibleDays.length === 0 ? (
            <div className="border-t border-ink/10 py-12">
              <p className="text-ink/50">
                Aucune session disponible
                pour cette ville.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-ink/10 border-t border-ink/10">

              {visibleDays.map(
                (day) => {
                  const available =
                    isAvailable(day);

                  return (
                    <div
                      key={day.id}
                      className="grid gap-6 py-8 md:grid-cols-[1fr_1fr_auto] md:items-center"
                    >

                      {/* CITY */}

                      <div>
                        <p className="label text-[10px] text-ink/40">
                          Ville
                        </p>

                        <h3 className="mt-2 font-serif text-3xl">
                          {day.city}
                        </h3>
                      </div>

                      {/* DATE */}

                      <div>
                        <p className="label text-[10px] text-ink/40">
                          Dates
                        </p>

                        <p className="mt-2 font-serif text-xl">
                          {formatDateRange(
                            day.start_date,
                            day.end_date
                          )}
                        </p>

                        <p className="mt-2 text-sm text-ink/50">
                          {available
                            ? `${day.remaining_places} places restantes`
                            : "Session complète"}
                        </p>
                      </div>

                      {/* PRICE */}

                      <div className="md:text-right">

                        <p className="font-serif text-2xl">
                          {formatPrice(
                            day.personal_price
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
        className="border-t border-ink/10 px-6 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-12 lg:grid-cols-[0.4fr_0.6fr]">

            <div>
              <p className="label text-ink/40">
                Réservation
              </p>

              <h2 className="display mt-5 text-5xl md:text-6xl">
                Réserver votre formation
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-ink/55">
                Choisissez votre session et
                envoyez votre demande de
                réservation.
              </p>

              {selectedDay && (
                <div className="mt-8 border-t border-ink/10 pt-6">

                  <p className="label text-[10px] text-ink/40">
                    Session sélectionnée
                  </p>

                  <p className="mt-3 font-serif text-2xl">
                    {selectedDay.city}
                  </p>

                  <p className="mt-1 text-sm text-ink/55">
                    {formatDateRange(
                      selectedDay.start_date,
                      selectedDay.end_date
                    )}
                  </p>

                </div>
              )}
            </div>

            <div>
              <ReservationForm
                formation={formation}
                formationDay={
                  selectedDay ??
                  visibleDays[0] ??
                  null
                }
              />
            </div>

          </div>

        </div>
      </section>

    </main>
  );
}

export default FormationDetailPage;