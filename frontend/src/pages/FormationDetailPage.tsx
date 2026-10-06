import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";
import { ReservationForm } from "@/components/booking/ReservationForm";
import { Button } from "@/components/ui/Button";
import { getStorageUrl } from "@/services/api";

function formatDate(date: string) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateRange(start: string, end: string) {
  if (!start || !end) return "";

  const startDate = new Date(start);
  const endDate = new Date(end);

  const startDay = startDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
  });

  const endDay = endDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
  });

  const startMonth = startDate.toLocaleDateString("fr-FR", {
    month: "long",
  });

  const endMonth = endDate.toLocaleDateString("fr-FR", {
    month: "long",
  });

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  if (
    startMonth === endMonth &&
    startYear === endYear
  ) {
    return `${startDay} — ${endDay} ${startMonth}`;
  }

  return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
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

  return `${Number(price).toLocaleString("fr-FR")} €`;
}

export function FormationDetailPage() {
  /*
   * IMPORTANT:
   * ALL HOOKS ARE HERE.
   * NEVER put hooks below an if/return.
   */

  const [searchParams] = useSearchParams();

  const slug = searchParams.get("slug") ?? undefined;

  /*
   * Normally the slug comes from:
   *
   * /formations/:slug
   *
   * useFormation needs the route slug.
   */
  const { data, loading, error } =
    useFormationFromRoute();

  /*
   * City comes from:
   *
   * /formations/xxx?city=Paris
   *
   */
  const selectedCity =
    searchParams.get("city");

  /*
   * Formation day can optionally come from:
   *
   * ?day=123
   */
  const selectedDayId =
    searchParams.get("day");

  /*
   * These calculations are NOT hooks.
   * They are safe here.
   */

  const formation = data;

  const allDays = formation?.formationDays ?? [];

  /*
   * If a city was selected, show ONLY that city's sessions.
   *
   * Example:
   *
   * ?city=Paris
   *
   * => Paris sessions only.
   */
  const availableDays = useMemo(() => {
    if (!formation) {
      return [];
    }

    if (!selectedCity) {
      return allDays;
    }

    return allDays.filter(
      (day) =>
        day.city.toLowerCase() ===
        selectedCity.toLowerCase()
    );
  }, [formation, allDays, selectedCity]);

  /*
   * Selected reservation session.
   */
  const selectedDay = useMemo(() => {
    if (!availableDays.length) {
      return null;
    }

    if (selectedDayId) {
      const found = availableDays.find(
        (day) =>
          String(day.id) ===
          String(selectedDayId)
      );

      if (found) {
        return found;
      }
    }

    return availableDays[0];
  }, [availableDays, selectedDayId]);

  /*
   * IMAGE
   *
   * First priority:
   * formation day image
   *
   * Otherwise:
   * formation image
   */
  const heroImage = useMemo(() => {
    if (!formation) {
      return "";
    }

    const dayImage =
      selectedDay?.image ?? null;

    if (dayImage) {
      return getStorageUrl(dayImage);
    }

    if (formation.image) {
      return getStorageUrl(
        formation.image
      );
    }

    return "";
  }, [formation, selectedDay]);

  /*
   * ======================================================
   * LOADING
   * ======================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory">
        <section className="mx-auto max-w-7xl px-6 py-32">
          <p className="label text-ink/40">
            Chargement...
          </p>
        </section>
      </main>
    );
  }

  /*
   * ======================================================
   * ERROR
   * ======================================================
   */

  if (error || !formation) {
    return (
      <main className="min-h-screen bg-ivory">
        <section className="mx-auto max-w-7xl px-6 py-32">
          <p className="label text-ink/40">
            Formation
          </p>

          <h1 className="display mt-6 text-5xl md:text-7xl">
            Formation introuvable
          </h1>

          <Link
            to="/formations"
            className="mt-10 inline-flex items-center gap-3 text-sm uppercase tracking-[0.18em]"
          >
            ← Toutes les formations
          </Link>
        </section>
      </main>
    );
  }

  const programme =
    formation.programme;

  const duration =
    programme?.duration ??
    "3 jours";

  return (
    <main className="bg-ivory text-ink">

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">

        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">

          {/* IMAGE */}

          <div className="overflow-hidden">
            {heroImage ? (
              <img
                src={heroImage}
                alt={formation.title}
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="aspect-[4/5] w-full bg-ink/5" />
            )}
          </div>

          {/* TEXT */}

          <div>

            <p className="label text-ink/40">
              {programme?.name ??
                "Formation"}
            </p>

            <h1 className="display mt-6 text-[clamp(3rem,7vw,6.5rem)] leading-[0.9]">
              {formation.title}
            </h1>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink/55">
              <span>
                {duration}
              </span>

              {selectedDay && (
                <span>
                  {selectedDay.city}
                </span>
              )}
            </div>

            {formation.description && (
              <div
                className="mt-10 max-w-xl text-base font-light leading-8 text-ink/65"
                dangerouslySetInnerHTML={{
                  __html:
                    formation.description,
                }}
              />
            )}

          </div>
        </div>
      </section>

      {/* ==================================================
          PROGRAMME
      ================================================== */}

      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">

          <div className="grid gap-14 lg:grid-cols-[0.35fr_0.65fr]">

            <div>
              <p className="label text-ink/40">
                Programme
              </p>

              <h2 className="display mt-5 text-4xl md:text-6xl">
                Le programme
              </h2>
            </div>

            <div>
              {formation.steps &&
              formation.steps.length > 0 ? (
                <div className="divide-y divide-ink/10 border-y border-ink/10">

                  {formation.steps.map(
                    (step, index) => (
                      <div
                        key={`${step.title}-${index}`}
                        className="py-7"
                      >
                        <div className="flex gap-6">

                          <span className="font-serif text-lg text-ink/35">
                            {String(
                              index + 1
                            ).padStart(2, "0")}
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
                      </div>
                    )
                  )}

                </div>
              ) : (
                <p className="text-ink/50">
                  Programme disponible prochainement.
                </p>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          SESSIONS
      ================================================== */}

      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">

          <div className="mb-12">
            <p className="label text-ink/40">
              Sessions disponibles
            </p>

            <h2 className="display mt-5 text-4xl md:text-6xl">
              {selectedCity
                ? selectedCity
                : "Toutes les sessions"}
            </h2>
          </div>

          {availableDays.length === 0 ? (
            <div className="border-y border-ink/10 py-12">
              <p className="text-ink/50">
                Aucune session disponible
                pour cette ville.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {availableDays.map(
                (day) => {

                  const available =
                    day.remaining_places >
                      0 &&
                    day.status !==
                      "completed";

                  return (
                    <div
                      key={day.id}
                      className="border-y border-ink/10 py-7"
                    >

                      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">

                        <div>

                          <p className="font-serif text-2xl">
                            {day.city}
                          </p>

                          <p className="mt-2 text-sm text-ink/55">
                            {formatDateRange(
                              day.start_date,
                              day.end_date
                            )}
                          </p>

                          <p className="mt-2 text-sm text-ink/45">
                            {day.remaining_places >
                            0
                              ? `${day.remaining_places} places restantes`
                              : "Complet"}
                          </p>

                        </div>

                        <div className="text-left md:text-right">

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

                    </div>
                  );
                }
              )}

            </div>
          )}
        </div>
      </section>

      {/* ==================================================
          RESERVATION
      ================================================== */}

      <section
        id="reservation"
        className="border-t border-ink/10"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">

          <div className="grid gap-14 lg:grid-cols-[0.35fr_0.65fr]">

            <div>
              <p className="label text-ink/40">
                Réservation
              </p>

              <h2 className="display mt-5 text-4xl md:text-6xl">
                Réserver votre formation
              </h2>

              {selectedDay && (
                <div className="mt-8 border-t border-ink/10 pt-6">

                  <p className="text-sm text-ink/45">
                    Session sélectionnée
                  </p>

                  <p className="mt-2 font-serif text-2xl">
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
              {selectedDay ? (
                <ReservationForm
                  formation={formation}
                  formationDay={selectedDay}
                />
              ) : (
                <p className="text-ink/50">
                  Sélectionnez une session
                  disponible pour continuer.
                </p>
              )}
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}

/*
 * ==========================================================
 * ROUTE HOOK
 * ==========================================================
 *
 * Keep this hook in a separate function so the main component
 * always calls it in exactly the same place.
 */

function useFormationFromRoute() {
  /*
   * Importing useParams here would be cleaner, but we keep
   * the route extraction isolated.
   */
  const [searchParams] =
    useSearchParams();

  const routeSlug =
    window.location.hash
      .split("?")[0]
      .split("/")
      .filter(Boolean)
      .pop();

  /*
   * If your HashRouter URL is:
   *
   * #/formations/formation-extension-de-cils
   *
   * routeSlug =
   * formation-extension-de-cils
   */

  const slug =
    routeSlug ||
    searchParams.get("slug") ||
    undefined;

  return useFormation(slug);
}

export default FormationDetailPage;