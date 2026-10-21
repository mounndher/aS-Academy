import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eur } from "@/data/formations";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/* =========================================================
   TYPES
========================================================= */

interface FormationDay {
  id: number;
  city: string;
  start_date: string;
  end_date: string;
  personal_price: string | null;
  cpf_eligible: boolean;
  cpf_price: string | null;
  max_places: number;
  remaining_places: number;
  status: string;
}

interface Formation {
  id: number;
  title: string;
  slug: string;
}

interface PaymentSettingsResponse {
  success?: boolean;
  data?: {
    payment?: {
      deposit_amount?: number | string | null;
    };
  };
}

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_URL = String(import.meta.env.VITE_API_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

const SETTINGS_URL = `${API_URL}/contenu/settings`;

/* =========================================================
   DATE HELPERS
========================================================= */

function parseLocalDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
    );
  }

  return new Date(value);
}

function formatDate(date: string): string {
  const parsedDate = parseLocalDate(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date à confirmer";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function formatDateRange(start: string, end: string): string {
  const startDate = parseLocalDate(start);
  const endDate = parseLocalDate(end);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return "Dates à confirmer";
  }

  if (startDate.getTime() === endDate.getTime()) {
    return formatDate(start);
  }

  return `${formatDate(start)} – ${formatDate(end)}`;
}

/* =========================================================
   PRICE
========================================================= */

function Price({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-2.5 sm:block sm:border-0 sm:py-0">
      <dt className="label text-[10px] leading-snug text-ink/45">
        {label}
      </dt>

      <dd className="font-serif text-2xl leading-none sm:mt-3">
        {value}
      </dd>
    </div>
  );
}

/* =========================================================
   SESSION CARD
========================================================= */

export function SessionCard({
  formation,
  day,
  index,
}: {
  formation: Formation;
  day: FormationDay;
  index: number;
}) {
  const [depositAmount, setDepositAmount] = useState<
    number | string | null
  >(null);

  const [depositLoading, setDepositLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPaymentSettings() {
      if (!API_URL) {
        console.error("VITE_API_URL n'est pas configurée.");
        setDepositLoading(false);
        return;
      }

      try {
        const response = await fetch(SETTINGS_URL, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur API : ${response.status}`);
        }

        const result: PaymentSettingsResponse =
          await response.json();

        if (result.success !== true) {
          throw new Error(
            "Impossible de récupérer les paramètres de paiement.",
          );
        }

        const amount = result.data?.payment?.deposit_amount;

        if (
          amount !== null &&
          amount !== undefined &&
          amount !== "" &&
          Number.isFinite(Number(amount)) &&
          Number(amount) >= 0
        ) {
          setDepositAmount(amount);
        } else {
          setDepositAmount(null);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name !== "AbortError"
        ) {
          console.error(
            "Erreur lors du chargement de l'acompte :",
            error,
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setDepositLoading(false);
        }
      }
    }

    void fetchPaymentSettings();

    return () => controller.abort();
  }, []);

  const to =
    `/formations/${formation.slug}` +
    `?city=${encodeURIComponent(day.city)}` +
    `&day=${encodeURIComponent(String(day.id))}`;

  const status = (day.status ?? "").toLowerCase();

  const isFull =
    Number(day.remaining_places) <= 0 ||
    status === "full" ||
    status === "complet";

  const canReserve =
    !isFull &&
    status === "available" &&
    Number(day.remaining_places) > 0;

  return (
    <Reveal delay={index * 0.08} y={24}>
      <article className="group relative -mx-4 grid gap-7 border-b border-ink/15 px-4 py-9 transition-colors duration-700 hover:bg-white/80 lg:-mx-6 lg:grid-cols-12 lg:items-center lg:gap-6 lg:px-6 lg:py-11">
        <div className="lg:col-span-3">
          <p className="label text-[10px] text-ink/35">
            {formation.title}
          </p>

          <h3 className="display mt-2 text-[clamp(2.25rem,7vw,3rem)]">
            <Link
              to={to}
              className="transition-opacity duration-500 hover:opacity-60"
            >
              {day.city}
            </Link>
          </h3>
        </div>

        <div className="lg:col-span-3">
          <p className="font-serif text-lg leading-relaxed sm:text-xl">
            {formatDateRange(day.start_date, day.end_date)}
          </p>

          <p className="label mt-2.5 text-ink/50">
            {isFull
              ? "0 place restante"
              : `${day.remaining_places} place(s) restante(s)`}
          </p>
        </div>

        <dl className="grid grid-cols-1 gap-x-6 sm:grid-cols-3 lg:col-span-4">
          {day.personal_price !== null && (
            <Price
              label="Financement personnel"
              value={eur(Number(day.personal_price))}
            />
          )}

          {day.cpf_eligible && day.cpf_price !== null && (
            <Price
              label="Financement CPF"
              value={eur(Number(day.cpf_price))}
            />
          )}

          <Price
            label="Acompte"
            value={
              depositLoading
                ? "Chargement..."
                : depositAmount !== null
                  ? eur(Number(depositAmount))
                  : "Indisponible"
            }
          />
        </dl>

        <div className="lg:col-span-2 lg:text-right">
          {canReserve ? (
            <Button
              to={`${to}#reservation`}
              variant="outline-dark"
              icon="arrow"
              className="w-full sm:w-auto"
            >
              Réserver
            </Button>
          ) : (
            <span className="inline-block border border-ink/15 px-4 py-3 text-xs uppercase tracking-wider text-ink/50">
              {isFull ? "Complet" : "Indisponible"}
            </span>
          )}
        </div>
      </article>
    </Reveal>
  );
}