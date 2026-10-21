
import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";
import { ReservationForm } from "@/components/booking/ReservationForm";
import type { Formation } from "@/types/formation";

type FormationDay = Formation["formationDays"][number];

interface SiteSettingsResponse {
  success: boolean;
  message?: string;
  data?: {
    payment?: {
      deposit_amount?: number | string | null;
      installment_options?: number[];
    };
  };
}

function parseDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const raw = String(value).trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateRange(start: unknown, end: unknown): string {
  const startDate = parseDate(start);
  const endDate = parseDate(end);

  if (!startDate && !endDate) return "Dates à confirmer";

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (startDate && !endDate) return formatter.format(startDate);
  if (!startDate || !endDate) return "Dates à confirmer";

  if (startDate.getTime() === endDate.getTime()) {
    return formatter.format(startDate);
  }

  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  if (sameMonth) {
    const monthYear = new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(endDate);

    return `${startDate.getDate()} — ${endDate.getDate()} ${monthYear}`;
  }

  return `${formatter.format(startDate)} — ${formatter.format(endDate)}`;
}

function formatPrice(
  value: number | string | null | undefined
): string {
  if (value === null || value === undefined || value === "") {
    return "À venir";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) return "À venir";

  return `${amount.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} €`;
}

function normalizeCity(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function isSessionAvailable(day: FormationDay): boolean {
  const remaining = Number(day.remaining_places ?? 0);
  const status = String(day.status ?? "").trim().toLowerCase();

  const unavailableStatuses = [
    "full",
    "complet",
    "complete",
    "closed",
    "cancelled",
    "canceled",
    "inactive",
  ];

  return remaining > 0 && !unavailableStatuses.includes(status);
}

export function FormationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCity = searchParams.get("city")?.trim() || "";
  const selectedDayId = searchParams.get("day");

  const {
    data: formation,
    loading,
    error,
  } = useFormation(slug);

  const [depositAmount, setDepositAmount] = useState<number | null>(null);
  const [paymentSettingsLoading, setPaymentSettingsLoading] =
    useState(true);
  const [paymentSettingsError, setPaymentSettingsError] = useState("");

  const apiBaseUrl = import.meta.env.VITE_API_URL
    ?.trim()
    .replace(/\/+$/, "");

  // Load the deposit configured by the administrator in Laravel.
  useEffect(() => {
    let cancelled = false;

    async function loadPaymentSettings() {
      if (!apiBaseUrl) {
        setPaymentSettingsError("L’URL de l’API est manquante.");
        setPaymentSettingsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${apiBaseUrl}/contenu/settings`,
          {
            headers: { Accept: "application/json" },
          }
        );

        const result: SiteSettingsResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Impossible de charger les paramètres de paiement."
          );
        }

        const rawAmount = result.data?.payment?.deposit_amount;
        const amount = Number(rawAmount);

        if (
          rawAmount === null ||
          rawAmount === undefined ||
          rawAmount === "" ||
          !Number.isFinite(amount) ||
          amount < 0
        ) {
          throw new Error("Le montant de l’acompte n’est pas configuré.");
        }

        if (!cancelled) {
          setDepositAmount(amount);
          setPaymentSettingsError("");
        }
      } catch (err) {
        if (!cancelled) {
          setPaymentSettingsError(
            err instanceof Error
              ? err.message
              : "Impossible de charger l’acompte."
          );
        }
      } finally {
        if (!cancelled) {
          setPaymentSettingsLoading(false);
        }
      }
    }

    void loadPaymentSettings();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

  const allSessions = useMemo<FormationDay[]>(() => {
    if (!formation || !Array.isArray(formation.formationDays)) {
      return [];
    }

    return formation.formationDays.filter(Boolean);
  }, [formation]);

  const sessions = useMemo<FormationDay[]>(() => {
    if (!selectedCity) return allSessions;

    const wantedCity = normalizeCity(selectedCity);

    return allSessions.filter(
      (day) => normalizeCity(day.city) === wantedCity
    );
  }, [allSessions, selectedCity]);

  const selectedSession = useMemo<FormationDay | null>(() => {
    if (!selectedDayId) return null;

    return (
      allSessions.find(
        (day) => String(day.id) === String(selectedDayId)
      ) ?? null
    );
  }, [allSessions, selectedDayId]);

  useEffect(() => {
    if (
      searchParams.get("scrollTo") !== "reservation" ||
      !selectedSession
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      document.getElementById("reservation")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 500);

    return () => window.clearTimeout(timer);
  }, [selectedSession, searchParams]);

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
          <p className="label text-ink/40">Formation</p>
          <h1 className="display mt-6 text-5xl lg:text-7xl">
            Formation introuvable
          </h1>

          {error && (
            <p className="mt-5 max-w-xl text-sm text-ink/50">
              {error}
            </p>
          )}

          <Link
            to="/formations"
            className="mt-10 inline-flex border border-ink px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-white"
          >
            Toutes les formations
          </Link>
        </div>
      </main>
    );
  }

  const programme = formation.programme ?? null;
  const duration = programme?.duration || "3 jours";
  const steps = Array.isArray(formation.steps) ? formation.steps : [];

  return (
    <main className="min-h-screen bg-ivory">
      {/* Formation header */}
      <section className="py-20 lg:py-28">
        <div className="wrap">
          <Link
            to="/formations"
            className="label text-ink/45 transition-opacity hover:opacity-60"
          >
            ← Toutes les formations
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_0.65fr]">
            <div>
              <p className="label text-ink/40">
                Formation professionnelle
              </p>

              <h1 className="display mt-5 text-5xl leading-tight md:text-6xl lg:text-7xl">
                {formation.title}
              </h1>

              {formation.description && (
                <p className="mt-7 max-w-2xl whitespace-pre-line text-sm leading-8 text-ink/60">
                  {formation.description}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-6 text-sm text-ink/60">
                <span>Durée : {duration}</span>

                <span>
                  Tarif :{" "}
                  {formatPrice(formation.personal_price)}
                </span>
              </div>

              <div className="mt-8">
                <p className="label text-[10px] text-ink/40">
                  Acompte demandé
                </p>

                <p className="mt-2 font-serif text-3xl">
                  {paymentSettingsLoading
                    ? "Chargement..."
                    : depositAmount !== null
                      ? formatPrice(depositAmount)
                      : "Indisponible"}
                </p>

                {paymentSettingsError && (
                  <p
                    role="alert"
                    className="mt-2 text-sm text-red-600"
                  >
                    {paymentSettingsError}
                  </p>
                )}
              </div>

              <a
                href="#sessions"
                className="mt-8 inline-flex border border-ink px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-white"
              >
                Voir les sessions
              </a>
            </div>

            {formation.image && (
              <div className="overflow-hidden">
                <img
                  src={formation.image}
                  alt={formation.title}
                  className="h-full max-h-[560px] w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Programme steps */}
      {steps.length > 0 && (
        <section className="border-t border-ink/10 py-20 lg:py-28">
          <div className="wrap">
            <p className="label text-ink/40">Le programme</p>

            <h2 className="display mt-5 text-4xl lg:text-6xl">
              Contenu de la formation
            </h2>

            <div className="mt-10 border-t border-ink/10">
              {steps.map((step, index) => (
                <div
                  key={String(
                    (step as { id?: string | number }).id ?? index
                  )}
                  className="border-b border-ink/10 py-6"
                >
                  <p className="text-xs text-ink/40">
                    Étape {index + 1}
                  </p>

                  <p className="mt-2 font-serif text-xl">
                    {typeof step === "string"
                      ? step
                      : String(
                          (step as { title?: string; name?: string })
                            .title ??
                            (step as { name?: string }).name ??
                            ""
                        )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Available sessions */}
      <section
        id="sessions"
        className="scroll-mt-20 border-t border-ink/10 py-20 lg:py-28"
      >
        <div className="wrap">
          <p className="label text-ink/40">Sessions disponibles</p>

          <h2 className="display mt-5 text-4xl lg:text-6xl">
            {selectedCity || "Toutes les sessions"}
          </h2>

          <div className="mt-12 border-t border-ink/10">
            {sessions.length === 0 ? (
              <div className="py-10">
                <p className="text-sm text-ink/50">
                  Aucune session disponible
                  {selectedCity ? ` pour ${selectedCity}.` : "."}
                </p>
              </div>
            ) : (
              sessions.map((day) => {
                const isSelected =
                  String(selectedSession?.id) === String(day.id);

                const remaining = Number(day.remaining_places) || 0;
                const isFull = !isSessionAvailable(day);

                return (
                  <div
                    key={day.id}
                    className="border-b border-ink/10 py-8"
                  >
                    <div className="grid gap-6 md:grid-cols-[1fr_auto_auto] md:items-center">
                      <div>
                        <p className="font-serif text-2xl">
                          {day.city || "Ville à confirmer"}
                        </p>

                        <p className="mt-2 text-sm text-ink/60">
                          {formatDateRange(
                            day.start_date,
                            day.end_date
                          )}
                        </p>

                        <p className="mt-2 text-sm text-ink/50">
                          {remaining}{" "}
                          {remaining === 1
                            ? "place restante"
                            : "places restantes"}
                        </p>
                      </div>

                      <div className="md:text-right">
                        <p className="font-serif text-xl">
                          {formatPrice(
                            day.personal_price ??
                              formation.personal_price
                          )}
                        </p>

                        {day.cpf_eligible &&
                          day.cpf_price !== null &&
                          day.cpf_price !== undefined &&
                          day.cpf_price !== "" && (
                            <p className="mt-1 text-xs text-ink/40">
                              CPF {formatPrice(day.cpf_price)}
                            </p>
                          )}

                        <p className="mt-1 text-xs text-ink/40">
                          Acompte{" "}
                          {paymentSettingsLoading
                            ? "Chargement..."
                            : depositAmount !== null
                              ? formatPrice(depositAmount)
                              : "Indisponible"}
                        </p>
                      </div>

                      <div className="md:text-right">
                        {isFull ? (
                          <span className="inline-flex min-w-[135px] items-center justify-center border border-ink/20 px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink/30">
                            COMPLET
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const params = new URLSearchParams();

                              if (day.city) {
                                params.set("city", day.city);
                              }

                              params.set("day", String(day.id));
                              setSearchParams(params);
                            }}
                            className={`inline-flex min-w-[135px] items-center justify-center border px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                              isSelected
                                ? "border-[#111111] bg-[#111111] text-white"
                                : "border-ink text-ink hover:bg-ink hover:text-white"
                            }`}
                          >
                            {isSelected
                              ? "SÉLECTIONNÉE"
                              : "RÉSERVER"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Reservation */}
      {selectedSession && isSessionAvailable(selectedSession) && (
        <section
          id="reservation"
          className="scroll-mt-20 border-t border-ink/10 bg-white py-20 lg:py-32"
        >
          <div className="wrap">
            <div className="grid gap-12 lg:grid-cols-[0.4fr_0.6fr]">
              <div>
                <p className="label flex items-center gap-4 text-ink/50">
                  <span className="h-px w-10 bg-current" />
                  Réservation
                </p>

                <h2 className="display mt-5 text-5xl md:text-6xl">
                  RÉSERVER
                  <br />
                  MA PLACE
                </h2>

                <p className="mt-6 max-w-md text-sm leading-7 text-ink/55">
                  Remplissez vos coordonnées pour réserver votre place.
                </p>

                <div className="mt-8 border-t border-ink/10 pt-6">
                  <p className="label text-[10px] text-ink/40">
                    Session sélectionnée
                  </p>

                  <p className="mt-3 font-serif text-2xl">
                    {selectedSession.city || "Ville à confirmer"}
                  </p>

                  <p className="mt-1 text-sm text-ink/55">
                    {formatDateRange(
                      selectedSession.start_date,
                      selectedSession.end_date
                    )}
                  </p>

                  <div className="mt-6 border-t border-ink/10 pt-5">
                    <div className="flex items-center justify-between gap-6">
                      <span className="label text-[10px] text-ink/40">
                        Formation
                      </span>

                      <span className="text-right font-serif text-xl">
                        {formation.title}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-6">
                      <span className="label text-[10px] text-ink/40">
                        Tarif
                      </span>

                      <span className="font-serif text-xl">
                        {formatPrice(
                          selectedSession.personal_price ??
                            formation.personal_price
                        )}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-6">
                      <span className="label text-[10px] text-ink/40">
                        Places
                      </span>

                      <span className="text-sm text-ink/60">
                        {Number(selectedSession.remaining_places) || 0} restantes
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-6">
                      <span className="label text-[10px] text-ink/40">
                        Acompte
                      </span>

                      <span className="font-serif text-xl">
                        {paymentSettingsLoading
                          ? "Chargement..."
                          : depositAmount !== null
                            ? formatPrice(depositAmount)
                            : "Indisponible"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <ReservationForm
                  formation={formation}
                  formationDay={selectedSession}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {selectedSession && !isSessionAvailable(selectedSession) && (
        <section
          id="reservation"
          className="scroll-mt-20 border-t border-ink/10 bg-white py-16"
        >
          <div className="wrap">
            <p className="label text-ink/40">Réservation</p>

            <h2 className="display mt-5 text-3xl md:text-4xl">
              Session complète
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-ink/60">
              Cette session n’est plus disponible à la réservation.
              Veuillez choisir une autre session disponible.
            </p>
          </div>
        </section>
      )}

      {/* PDF */}
      {formation.pdf_program && (
        <section className="border-t border-ink/10 py-16">
          <div className="wrap">
            <a
              href={formation.pdf_program}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex border border-ink px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-white"
            >
              Télécharger le programme
            </a>
          </div>
        </section>
      )}

      {/* Back */}
      <section className="border-t border-ink/10 py-16">
        <div className="wrap">
          <Link
            to="/formations"
            className="label text-ink/45 transition-opacity hover:opacity-60"
          >
            ← Toutes les formations
          </Link>
        </div>
      </section>
    </main>
  );
}

export default FormationDetailPage;
