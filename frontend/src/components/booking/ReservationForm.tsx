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
   DATE FORMATTER
   Safe against null / invalid dates.
========================================================= */

function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  if (!start || !end) {
    return "Dates à confirmer";
  }

  const parseDate = (
    value: string
  ): Date | null => {
    const clean = value.trim();

    if (!clean) {
      return null;
    }

    const match = clean.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);

      const date = new Date(
        year,
        month - 1,
        day
      );

      if (
        Number.isNaN(date.getTime())
      ) {
        return null;
      }

      return date;
    }

    const date = new Date(clean);

    if (
      Number.isNaN(date.getTime())
    ) {
      return null;
    }

    return date;
  };

  const startDate = parseDate(start);
  const endDate = parseDate(end);

  if (!startDate || !endDate) {
    return "Dates à confirmer";
  }

  const startDay =
    startDate.getDate();

  const endDay =
    endDate.getDate();

  const startMonth =
    new Intl.DateTimeFormat(
      "fr-FR",
      {
        month: "long",
      }
    ).format(startDate);

  const endMonth =
    new Intl.DateTimeFormat(
      "fr-FR",
      {
        month: "long",
      }
    ).format(endDate);

  const startYear =
    startDate.getFullYear();

  const endYear =
    endDate.getFullYear();

  if (
    startMonth === endMonth &&
    startYear === endYear
  ) {
    return `${startDay} — ${endDay} ${endMonth}`;
  }

  if (
    startYear === endYear
  ) {
    return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
  }

  return `${startDay} ${startMonth} ${startYear} — ${endDay} ${endMonth} ${endYear}`;
}

/* =========================================================
   PRICE
========================================================= */

function formatPrice(
  price:
    | number
    | string
    | null
    | undefined
): string {
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

  return `${number.toLocaleString(
    "fr-FR"
  )} €`;
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
     SUBMIT
  ======================================================= */

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);

    /*
     * Front-end only for now.
     *
     * Later you can connect this to:
     *
     * POST /api/reservations
     *
     * Laravel.
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
      <div className="wrap">

        <div className="max-w-3xl border border-ink/10 p-10 md:p-14">

          <p className="label text-ink/45">
            Réservation
          </p>

          <h2 className="display mt-6 text-4xl md:text-6xl">
            Merci pour votre demande.
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink/60">
            Votre demande de réservation a
            bien été envoyée. L'académie vous
            contactera pour confirmer votre
            inscription.
          </p>

          <div className="mt-10 border-t border-ink/10 pt-7">

            <p className="font-serif text-2xl">
              {formation.title}
            </p>

            <p className="mt-3 text-sm text-ink/55">
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
    );
  }

  /* =======================================================
     FORM
  ======================================================= */

  return (
    <div className="wrap">

      <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">

        {/* =================================================
            LEFT SUMMARY
        ================================================= */}

        <div>

          <div className="flex items-center gap-4">
            <span className="h-px w-7 bg-ink/50" />

            <p className="label text-ink/45">
              Réservation
            </p>
          </div>

          <h2 className="display mt-6 text-[clamp(3rem,6vw,5.5rem)] leading-[0.9]">
            Réserver
            <br />
            ma place
          </h2>

          <p className="mt-7 max-w-md text-sm font-light leading-relaxed text-ink/60">
            Remplissez vos coordonnées et
            envoyez votre demande de réservation
            auprès de l'académie.
          </p>

          {/* SUMMARY */}

          <div className="mt-10">

            {/* FORMATION */}

            <div className="flex items-center justify-between border-t border-ink/10 py-4">

              <span className="label text-[10px] text-ink/45">
                Formation
              </span>

              <span className="max-w-[55%] text-right font-serif text-base">
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

              <span className="max-w-[60%] text-right font-serif text-base">
                {formatDateRange(
                  formationDay.start_date,
                  formationDay.end_date
                )}
              </span>

            </div>

            {/* PRICE */}

            <div className="flex items-center justify-between border-t border-ink/10 py-4">

              <span className="label text-[10px] text-ink/45">
                Tarif
              </span>

              <span className="font-serif text-base">
                {formatPrice(
                  formationDay.personal_price ??
                    formation.personal_price
                )}
              </span>

            </div>

            {/* CPF */}

            {formationDay.cpf_eligible &&
              formationDay.cpf_price !==
                null &&
              formationDay.cpf_price !==
                undefined &&
              formationDay.cpf_price !==
                "" && (
                <div className="flex items-center justify-between border-t border-ink/10 py-4">

                  <span className="label text-[10px] text-ink/45">
                    CPF
                  </span>

                  <span className="font-serif text-base">
                    {formatPrice(
                      formationDay.cpf_price
                    )}
                  </span>

                </div>
              )}

            {/* DEPOSIT */}

            <div className="flex items-center justify-between border-b border-t border-ink/10 py-5">

              <span className="label text-[10px] text-ink/45">
                Acompte
              </span>

              <span className="font-serif text-2xl">
                {formatPrice(
                  formation.deposit_amount ??
                    150
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

          {/* NAME */}

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

          {/* EMAIL / PHONE */}

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

          {/* ADDRESS */}

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

          {/* POSTAL / CITY */}

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

          {/* MESSAGE */}

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

          {/* DEPOSIT */}

          <div className="mt-8 border-t border-ink/10 pt-6">

            <div className="flex items-center justify-between">

              <span className="label text-[10px] text-ink/45">
                Acompte à régler
              </span>

              <span className="font-serif text-2xl">
                {formatPrice(
                  formation.deposit_amount ??
                    150
                )}
              </span>

            </div>

          </div>

          {/* SEND */}

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
    </div>
  );
}

export default ReservationForm;