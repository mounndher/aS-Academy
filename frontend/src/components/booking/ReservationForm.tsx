import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";



import type { Formation } from "@/types/formation";



/* =========================================================

   TYPES

\========================================================= */



type FormationDay =

  Formation["formationDays"][number];



interface ReservationFormProps {

  formation: Formation;

  formationDay: FormationDay;

}



/* =========================================================

   SAFE DATE

\========================================================= */



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

\========================================================= */



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

\========================================================= */



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

\========================================================= */



export function ReservationForm({

  formation,

  formationDay,

}: ReservationFormProps) {



  /* =======================================================

     FORM STATE

  ======================================================= */



  const navigate = useNavigate();



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
     FORM SUBMIT — Laravel API
  ======================================================= */

  const [error, setError] = useState("");
  const [pricingType, setPricingType] = useState<"normal" | "cpf">("normal");
  const [paymentInstallments, setPaymentInstallments] = useState<1 | 2>(1);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState("");
  const [bankSettings, setBankSettings] = useState<{
    iban?: string | null;
    bic?: string | null;
    account_holder_address?: string | null;
    address?: string | null;
    city?: string | null;
    cancellation_policy?: string | null;
  } | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "");

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      if (!apiBaseUrl) {
        setSettingsError("L’URL de l’API est manquante.");
        setSettingsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/contenu/settings`, {
          headers: { Accept: "application/json" },
        });
        const result = await response.json();
        if (!response.ok || result?.success === false) {
          throw new Error(result?.message || `Erreur HTTP ${response.status}`);
        }
        if (!cancelled) {
          setBankSettings(result?.data?.contact ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setSettingsError(err instanceof Error ? err.message : "Impossible de charger les coordonnées bancaires.");
        }
      } finally {
        if (!cancelled) setSettingsLoading(false);
      }
    }

    void loadSettings();
    return () => { cancelled = true; };
  }, [apiBaseUrl]);

  useEffect(() => {
    if (!paymentProof) {
      setPaymentProofPreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(paymentProof);
    setPaymentProofPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [paymentProof]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!apiBaseUrl) {
      setError("L’URL de l’API est manquante. Vérifiez VITE_API_URL dans le fichier .env.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("formation_id", String(formation.id));
      formData.append("formation_day_id", String(formationDay.id));
      formData.append("first_name", firstName.trim());
      formData.append("last_name", lastName.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("address", address.trim());
      formData.append("postal_code", postalCode.trim());
      formData.append("city", customerCity.trim());
      if (message.trim()) formData.append("message", message.trim());
      formData.append("pricing_type", pricingType);
      formData.append("payment_installments", String(paymentInstallments));
      if (paymentProof) formData.append("payment_proof", paymentProof);

      const response = await fetch(`${apiBaseUrl}/reservations`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const validationErrors = data?.errors
          ? Object.values(data.errors).flat().join(" ")
          : "";
        throw new Error(
          validationErrors || data?.message || `Erreur HTTP ${response.status}. Impossible d’envoyer la réservation.`
        );
      }

      navigate("/reservation/confirmation", {
        state: {
          formationTitle: formation.title,
          city: formationDay.city || "À confirmer",
          startDate: formationDay.start_date || "",
          endDate: formationDay.end_date || formationDay.start_date || "",
          deposit: formatPrice(formation.deposit_amount),
          pricingType,
          paymentInstallments,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de contacter le serveur. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
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

            placeholder="vous\@exemple.com"

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
          PRICING TYPE / INSTALLMENTS
      ================================================= */}
      <section className="mt-8 border border-ink/10 bg-white p-5 md:p-6">
        <p className="label text-[10px] text-ink/45">Tarif et modalités de paiement</p>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="pricing_type" className="label text-[10px] text-ink/45">
              Type de financement
            </label>
            <select
              id="pricing_type"
              name="pricing_type"
              value={pricingType}
              onChange={(event) => setPricingType(event.target.value as "normal" | "cpf")}
              className="mt-3 w-full border border-ink/20 bg-white p-3 text-sm outline-none focus:border-ink"
            >
              <option value="normal">Tarif normal</option>
              <option value="cpf">Financement CPF</option>
            </select>
            <p className="mt-2 text-xs leading-relaxed text-ink/50">
              Le financement CPF est soumis à l’éligibilité de la session. Le serveur vérifiera cette condition.
            </p>
          </div>
          <div>
            <label htmlFor="payment_installments" className="label text-[10px] text-ink/45">
              Nombre de paiements
            </label>
            <select
              id="payment_installments"
              name="payment_installments"
              value={paymentInstallments}
              onChange={(event) => setPaymentInstallments(Number(event.target.value) as 1 | 2)}
              className="mt-3 w-full border border-ink/20 bg-white p-3 text-sm outline-none focus:border-ink"
            >
              <option value={1}>1 paiement</option>
              <option value={2}>2 paiements</option>
            </select>
          </div>
        </div>
      </section>

      {/* =================================================
          BANK TRANSFER DETAILS FROM SETTINGS API
      ================================================= */}
      <section className="mt-8 border border-ink/10 bg-white p-5 md:p-6" aria-labelledby="bank-details-title">
        <p id="bank-details-title" className="label text-[10px] text-ink/45">Paiement par virement bancaire</p>
        {settingsLoading ? (
          <p className="mt-4 text-sm text-ink/50">Chargement des coordonnées bancaires...</p>
        ) : bankSettings ? (
          <div className="mt-4 space-y-4 text-sm">
            {bankSettings.iban && <div><p className="text-xs text-ink/45">IBAN</p><p className="mt-1 break-all font-medium">{bankSettings.iban}</p></div>}
            {bankSettings.bic && <div><p className="text-xs text-ink/45">BIC / SWIFT</p><p className="mt-1 font-medium">{bankSettings.bic}</p></div>}
            {bankSettings.account_holder_address && <div><p className="text-xs text-ink/45">Titulaire du compte</p><p className="mt-1 whitespace-pre-line">{bankSettings.account_holder_address}</p></div>}
            {(bankSettings.address || bankSettings.city) && <div><p className="text-xs text-ink/45">Adresse de l’académie</p><p className="mt-1">{[bankSettings.address, bankSettings.city].filter(Boolean).join(", ")}</p></div>}
            {bankSettings.cancellation_policy && <p className="border-t border-ink/10 pt-4 text-xs leading-relaxed text-ink/60">{bankSettings.cancellation_policy}</p>}
          </div>
        ) : (
          <p role="alert" className="mt-4 text-sm text-red-600">{settingsError || "Les coordonnées bancaires ne sont pas disponibles."}</p>
        )}
      </section>

      {/* =================================================
          PAYMENT PROOF IMAGE
      ================================================= */}
      <div className="mt-7">
        <label htmlFor="payment_proof" className="label text-[10px] text-ink/45">Justificatif de paiement (image)</label>
        <p className="mt-2 text-xs leading-relaxed text-ink/50">Ajoutez une capture d’écran ou une photo du reçu de virement. Formats acceptés : JPG, PNG ou WEBP, 5 Mo maximum.</p>
        <input
          id="payment_proof"
          name="payment_proof"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            if (file && file.size > 5 * 1024 * 1024) {
              setError("L’image doit faire 5 Mo maximum.");
              event.target.value = "";
              setPaymentProof(null);
              return;
            }
            setError("");
            setPaymentProof(file);
          }}
          className="mt-3 block w-full border border-ink/15 bg-transparent p-3 text-sm file:mr-4 file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-wider file:text-white"
        />
        {paymentProofPreview && (
          <div className="mt-4">
            <p className="mb-2 text-xs text-ink/50">Aperçu du justificatif sélectionné</p>
            <img src={paymentProofPreview} alt="Aperçu du justificatif de paiement" className="max-h-72 max-w-full border border-ink/10 object-contain" />
            <p className="mt-2 break-all text-xs text-ink/50">{paymentProof?.name}</p>
            <button type="button" onClick={() => setPaymentProof(null)} className="mt-2 text-xs underline">Supprimer l’image</button>
          </div>
        )}
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



      {error && (
        <p role="alert" className="mt-6 text-sm text-red-600">
          {error}
        </p>
      )}

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