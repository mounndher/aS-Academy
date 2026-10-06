import {
  FormEvent,
  useState,
} from "react";

import type { Formation } from "@/types/formation";

/* =========================================================
   TYPES
========================================================= */

type FormationDay =
  Formation["formationDays"][number];

interface ReservationFormProps {
  formation: Formation;
  formationDay: FormationDay;
}

/* =========================================================
   HELPERS
========================================================= */

function formatDateRange(
  start: string,
  end: string
) {
  if (!start) return "";

  const startParts = start.split("-");
  const endParts = end?.split("-");

  if (
    startParts.length !== 3 ||
    !endParts ||
    endParts.length !== 3
  ) {
    return `${start} — ${end}`;
  }

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

  const startMonthName =
    new Intl.DateTimeFormat("fr-FR", {
      month: "long",
    }).format(startDate);

  const endMonthName =
    new Intl.DateTimeFormat("fr-FR", {
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
   COMPONENT
========================================================= */

export function ReservationForm({
  formation,
  formationDay,
}: ReservationFormProps) {
  const [submitted, setSubmitted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  /* =======================================================
     FORM SUBMIT
  ======================================================= */

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);

    /*
     * Front-end reservation for now.
     *
     * You can connect this to your Laravel
     * reservation API later.
     */

    window.setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 500);
  }

  /* =======================================================
     SUCCESS
  ======================================================= */

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] px-6 py-20 md:px-10 lg:px-20">
        <div className="mx-auto max-w-7xl">

          <div className="max-w-2xl border border-ink/10 p-10">

            <p className="label text-ink/45">
              Réservation
            </p>

            <h1 className="display mt-6 text-5xl">
              Merci pour votre demande.
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink/60">
              Votre demande de réservation a
              bien été envoyée. L'académie vous
              contactera pour confirmer votre
              inscription.
            </p>

            <div className="mt-8 border-t border-ink/10 pt-6">

              <p className="font-serif text-xl">
                {formation.title}
              </p>

              <p className="mt-2 text-sm text-ink/55">
                {formationDay.city}
              </p>

              <p className="mt-1 text-sm text-ink/55">
                {formatDateRange(
                  formationDay.start_date,
                  formationDay.end_date
                )}
              </p>

            </div>

          </div>

        </div>
      </main>
    );
  }

  /* =======================================================
     FORM
  ======================================================= */

  return (
    <main className="bg-[#f8f7f4] px-6 py-16 md:px-10 lg:px-20 lg:py-20">

      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">

        {/* =================================================
            LEFT
        ================================================= */}

        <div>

          <p className="label text-ink/45">
            Réservation
          </p>

          <h1 className="display mt-5 text-[clamp(3rem,6vw,5.5rem)] leading-[0.9]">
            Réserver
            <br />
            ma place
          </h1>

          <p className="mt-7 max-w-md text-sm font-light leading-relaxed text-ink/60">
            Remplissez vos coordonnées pour
            envoyer votre demande de réservation
            auprès de l'académie.
          </p>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="mt-10">

            {/* FORMATION */}

            <div className="flex items-center justify-between border-t border-ink/10 py-4">
              <span className="label text-[10px] text-ink/45">
                Formation
              </span>

              <span className="font-serif text-base">
                {formation.title}
              </span>
            </div>

            {/* CITY */}

            <div className="flex items-center justify-between border-t border-ink/10 py-4">
              <span className="label text-[10px] text-ink/45">
                Ville
              </span>

              <span className="font-serif text-base">
                {formationDay.city}
              </span>
            </div>

            {/* DATES */}

            <div className="flex items-center justify-between border-t border-ink/10 py-4">
              <span className="label text-[10px] text-ink/45">
                Dates
              </span>

              <span className="font-serif text-base text-right">
                {formatDateRange(
                  formationDay.start_date,
                  formationDay.end_date
                )}
              </span>
            </div>

            {/* PERSONAL PRICE */}

            <div className="flex items-center justify-between border-t border-ink/10 py-4">
              <span className="label text-[10px] text-ink/45">
                Financement personnel
              </span>

              <span className="font-serif text-base">
                {formatPrice(
                  formationDay.personal_price ??
                    formation.personal_price
                )}
              </span>
            </div>

            {/* CPF */}

            {formationDay.cpf_eligible && (
              <div className="flex items-center justify-between border-t border-ink/10 py-4">
                <span className="label text-[10px] text-ink/45">
                  Financement CPF
                </span>

                <span className="font-serif text-base">
                  {formatPrice(
                    formationDay.cpf_price
                  )}
                </span>
              </div>
            )}

            {/* DEPOSIT */}

            <div className="flex items-center justify-between border-b border-t border-ink/10 py-4">
              <span className="label text-[10px] text-ink/45">
                Acompte
              </span>

              <span className="font-serif text-xl">
                {formatPrice(
                  formation.deposit_amount
                )}
              </span>
            </div>

          </div>

        </div>

        {/* =================================================
            RIGHT FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="border border-ink/15 bg-[#faf9f6] p-7 md:p-10"
        >

          <p className="label text-ink/45">
            Vos coordonnées
          </p>

          {/* =================================================
              NAME
          ================================================= */}

          <div className="mt-8 grid gap-7 md:grid-cols-2">

            <div>
              <label
                htmlFor="first_name"
                className="label text-[10px] text-ink/45"
              >
                Prénom
              </label>

              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                placeholder="Votre prénom"
                className="mt-3 w-full border-b border-ink/20 bg-transparent px-0 pb-3 text-sm outline-none transition-colors placeholder:text-ink/30 focus:border-ink"
              />
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="label text-[10px] text-ink/45"
              >
                Nom
              </label>

              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                placeholder="Votre nom"
                className="mt-3 w-full border-b border-ink/20 bg-transparent px-0 pb-3 text-sm outline-none transition-colors placeholder:text-ink/30 focus:border-ink"
              />
            </div>

          </div>

          {/* =================================================
              EMAIL / PHONE
          ================================================= */}

          <div className="mt-7 grid gap-7 md:grid-cols-2">

            <div>
              <label
                htmlFor="email"
                className="label text-[10px] text-ink/45"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="vous@exemple.com"
                className="mt-3 w-full border-b border-ink/20 bg-transparent px-0 pb-3 text-sm outline-none transition-colors placeholder:text-ink/30 focus:border-ink"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="label text-[10px] text-ink/45"
              >
                Téléphone
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="06 00 00 00 00"
                className="mt-3 w-full border-b border-ink/20 bg-transparent px-0 pb-3 text-sm outline-none transition-colors placeholder:text-ink/30 focus:border-ink"
              />
            </div>

          </div>

          {/* =================================================
              ADDRESS
          ================================================= */}

          <div className="mt-7">

            <label
              htmlFor="address"
              className="label text-[10px] text-ink/45"
            >
              Adresse
            </label>

            <input
              id="address"
              name="address"
              type="text"
              required
              placeholder="Numéro et rue"
              className="mt-3 w-full border-b border-ink/20 bg-transparent px-0 pb-3 text-sm outline-none transition-colors placeholder:text-ink/30 focus:border-ink"
            />

          </div>

          {/* =================================================
              POSTAL / CITY
          ================================================= */}

          <div className="mt-7 grid gap-7 md:grid-cols-2">

            <div>
              <label
                htmlFor="postal_code"
                className="label text-[10px] text-ink/45"
              >
                Code postal
              </label>

              <input
                id="postal_code"
                name="postal_code"
                type="text"
                required
                placeholder="75000"
                className="mt-3 w-full border-b border-ink/20 bg-transparent px-0 pb-3 text-sm outline-none transition-colors placeholder:text-ink/30 focus:border-ink"
              />
            </div>

            <div>
              <label
                htmlFor="customer_city"
                className="label text-[10px] text-ink/45"
              >
                Ville
              </label>

              <input
                id="customer_city"
                name="customer_city"
                type="text"
                required
                placeholder="Votre ville"
                className="mt-3 w-full border-b border-ink/20 bg-transparent px-0 pb-3 text-sm outline-none transition-colors placeholder:text-ink/30 focus:border-ink"
              />
            </div>

          </div>

          {/* =================================================
              MESSAGE
          ================================================= */}

          <div className="mt-7">

            <label
              htmlFor="message"
              className="label text-[10px] text-ink/45"
            >
              Message
            </label>

            <textarea
              id="message"
              name="message"
              rows={5}
              placeholder="Une question ou une information complémentaire..."
              className="mt-3 w-full resize-none border border-ink/15 bg-transparent p-4 text-sm outline-none transition-colors placeholder:text-ink/30 focus:border-ink"
            />

          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="mt-8 border-t border-ink/10 pt-6">

            <div className="flex items-center justify-between">

              <span className="label text-[10px] text-ink/45">
                Acompte
              </span>

              <span className="font-serif text-2xl">
                {formatPrice(
                  formation.deposit_amount
                )}
              </span>

            </div>

          </div>

          {/* =================================================
              SEND
          ================================================= */}

          <div className="mt-8 border-t border-ink/10 pt-6">

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[52px] items-center justify-center bg-[#111111] px-8 text-xs font-medium uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Envoi..."
                : "Envoyer"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}

export default ReservationForm;