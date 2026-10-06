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
   SAFE DATE
========================================================= */

function parseDate(
  value: unknown
): Date | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(
      value.getTime()
    )
      ? null
      : value;
  }

  const raw =
    String(value).trim();

  if (!raw) {
    return null;
  }

  /*
   * YYYY-MM-DD
   */

  const match =
    raw.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (match) {
    const year =
      Number(match[1]);

    const month =
      Number(match[2]);

    const day =
      Number(match[3]);

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return null;
    }

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (
      date.getFullYear() !==
        year ||
      date.getMonth() !==
        month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  const parsed =
    new Date(raw);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return null;
  }

  return parsed;
}

/* =========================================================
   SAFE DATE RANGE
========================================================= */

function formatDateRange(
  start: unknown,
  end: unknown
): string {
  const startDate =
    parseDate(start);

  const endDate =
    parseDate(end);

  if (
    !startDate &&
    !endDate
  ) {
    return "Dates à confirmer";
  }

  if (
    startDate &&
    !endDate
  ) {
    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "numeric",
        month: "long",
      }
    ).format(startDate);
  }

  if (
    !startDate ||
    !endDate
  ) {
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
    startMonth ===
      endMonth &&
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

  const number =
    Number(price);

  if (
    Number.isNaN(number)
  ) {
    return `${String(price)} €`;
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

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    firstName,
    setFirstName,
  ] = useState("");

  const [
    lastName,
    setLastName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    address,
    setAddress,
  ] = useState("");

  const [
    postalCode,
    setPostalCode,
  ] = useState("");

  const [
    customerCity,
    setCustomerCity,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  /* =======================================================
     FORM SUBMIT

     Currently frontend confirmation.
     
     You can connect this to Laravel later.
  ======================================================= */

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);

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
      <div className="border border-ink/10 bg-[#faf9f6] p-8 md:p-10">

        <p className="label text-ink/45">
          Réservation
        </p>

        <h2 className="display mt-6 text-4xl md:text-5xl">
          Merci pour votre demande.
        </h2>

        <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink/60">
          Votre demande de réservation
          a bien été envoyée. L'académie
          vous contactera pour confirmer
          votre inscription.
        </p>

        <div className="mt-8 border-t border-ink/10 pt-6">

          <div className="flex items-center justify-between gap-6 py-3">

            <span className="label text-[10px] text-ink/45">
              Formation
            </span>

            <span className="text-right font-serif text-lg">
              {formation.title}
            </span>

          </div>

          <div className="flex items-center justify-between gap-6 border-t border-ink/10 py-3">

            <span className="label text-[10px] text-ink/45">
              Ville
            </span>

            <span className="font-serif text-lg">
              {formationDay.city ||
                "À confirmer"}
            </span>

          </div>

          <div className="flex items-center justify-between gap-6 border-t border-ink/10 py-3">

            <span className="label text-[10px] text-ink/45">
              Dates
            </span>

            <span className="text-right font-serif text-lg">
              {formatDateRange(
                formationDay.start_date,
                formationDay.end_date
              )}
            </span>

          </div>

        </div>

      </div>
    );
  }

  /* =======================================================
     FORM
  ======================================================= */

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-ink/15 bg-[#faf9f6] p-7 md:p-10"
    >

      {/* =================================================
          TITLE
      ================================================= */}

      <p className="label text-ink/45">
        Vos coordonnées
      </p>

      {/* =================================================
          SELECTED SESSION
      ================================================= */}

      <div className="mt-6 border border-ink/10 bg-white p-5">

        <p className="label text-[10px] text-ink/40">
          Session sélectionnée
        </p>

        <p className="mt-3 font-serif text-xl">
          {formationDay.city ||
            "Ville à confirmer"}
        </p>

        <p className="mt-1 text-sm text-ink/55">
          {formatDateRange(
            formationDay.start_date,
            formationDay.end_date
          )}
        </p>

        <div className="mt-4 border-t border-ink/10 pt-4">

          <div className="flex items-center justify-between gap-5">

            <span className="label text-[10px] text-ink/40">
              Places disponibles
            </span>

            <span className="text-sm">
              {Number(
                formationDay.remaining_places
              ) || 0}
            </span>

          </div>

        </div>

      </div>

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
            value={firstName}
            onChange={(event) =>
              setFirstName(
                event.target.value
              )
            }
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
            value={lastName}
            onChange={(event) =>
              setLastName(
                event.target.value
              )
            }
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
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
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
            value={phone}
            onChange={(event) =>
              setPhone(
                event.target.value
              )
            }
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
          value={address}
          onChange={(event) =>
            setAddress(
              event.target.value
            )
          }
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
            value={postalCode}
            onChange={(event) =>
              setPostalCode(
                event.target.value
              )
            }
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
            value={customerCity}
            onChange={(event) =>
              setCustomerCity(
                event.target.value
              )
            }
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
          value={message}
          onChange={(event) =>
            setMessage(
              event.target.value
            )
          }
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
          className="inline-flex min-h-[52px] w-full items-center justify-center bg-[#111111] px-8 text-xs font-medium uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Envoi..."
            : "Envoyer"}
        </button>

      </div>

    </form>
  );
}

export default ReservationForm;