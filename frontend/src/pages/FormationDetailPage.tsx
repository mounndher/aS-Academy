import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";

import type {
  Formation,
  FormationDay,
} from "@/types/formation";

function normalizeCity(
  value: string | null | undefined
): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function FormationDetailPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const [searchParams] = useSearchParams();

  /*
   * Example:
   *
   * #/formations/extension-de-cils?city=Paris
   *
   * selectedCity = "Paris"
   */
  const selectedCity =
    searchParams.get("city")?.trim() || "";

  const selectedDayId =
    searchParams.get("day");

  /*
   * API
   */
  const {
    data: formation,
    loading,
    error,
  } = useFormation(slug);

  /*
   * ALL SESSIONS
   */
  const allSessions = useMemo<FormationDay[]>(
    () => {
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
        (day): day is FormationDay =>
          Boolean(day) &&
          typeof day === "object"
      );
    },
    [formation]
  );

  /*
   * FILTER BY CITY
   *
   * Paris -> ONLY Paris
   * Toulouse -> ONLY Toulouse
   * Lyon -> ONLY Lyon
   *
   * No city -> ALL sessions
   */
  const sessions = useMemo<FormationDay[]>(
    () => {
      if (!selectedCity) {
        return allSessions;
      }

      const city = normalizeCity(
        selectedCity
      );

      return allSessions.filter(
        (day) =>
          normalizeCity(day.city) === city
      );
    },
    [
      allSessions,
      selectedCity,
    ]
  );

  /*
   * SELECTED SESSION
   *
   * IMPORTANT:
   * Search by `sessions`, NOT allSessions.
   *
   * Therefore:
   *
   * ?city=Paris&day=10
   *
   * cannot accidentally select
   * a Toulouse session.
   */
  const selectedSession =
    useMemo<FormationDay | null>(() => {
      if (!selectedDayId) {
        return null;
      }

      return (
        sessions.find(
          (day) =>
            String(day.id) ===
            String(selectedDayId)
        ) ?? null
      );
    }, [
      sessions,
      selectedDayId,
    ]);

  /*
   * REST OF YOUR PAGE
   *
   * Use `sessions` everywhere for
   * "Sessions disponibles".
   */

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

  if (error || !formation) {
    return (
      <main className="min-h-screen bg-ivory py-32">
        <div className="wrap">
          <p className="text-sm text-red-500">
            Formation introuvable.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-ivory">

      {/* YOUR EXISTING FORMATION DETAIL */}
      {/* Keep your existing design here */}


      {/* =================================================
          SESSIONS DISPONIBLES
      ================================================= */}

      <section
        id="sessions"
        className="border-t border-ink/10 py-20 lg:py-28"
      >
        <div className="wrap">

          <p className="label text-ink/45">
            Sessions disponibles
          </p>

          <h2 className="display mt-4">
            {selectedCity
              ? `Sessions à ${selectedCity}`
              : "Sessions disponibles"}
          </h2>

          {sessions.length === 0 ? (
            <div className="mt-10 border-y border-ink/10 py-8">
              <p className="text-sm text-ink/50">
                Aucune session disponible
                {selectedCity
                  ? ` à ${selectedCity}`
                  : ""}
                .
              </p>
            </div>
          ) : (
            <div className="mt-10">

              {sessions.map((day) => {
                const places =
                  Number(
                    day.remaining_places
                  ) || 0;

                const available =
                  places > 0;

                const isSelected =
                  selectedSession?.id ===
                  day.id;

                return (
                  <div
                    key={day.id}
                    className={`border-t border-ink/10 py-7 last:border-b ${
                      isSelected
                        ? "bg-ink/[0.03]"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                      {/* CITY / DATE */}

                      <div>
                        <p className="font-serif text-2xl">
                          {day.city}
                        </p>

                        <p className="mt-2 text-sm text-ink/55">
                          {day.start_date}
                          {" — "}
                          {day.end_date}
                        </p>

                        <p className="mt-2 text-xs text-ink/45">
                          {places > 0
                            ? `${places} place${
                                places > 1
                                  ? "s"
                                  : ""
                              } restante${
                                places > 1
                                  ? "s"
                                  : ""
                              }`
                            : "Complet"}
                        </p>
                      </div>

                      {/* PRICE / BUTTON */}

                      <div className="flex items-center gap-6">

                        <div className="text-right">
                          <p className="font-serif text-xl">
                            {day.personal_price ??
                              formation.personal_price}
                            €
                          </p>

                          {formation.deposit_amount !==
                            null &&
                          formation.deposit_amount !==
                            undefined ? (
                            <p className="mt-1 text-xs text-ink/45">
                              Acompte{" "}
                              {
                                formation.deposit_amount
                              }€
                            </p>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          disabled={!available}
                          onClick={() => {
                            const params =
                              new URLSearchParams();

                            /*
                             * KEEP CITY
                             */
                            if (
                              selectedCity
                            ) {
                              params.set(
                                "city",
                                selectedCity
                              );
                            }

                            /*
                             * SELECT SESSION
                             */
                            params.set(
                              "day",
                              String(day.id)
                            );

                            /*
                             * Update URL
                             */
                            window.history.replaceState(
                              null,
                              "",
                              `${
                                window.location.pathname
                              }?${params.toString()}`
                            );

                            /*
                             * Scroll to reservation
                             */
                            setTimeout(() => {
                              document
                                .getElementById(
                                  "reservation"
                                )
                                ?.scrollIntoView({
                                  behavior:
                                    "smooth",
                                  block: "start",
                                });
                            }, 50);
                          }}
                          className="border border-ink px-6 py-3 text-xs uppercase tracking-[0.15em] transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isSelected
                            ? "Session sélectionnée"
                            : available
                            ? "Réserver"
                            : "Complet"}
                        </button>

                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          )}
        </div>
      </section>

      {/* =================================================
          RESERVATION
      ================================================= */}

      {selectedSession ? (
        <section id="reservation">
          {/* YOUR EXISTING ReservationForm */}

          {/* 
            <ReservationForm
              formation={formation}
              formationDay={selectedSession}
            />
          */}
        </section>
      ) : null}

    </main>
  );
}