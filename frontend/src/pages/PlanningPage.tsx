
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

interface FormationDay {
  id: number;
  city: string;
  start_date: string;
  end_date: string;
  personal_price: string | null;
  cpf_eligible: boolean;
  cpf_price: string | null;
  remaining_places: number;
  status: string;
}

interface Formation {
  id: number;
  title: string;
  slug: string;
  formationDays: FormationDay[];
}

interface Session {
  formation: Formation;
  day: FormationDay;
}

interface SettingsResponse {
  success: boolean;
  message?: string;
  data?: {
    payment?: {
      deposit_amount?: number | string | null;
      installment_options?: number[];
    };
  };
}

function formatDate(date: string) {
  const match = String(date).match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return "Date à confirmer";
  }

  const parsedDate = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  );

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function formatDateRange(start: string, end: string) {
  if (start.slice(0, 10) === end.slice(0, 10)) {
    return formatDate(start);
  }

  return `${formatDate(start)} – ${formatDate(end)}`;
}

function formatPrice(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return null;
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function isPastSession(endDate: string, today: Date) {
  const match = String(endDate).match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return false;
  }

  const end = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  );

  end.setHours(0, 0, 0, 0);

  return end < today;
}

export function PlanningPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const [depositAmount, setDepositAmount] = useState<number | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSessions() {
      try {
        if (!API_URL) {
          throw new Error("VITE_API_URL n'est pas configurée.");
        }

        const response = await fetch(
          `${API_URL}/contenu/formations`,
          {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error("Impossible de charger le planning.");
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error("Réponse API invalide.");
        }

        const allSessions: Session[] = result.data.flatMap(
          (formation: Formation) =>
            (formation.formationDays ?? []).map(
              (day: FormationDay) => ({
                formation,
                day,
              })
            )
        );

        allSessions.sort(
          (a, b) =>
            new Date(a.day.start_date).getTime() -
            new Date(b.day.start_date).getTime()
        );

        setSessions(allSessions);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Erreur planning :", err);
        setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadSessions();

    return () => controller.abort();
  }, []);

  // Load the deposit amount configured in the Laravel admin panel.
  useEffect(() => {
    const controller = new AbortController();

    async function loadPaymentSettings() {
      try {
        if (!API_URL) {
          throw new Error("VITE_API_URL n'est pas configurée.");
        }

        const response = await fetch(
          `${API_URL}/contenu/settings`,
          {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          }
        );

        const result: SettingsResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Impossible de charger les paramètres de paiement."
          );
        }

        const rawAmount = result.data?.payment?.deposit_amount;

        if (
          rawAmount === null ||
          rawAmount === undefined ||
          rawAmount === ""
        ) {
          throw new Error("Le montant de l'acompte n'est pas configuré.");
        }

        const amount = Number(rawAmount);

        if (!Number.isFinite(amount) || amount < 0) {
          throw new Error("Le montant de l'acompte est invalide.");
        }

        setDepositAmount(amount);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Erreur paramètres de paiement :", err);
        setDepositAmount(null);
      } finally {
        if (!controller.signal.aborted) {
          setSettingsLoading(false);
        }
      }
    }

    void loadPaymentSettings();

    return () => controller.abort();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const visibleSessions = sessions.filter(({ day }) => {
    return showPast || !isPastSession(day.end_date, today);
  });

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-5 py-20 text-[#171717] sm:px-8 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center gap-4">
          <span className="h-px w-10 bg-neutral-400" />

          <p className="text-[10px] uppercase tracking-[0.32em] text-neutral-500 sm:text-xs">
            AS Academy
          </p>
        </div>

        <div className="flex flex-col justify-between gap-7 border-b border-neutral-300 pb-12 md:flex-row md:items-end lg:pb-16">
          <h1 className="font-serif text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-8xl">
            Planning
            <span className="mt-2 block italic">
              des formations.
            </span>
          </h1>

          <p className="max-w-md text-sm font-light leading-7 text-neutral-600 sm:text-base">
            Retrouvez toutes les dates, les villes et les
            disponibilités de nos prochaines formations.
            Choisissez votre session et réservez votre place
            en ligne.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-8">
          <p className="text-sm text-neutral-500">
            {visibleSessions.length} session(s)
          </p>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={showPast}
              onChange={(event) =>
                setShowPast(event.target.checked)
              }
              className="h-4 w-4 accent-[#171717]"
            />

            Afficher les sessions passées
          </label>
        </div>

        {loading && (
          <p className="py-16 text-center text-sm text-neutral-500">
            Chargement du planning...
          </p>
        )}

        {error && !loading && (
          <p className="py-16 text-center text-sm text-red-700">
            Impossible de charger le planning. Veuillez réessayer
            plus tard.
          </p>
        )}

        {!loading && !error && visibleSessions.length === 0 && (
          <p className="py-16 text-center text-sm text-neutral-500">
            Aucune session à afficher pour le moment.
          </p>
        )}

        {!loading && !error && visibleSessions.length > 0 && (
          <div className="border-t border-neutral-300">
            {visibleSessions.map(({ formation, day }) => {
              const status = (day.status ?? "").toLowerCase();

              const full =
                day.remaining_places <= 0 ||
                status === "full" ||
                status === "complet";

              const ended = isPastSession(day.end_date, today);

              const available =
                !full &&
                !ended &&
                status === "available";

              const params = new URLSearchParams();

              params.set("city", day.city);
              params.set("day", String(day.id));

              const bookingUrl =
                `/formations/${formation.slug}/reserver?${params.toString()}`;

              const formattedDeposit = formatPrice(depositAmount);

              return (
                <article
                  key={`${formation.id}-${day.id}`}
                  className="grid gap-6 border-b border-neutral-300 py-8 transition-colors hover:bg-white/60 sm:py-10 lg:grid-cols-12 lg:items-center lg:gap-8"
                >
                  <div className="lg:col-span-4">
                    <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                      {formation.title}
                    </p>

                    <h2 className="font-serif text-3xl sm:text-4xl">
                      {day.city}
                    </h2>
                  </div>

                  <div className="space-y-3 lg:col-span-4">
                    <p className="flex items-start gap-3 text-sm text-neutral-700">
                      <CalendarDays
                        size={17}
                        className="mt-0.5 shrink-0"
                      />

                      {formatDateRange(
                        day.start_date,
                        day.end_date
                      )}
                    </p>

                    <p className="flex items-center gap-3 text-sm text-neutral-500">
                      <MapPin size={17} />
                      {day.city}
                    </p>

                    <p className="flex items-center gap-3 text-sm text-neutral-500">
                      <Users size={17} />

                      {full
                        ? "Session complète"
                        : `${day.remaining_places} place(s) restante(s)`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-5 lg:col-span-4 lg:justify-end">
                    <div className="text-left lg:text-right">
                      {day.personal_price !== null && (
                        <p className="font-serif text-2xl">
                          {formatPrice(day.personal_price)}
                        </p>
                      )}

                      {day.cpf_eligible &&
                        day.cpf_price !== null && (
                          <p className="mt-1 text-xs text-neutral-500">
                            CPF : {formatPrice(day.cpf_price)}
                          </p>
                        )}

                      <p className="mt-1 text-xs text-neutral-500">
                        Acompte :{" "}
                        {settingsLoading
                          ? "Chargement..."
                          : formattedDeposit ?? "Indisponible"}
                      </p>
                    </div>

                    {available ? (
                      <Link
                        to={bookingUrl}
                        className="inline-flex items-center gap-3 border border-neutral-400 px-5 py-3 text-[10px] font-medium uppercase tracking-[0.18em] transition-colors hover:border-black hover:bg-black hover:text-white"
                      >
                        Réserver
                        <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <span className="border border-neutral-200 px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                        {ended
                          ? "Terminée"
                          : full
                            ? "Complet"
                            : "Indisponible"}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default PlanningPage;
