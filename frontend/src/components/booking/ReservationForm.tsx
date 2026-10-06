import {
  FormEvent,
  useState,
} from "react";

import type {
  Formation,
  FormationDay,
} from "@/types/formation";

interface ReservationFormProps {
  formation: Formation;
  formationDay: FormationDay;
}

// =========================================================
// SAFE DATE
// =========================================================

function parseSafeDate(
  value: string | null | undefined
): Date | null {
  if (!value) {
    return null;
  }

  const clean = String(value).trim();

  if (!clean) {
    return null;
  }

  const match = clean.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
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
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }

    return null;
  }

  const parsed = new Date(clean);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

// =========================================================
// DATE RANGE
// =========================================================

function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  const startDate = parseSafeDate(start);
  const endDate = parseSafeDate(end);

  if (!startDate && !endDate) {
    return "Dates à venir";
  }

  if (!startDate) {
    return endDate
      ? formatDate(end)
      : "Dates à venir";
  }

  if (!endDate) {
    return formatDate(start);
  }

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  const startMonth = new Intl.DateTimeFormat(
    "fr-FR",
    { month: "long" }
  ).format(startDate);

  const endMonth = new Intl.DateTimeFormat(
    "fr-FR",
    { month: "long" }
  ).format(endDate);

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  if (
    startMonth === endMonth &&
    startYear === endYear
  ) {
    return `${startDay} — ${endDay} ${endMonth}`;
  }

  if (startYear === endYear) {
    return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
  }

  return `${startDay} ${startMonth} ${startYear} — ${endDay} ${endMonth} ${endYear}`;
}

// =========================================================
// SINGLE DATE
// =========================================================

function formatDate(
  value: string | null | undefined
): string {
  const date = parseSafeDate(value);

  if (!date) {
    return "Date à venir";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// =========================================================
// PRICE
// =========================================================

function formatPrice(
  price: number | string | null | undefined
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

// =========================================================
// COMPONENT
// =========================================================

export function ReservationForm({
  formation,
  formationDay,
}: ReservationFormProps) {
  const [submitted, setSubmitted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // =======================================================
  // SUBMIT
  // =======================================================

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);

    // Front-end demo for now.
    // Connect your Laravel reservation API here.
    window.setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 500);
  }

  // =======================================================
  // SUCCESS
  // =======================================================

  if (submitted) {
    return (
      <main className="bg-[#f8f7f4] px-6 py-20 md:px-10 lg:px-20">
        <div className="mx-auto max-w-7xl">

          <div className="max-w-2xl border border-ink/10 p-10 md:p-14">

            <p className="label text-ink/45">
              Réservation
            </p>

            <h1 className="display mt-6 text-5xl">
              Merci pour votre demande.
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink/60">
              Votre demande de réservation
              a bien été envoyée.
              L'académie vous contactera
              pour confirmer votre inscription.
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

  // =======================================================
  // FORM
  // =======================================================

  return (
    <main className="bg-[#f8f7f4] px-6 py-16 md:px-10 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">

        {/* =================================================
            LEFT
        ================================================= */}

        <div>

          <p className="label flex items-center gap-4 text-ink/50">
            <span className="h-px w-10 bg-current" />
            Réservation
          </p>

          <h2 className="display mt-5 text-[clamp(3rem,6vw,5.5rem)] leading-[0.9]">
            Réserver
            <br />
            ma place
          </h2>

          <p className="mt-7 max-w-md text-sm font-light leading-relaxed text-ink/60">
            Remplissez vos coordonnées
            pour réserver votre place
            auprès de l'académie.
          </p>

          {/* =================================================
              SELECTED SESSION
          ================================================= */}

          <div className="mt-10 border-t border-ink/10">

            <div className="border-b border-ink/10 py-5">

              <p className="label text-[10px] text-ink/45">
                Session sélectionnée
              </p>

              <p className="mt-4 font-serif text-2xl">
                {formationDay.city}
              </p>

              <p className="mt-2 text-sm text-ink/55">
                {formatDateRange(
                  formationDay.start_date,
                  formationDay.end_date
                )}
              </p>

            </div>

            {/* FORMATION */}

            <div className="flex items-center justify-between border-b border-ink/10 py-5">

              <span className="label text-[10px] text-ink/45">
                Formation
              </span>

              <span className="max-w-[220px] text-right font-serif text-base">
                {formation.title}
              </span>

            </div>

            {/* PRICE */}

            <div className="flex items-center justify-between border-b border-ink/10 py-5">

              <span className="label text-[10px] text-ink/45">
                Tarif
              </span>

              <span className="font-serif text-xl">
                {formatPrice(
                  formationDay.personal_price ??
                    formation.personal_price
                )}
              </span>

            </div>

            {/* PLACES */}

            <div className="flex items-center justify-between border-b border-ink/10 py-5">

              <span className="label text-[10px] text-ink/45">
                Places
              </span>

              <span className="font-serif text-base">
                {Number(
                  formationDay.remaining_places
                ) > 0
                  ? `${formationDay.remaining_places} restante${
                      Number(
                        formationDay.remaining_places
                      ) > 1
                        ? "s"
                        : ""
                    }`
                  : "Complet"}
              </span>

            </div>

            {/* DEPOSIT */}

            <div className="flex items-center justify-between border-b border-ink/10 py-5">

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
                className="mt-3 w-full border-b border-ink/20 bg-transparent px-0 pb-3 text-sm outline-none placeholder:text-ink/30 focus:border-ink"
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
                className="mt-3 w-full border-b border-ink/20 bg-transparent px-0 pb-3 text-sm outline-none placeholder:text-ink/30 focus:border-ink"
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
                className="mt-3 w-full border-b border-ink/20 bg-transparent px-0 pb-3 text-sm outline-none placeholder:text-ink/30 focus:border-ink"
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
                className="mt-3 w-full border-b border-ink/20 bg-transparent px-0 pb-3 text-sm outline-none placeholder:text-ink/30 focus:border-ink"
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
              className="mt-3 w-full border-b border-ink/20 bg-transparent px-0 pb-3 text-sm outline-none placeholder:text-ink/30 focus:border-ink"
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
                className="mt-3 w-full border-b border-ink/20 bg-transparent px-0 pb-3 text-sm outline-none placeholder:text-ink/30 focus:border-ink"
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
                className="mt-3 w-full border-b border-ink/20 bg-transparent px-0 pb-3 text-sm outline-none placeholder:text-ink/30 focus:border-ink"
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
              className="mt-3 w-full resize-none border border-ink/15 bg-transparent p-4 text-sm outline-none placeholder:text-ink/30 focus:border-ink"
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
                  formation.deposit_amount
                )}
              </span>

            </div>

          </div>

          {/* PAYMENT */}

          <div className="mt-6">

            <div className="border border-ink/15 bg-[#111111] px-5 py-4 text-sm text-white">
              <span className="font-medium">
                Paiement par PayPal
              </span>
            </div>

            <p className="mt-3 border border-ink/10 p-4 text-xs leading-relaxed text-ink/55">
              En validant, vous pourrez régler
              l'acompte demandé. Le solde
              sera réglé auprès de l'académie.
            </p>

          </div>

          {/* SUBMIT */}

          <div className="mt-8 border-t border-ink/10 pt-6">

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[52px] items-center justify-center bg-[#111111] px-8 text-xs font-medium uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Envoi..."
                : `Payer ${formatPrice(
                    formation.deposit_amount
                  )} `}
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}

export default ReservationForm;