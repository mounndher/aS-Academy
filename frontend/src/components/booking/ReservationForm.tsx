import { Check } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { DEPOSIT, dateLabel, eur, isScheduled, type Formation } from "@/data/formations";
import type { Programme } from "@/data/programmes";
import { scrollToId } from "@/lib/scroll";
import { Button } from "@/components/ui/Button";

/**
 * Simple reservation form — FRONTEND DEMO ONLY.
 * Coordonnées (Prénom, Nom, Email, Téléphone, Adresse, Code postal, Ville)
 * + paiement de l'acompte de 150 € par PayPal.
 * Formations sans dates : mêmes coordonnées + date souhaitée, sans paiement.
 * No payment is processed — submit shows a confirmation state.
 */
type Status = "idle" | "processing" | "done";

const inputCls =
  "w-full appearance-none rounded-none border-b border-ink/20 bg-transparent py-3 text-[15px] text-ink outline-none transition-colors duration-500 placeholder:text-ink/30 focus:border-ink";

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="label block text-[10px] text-ink/50">{label}</span>
      {children}
    </label>
  );
}

function PayPalMark({ className }: { className?: string }) {
  return (
    <span
      aria-label="PayPal"
      className={cn("font-sans text-[15px] font-bold italic normal-case leading-none tracking-tight", className)}
    >
      Pay<span className="font-medium">Pal</span>
    </span>
  );
}

export function ReservationForm({ formation: f, programme: p }: { formation: Formation; programme: Programme }) {
  const payable = isScheduled(f) && !!f.pricing;
  const deposit = f.pricing?.deposit ?? DEPOSIT;

  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
    wish: "",
  });

  const set = (k: keyof typeof form) => (v: string) => setForm((s) => ({ ...s, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("processing");
    window.setTimeout(() => {
      setStatus("done");
      scrollToId("reservation");
    }, 1200);
  };

  /* ---------- Confirmation ---------- */
  if (status === "done") {
    return (
      <div className="border border-ink/15 bg-ivory p-8 md:p-12">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ink/20">
          <Check size={22} strokeWidth={1.25} />
        </span>
        <p className="label mt-8 text-ink/50">Confirmation</p>
        <h3 className="display mt-4 text-[clamp(2.25rem,7vw,3.75rem)]">
          {payable ? (
            <>
              Réservation
              <br />
              confirmée
            </>
          ) : (
            <>
              Demande
              <br />
              envoyée
            </>
          )}
        </h3>
        <p className="mt-6 max-w-md text-base font-light leading-relaxed text-ink/70">
          Merci {form.firstName}.{" "}
          {payable
            ? `Votre acompte de ${eur(deposit)} a bien été enregistré par PayPal pour la formation `
            : "Votre demande a bien été enregistrée pour la formation "}
          <span className="font-medium text-ink">
            {p.title} — {f.city}
            {isScheduled(f) ? `, ${dateLabel(f)}` : form.wish ? ` (${form.wish})` : ""}
          </span>
          .
        </p>
        <p className="mt-3 max-w-md text-base font-light leading-relaxed text-ink/70">
          AS Academy vous confirmera votre inscription à{" "}
          <span className="font-medium text-ink">{form.email}</span>.
        </p>
        <p className="mt-5 text-xs font-light text-ink/40">
          Démonstration : aucun paiement réel n'a été effectué.
        </p>
        <div className="mt-10">
          <Button to="/formations" variant="dark" icon="arrow">
            Toutes les formations
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- Form ---------- */
  return (
    <form onSubmit={submit} className="border border-ink/15 bg-ivory p-6 sm:p-8 md:p-10">
      <p className="label text-ink/50">Vos coordonnées</p>
      <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <Field label="Prénom">
          <input
            required
            autoComplete="given-name"
            className={inputCls}
            value={form.firstName}
            onChange={(e) => set("firstName")(e.target.value)}
            placeholder="Votre prénom"
          />
        </Field>
        <Field label="Nom">
          <input
            required
            autoComplete="family-name"
            className={inputCls}
            value={form.lastName}
            onChange={(e) => set("lastName")(e.target.value)}
            placeholder="Votre nom"
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            autoComplete="email"
            inputMode="email"
            className={inputCls}
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder="vous@exemple.com"
          />
        </Field>
        <Field label="Téléphone">
          <input
            required
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className={inputCls}
            value={form.phone}
            onChange={(e) => set("phone")(e.target.value)}
            placeholder="06 00 00 00 00"
          />
        </Field>
        <Field label="Adresse" className="sm:col-span-2">
          <input
            required
            autoComplete="street-address"
            className={inputCls}
            value={form.address}
            onChange={(e) => set("address")(e.target.value)}
            placeholder="Numéro et rue"
          />
        </Field>
        <Field label="Code postal">
          <input
            required
            autoComplete="postal-code"
            inputMode="numeric"
            className={inputCls}
            value={form.postalCode}
            onChange={(e) => set("postalCode")(e.target.value)}
            placeholder="33400"
          />
        </Field>
        <Field label="Ville">
          <input
            required
            autoComplete="address-level2"
            className={inputCls}
            value={form.city}
            onChange={(e) => set("city")(e.target.value)}
            placeholder="Votre ville"
          />
        </Field>
        {!payable && (
          <Field label="Date ou période souhaitée" className="sm:col-span-2">
            <input
              required
              className={inputCls}
              value={form.wish}
              onChange={(e) => set("wish")(e.target.value)}
              placeholder="Ex. : mi-octobre, un week-end de novembre…"
            />
          </Field>
        )}
      </div>

      {payable && (
        <>
          {/* Acompte 150 € — PayPal uniquement */}
          <div className="mt-12 border-t border-ink/15 pt-8">
            <div className="flex items-baseline justify-between gap-4">
              <p className="label text-ink/50">Acompte à régler</p>
              <p className="font-serif text-4xl leading-none">{eur(deposit)}</p>
            </div>

            <div className="mt-6 flex items-center gap-3 border border-ink bg-ink px-5 py-4 text-ivory">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-ivory bg-ivory text-ink">
                <Check size={13} strokeWidth={2.2} />
              </span>
              <span className="font-serif text-lg">
                Paiement par <PayPalMark className="text-[19px] text-ivory" />
              </span>
            </div>

            <p className="mt-4 border border-ink/15 bg-white px-5 py-4 text-sm font-light leading-relaxed text-ink/60">
              En validant, vous serez redirigée vers PayPal pour régler l'acompte de{" "}
              {eur(deposit)}, puis ramenée sur AS Academy pour la confirmation. Le solde est
              réglé auprès de l'académie.
            </p>
          </div>
        </>
      )}

      <div className="mt-10 flex flex-col gap-4 border-t border-ink/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" variant="dark" size="lg" className="w-full sm:w-auto" disabled={status !== "idle"}>
          {status === "processing" ? (
            "Traitement en cours…"
          ) : !payable ? (
            "Envoyer ma demande"
          ) : (
            <>
              Payer {eur(deposit)} avec <PayPalMark className="text-ivory" />
            </>
          )}
        </Button>
        <p className="text-[10px] uppercase tracking-[0.22em] text-ink/40">
          {payable ? "Paiement PayPal · Démonstration" : "Sans engagement"}
        </p>
      </div>
    </form>
  );
}
