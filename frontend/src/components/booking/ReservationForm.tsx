import { useState, type FormEvent } from "react";

import type {
  Formation,
  FormationDay,
} from "@/types/formation";

import { Button } from "@/components/ui/Button";

// =========================================================
// PROPS
// =========================================================

interface ReservationFormProps {
  formation: Formation;
  formationDay?: FormationDay | null;
}

// =========================================================
// COMPONENT
// =========================================================

export function ReservationForm({
  formation,
  formationDay = null,
}: ReservationFormProps) {
  // =======================================================
  // STATE
  // =======================================================

  const [selectedDayId, setSelectedDayId] = useState<number | "">(
    formationDay?.id ?? ""
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =======================================================
  // FORMATION DAYS
  // =======================================================

  const days = Array.isArray(formation.formationDays)
    ? formation.formationDays
    : [];

  // =======================================================
  // SELECTED DAY
  // =======================================================

  const selectedDay =
    days.find((day) => day.id === Number(selectedDayId)) ??
    formationDay ??
    null;

  // =======================================================
  // DATE FORMAT
  // =======================================================

  function formatDate(date: string | null | undefined) {
    if (!date) {
      return "";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(parsed);
  }

  // =======================================================
  // PRICE
  // =======================================================

  function formatPrice(
    value: number | string | null | undefined
  ) {
    if (value === null || value === undefined || value === "") {
      return "Sur demande";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "Sur demande";
    }

    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(number);
  }

  // =======================================================
  // SUBMIT
  // =======================================================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!selectedDay) {
        throw new Error(
          "Veuillez sélectionner une date de formation."
        );
      }

      if (!firstName.trim()) {
        throw new Error("Veuillez renseigner votre prénom.");
      }

      if (!lastName.trim()) {
        throw new Error("Veuillez renseigner votre nom.");
      }

      if (!email.trim()) {
        throw new Error("Veuillez renseigner votre adresse email.");
      }

      if (!phone.trim()) {
        throw new Error("Veuillez renseigner votre numéro de téléphone.");
      }

      const API_URL = import.meta.env.VITE_API_URL;

      if (!API_URL) {
        throw new Error(
          "L'URL de l'API n'est pas configurée."
        );
      }

      // ===================================================
      // PAYLOAD
      // ===================================================

      const payload = {
        formation_id: formation.id,
        formation_day_id: selectedDay.id,

        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),

        postal_code: postalCode.trim(),
        city: city.trim(),

        message: message.trim(),
      };

      // ===================================================
      // API REQUEST
      // ===================================================

      const response = await fetch(
        `${API_URL}/reservations`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (data?.errors) {
          const firstError = Object.values(
            data.errors
          )
            .flat()
            .find(
              (value): value is string =>
                typeof value === "string"
            );

          throw new Error(
            firstError ??
              data.message ??
              "Impossible d'envoyer votre réservation."
          );
        }

        throw new Error(
          data?.message ??
            "Impossible d'envoyer votre réservation."
        );
      }

      setSuccess(true);

      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPostalCode("");
      setCity("");
      setMessage("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  // =======================================================
  // SUCCESS
  // =======================================================

  if (success) {
    return (
      <div className="border border-ink/10 bg-ivory p-8 md:p-10">
        <p className="label text-ink/50">
          Réservation envoyée
        </p>

        <h2 className="mt-4 font-serif text-3xl leading-tight">
          Merci pour votre demande.
        </h2>

        <p className="mt-5 max-w-xl text-sm font-light leading-relaxed text-ink/60">
          Votre demande de réservation a bien été
          enregistrée. L'académie vous contactera
          prochainement pour confirmer votre place.
        </p>

        <div className="mt-8 border-t border-ink/10 pt-6">
          <p className="text-sm text-ink/60">
            Formation
          </p>

          <p className="mt-1 font-serif text-xl">
            {formation.title}
          </p>

          {selectedDay && (
            <>
              <p className="mt-5 text-sm text-ink/60">
                Ville
              </p>

              <p className="mt-1 font-serif text-xl">
                {selectedDay.city}
              </p>
            </>
          )}
        </div>

        <div className="mt-8">
          <Button
            type="button"
            variant="dark"
            onClick={() => {
              setSuccess(false);
            }}
          >
            Nouvelle réservation
          </Button>
        </div>
      </div>
    );
  }

  // =======================================================
  // FORM
  // =======================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-ink/10 bg-ivory p-6 md:p-10"
    >
      {/* ===================================================
          FORMATION
      =================================================== */}

      <div className="border-b border-ink/10 pb-8">
        <p className="label text-ink/50">
          Votre réservation
        </p>

        <h2 className="mt-3 font-serif text-3xl leading-tight">
          {formation.title}
        </h2>

        {formation.programme && (
          <p className="mt-2 text-sm font-light text-ink/50">
            {formation.programme.name}
          </p>
        )}
      </div>

      {/* ===================================================
          FORMATION DAY
      =================================================== */}

      <div className="mt-8">
        <label
          htmlFor="formation-day"
          className="label text-[10px] text-ink/50"
        >
          Choisir une session
        </label>

        <select
          id="formation-day"
          value={selectedDayId}
          onChange={(event) => {
            setSelectedDayId(
              event.target.value
                ? Number(event.target.value)
                : ""
            );
          }}
          className="mt-3 w-full border border-ink/15 bg-white px-4 py-4 text-sm outline-none transition focus:border-ink"
          required
        >
          <option value="">
            Sélectionnez une session
          </option>

          {days.map((day) => {
            const isAvailable =
              day.remaining_places > 0 &&
              day.status !== "full" &&
              day.status !== "completed";

            return (
              <option
                key={day.id}
                value={day.id}
                disabled={!isAvailable}
              >
                {day.city} —{" "}
                {formatDate(day.start_date)}
                {day.end_date &&
                day.end_date !== day.start_date
                  ? ` → ${formatDate(day.end_date)}`
                  : ""}{" "}
                —{" "}
                {isAvailable
                  ? `${day.remaining_places} place${
                      day.remaining_places > 1
                        ? "s"
                        : ""
                    }`
                  : "Complet"}
              </option>
            );
          })}
        </select>
      </div>

      {/* ===================================================
          SELECTED SESSION SUMMARY
      =================================================== */}

      {selectedDay && (
        <div className="mt-6 border border-ink/10 bg-white p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="label text-[10px] text-ink/40">
                Ville
              </p>

              <p className="mt-1 font-serif text-xl">
                {selectedDay.city}
              </p>
            </div>

            <div>
              <p className="label text-[10px] text-ink/40">
                Dates
              </p>

              <p className="mt-1 font-serif text-xl">
                {formatDate(selectedDay.start_date)}

                {selectedDay.end_date &&
                selectedDay.end_date !==
                  selectedDay.start_date
                  ? ` → ${formatDate(
                      selectedDay.end_date
                    )}`
                  : ""}
              </p>
            </div>

            <div>
              <p className="label text-[10px] text-ink/40">
                Tarif
              </p>

              <p className="mt-1 font-serif text-xl">
                {formatPrice(
                  selectedDay.personal_price ??
                    formation.personal_price
                )}
              </p>
            </div>

            <div>
              <p className="label text-[10px] text-ink/40">
                Places disponibles
              </p>

              <p className="mt-1 font-serif text-xl">
                {selectedDay.remaining_places}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          PERSONAL INFORMATION
      =================================================== */}

      <div className="mt-10">
        <p className="label text-ink/50">
          Vos informations
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {/* First name */}

          <div>
            <label
              htmlFor="first-name"
              className="label text-[10px] text-ink/50"
            >
              Prénom *
            </label>

            <input
              id="first-name"
              type="text"
              value={firstName}
              onChange={(event) =>
                setFirstName(event.target.value)
              }
              autoComplete="given-name"
              required
              className="mt-2 w-full border-b border-ink/15 bg-transparent px-0 py-3 text-sm outline-none focus:border-ink"
            />
          </div>

          {/* Last name */}

          <div>
            <label
              htmlFor="last-name"
              className="label text-[10px] text-ink/50"
            >
              Nom *
            </label>

            <input
              id="last-name"
              type="text"
              value={lastName}
              onChange={(event) =>
                setLastName(event.target.value)
              }
              autoComplete="family-name"
              required
              className="mt-2 w-full border-b border-ink/15 bg-transparent px-0 py-3 text-sm outline-none focus:border-ink"
            />
          </div>

          {/* Email */}

          <div>
            <label
              htmlFor="email"
              className="label text-[10px] text-ink/50"
            >
              Email *
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
              className="mt-2 w-full border-b border-ink/15 bg-transparent px-0 py-3 text-sm outline-none focus:border-ink"
            />
          </div>

          {/* Phone */}

          <div>
            <label
              htmlFor="phone"
              className="label text-[10px] text-ink/50"
            >
              Téléphone *
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              autoComplete="tel"
              required
              className="mt-2 w-full border-b border-ink/15 bg-transparent px-0 py-3 text-sm outline-none focus:border-ink"
            />
          </div>

          {/* Postal code */}

          <div>
            <label
              htmlFor="postal-code"
              className="label text-[10px] text-ink/50"
            >
              Code postal
            </label>

            <input
              id="postal-code"
              type="text"
              value={postalCode}
              onChange={(event) =>
                setPostalCode(event.target.value)
              }
              autoComplete="postal-code"
              className="mt-2 w-full border-b border-ink/15 bg-transparent px-0 py-3 text-sm outline-none focus:border-ink"
            />
          </div>

          {/* City */}

          <div>
            <label
              htmlFor="city"
              className="label text-[10px] text-ink/50"
            >
              Ville
            </label>

            <input
              id="city"
              type="text"
              value={city}
              onChange={(event) =>
                setCity(event.target.value)
              }
              autoComplete="address-level2"
              className="mt-2 w-full border-b border-ink/15 bg-transparent px-0 py-3 text-sm outline-none focus:border-ink"
            />
          </div>
        </div>
      </div>

      {/* ===================================================
          MESSAGE
      =================================================== */}

      <div className="mt-8">
        <label
          htmlFor="message"
          className="label text-[10px] text-ink/50"
        >
          Message
        </label>

        <textarea
          id="message"
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          rows={5}
          placeholder="Une question ou une information complémentaire..."
          className="mt-3 w-full resize-none border border-ink/15 bg-white px-4 py-4 text-sm outline-none transition focus:border-ink"
        />
      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="mt-6 border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* ===================================================
          SUBMIT
      =================================================== */}

      <div className="mt-8 border-t border-ink/10 pt-8">
        <Button
          type="submit"
          variant="dark"
          size="lg"
          icon="arrow"
          disabled={loading || !selectedDay}
          className="w-full"
        >
          {loading
            ? "Envoi en cours..."
            : "Envoyer ma réservation"}
        </Button>

        <p className="mt-4 text-center text-xs font-light leading-relaxed text-ink/45">
          Aucun paiement en ligne n'est demandé ici.
          <br />
          Votre réservation sera confirmée par
          l'académie.
        </p>
      </div>
    </form>
  );
}

export default ReservationForm;