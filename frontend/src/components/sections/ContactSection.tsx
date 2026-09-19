import { Check, Mail, MapPin } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { cn } from "@/utils/cn";

import { getContactSection } from "@/services/api";
import type {
  ContactSection as ContactSectionType,
} from "@/types/contact";

import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";
import { Reveal } from "@/components/ui/Reveal";
import { sendContactMessage } from "@/services/api";
const inputCls =
  "w-full appearance-none rounded-none border-b border-ink/20 bg-transparent py-3 text-[15px] text-ink outline-none transition-colors duration-500 placeholder:text-ink/30 focus:border-ink";

export function ContactSection() {
  const [contact, setContact] =
    useState<ContactSectionType | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<
    "idle" | "sending" | "sent"
  >("idle");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const set =
    (key: keyof typeof form) =>
    (value: string) =>
      setForm((state) => ({
        ...state,
        [key]: value,
      }));

  /*
   * ------------------------------------------------------------
   * Load Contact API
   * ------------------------------------------------------------
   */

  useEffect(() => {
    const loadContact = async () => {
      try {
        const response = await getContactSection();

        if (response.success && response.data) {
          setContact(response.data);
        } else {
          setError(
            response.message ||
              "Aucune section Contact disponible."
          );
        }
      } catch (err) {
        console.error("Contact API error:", err);

        setError(
          "Impossible de charger la section Contact."
        );
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, []);

  /*
   * ------------------------------------------------------------
   * Form
   * ------------------------------------------------------------
   */

const submit = async (e: FormEvent) => {
  e.preventDefault();

  if (status !== "idle") return;

  setStatus("sending");

  try {
    const response = await sendContactMessage({
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone,
      message: form.message,
    });

    if (response.success) {
      setStatus("sent");
    } else {
      setStatus("idle");

      alert(
        response.message ||
          "Impossible d'envoyer votre message."
      );
    }
  } catch (error) {
    console.error("Contact form error:", error);

    setStatus("idle");

    alert(
      "Une erreur est survenue. Veuillez réessayer."
    );
  }
};
  /*
   * ------------------------------------------------------------
   * Loading
   * ------------------------------------------------------------
   */

  if (loading) {
    return (
      <section
        id="contact"
        className="scroll-mt-20 bg-ivory py-24 lg:py-40"
      >
        <div className="wrap flex min-h-[500px] items-center justify-center">
          <p className="label text-ink/40">
            Chargement...
          </p>
        </div>
      </section>
    );
  }

  /*
   * ------------------------------------------------------------
   * Error
   * ------------------------------------------------------------
   */

  if (error || !contact) {
    return (
      <section
        id="contact"
        className="scroll-mt-20 bg-ivory py-24 lg:py-40"
      >
        <div className="wrap flex min-h-[500px] items-center justify-center">
          <p className="text-sm text-ink/50">
            {error || "Section indisponible."}
          </p>
        </div>
      </section>
    );
  }

  /*
   * ------------------------------------------------------------
   * API DATA
   * ------------------------------------------------------------
   */

  const instagramLink =
    contact.instagram?.link || "#";

  const instagramHandle =
    contact.instagram?.handle || "";

  return (
    <section
      id="contact"
      className="scroll-mt-20 bg-ivory py-24 lg:py-40"
      aria-labelledby="contact-title"
    >
      <div className="wrap grid gap-14 lg:grid-cols-12 lg:gap-12">

        {/* =====================================================
            LEFT — CONTACT INFORMATION
        ===================================================== */}

        <div className="lg:col-span-5">

          {/* Eyebrow */}
          {contact.eyebrow && (
            <Reveal>
              <p className="label flex items-center gap-4 text-ink/50">
                <span className="h-px w-10 bg-current" />

                {contact.eyebrow}
              </p>
            </Reveal>
          )}

          {/* Headline */}
          <Headline
            lines={[
              contact.title,
              contact.subtitle && (
                <em
                  key="subtitle"
                  className="font-light normal-case italic tracking-normal"
                >
                  {contact.subtitle}
                </em>
              ),
              contact.heading,
            ].filter(
              (line): line is string | JSX.Element =>
                Boolean(line)
            )}
            className="mt-6 text-[clamp(2.5rem,7vw,5rem)]"
          />

          <span
            id="contact-title"
            className="sr-only"
          >
            {contact.title} {contact.subtitle}{" "}
            {contact.heading}
          </span>

          {/* Description */}
          {contact.description && (
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-md whitespace-pre-line text-base font-light leading-relaxed text-ink/60">
                {contact.description}
              </p>
            </Reveal>
          )}

          {/* =================================================
              CONTACT DETAILS
          ================================================= */}

          <Reveal delay={0.3}>
            <div className="mt-12 space-y-8 border-t border-ink/10 pt-10">

              {/* Address */}
              {(contact.address.label ||
                contact.address.line_1 ||
                contact.address.line_2 ||
                contact.address.cities) && (
                <div className="flex gap-4">

                  <MapPin
                    size={18}
                    strokeWidth={1.25}
                    className="mt-0.5 shrink-0 text-ink/50"
                  />

                  <div>

                    {contact.address.label && (
                      <p className="label text-[10px] text-ink/40">
                        {contact.address.label}
                      </p>
                    )}

                    {(contact.address.line_1 ||
                      contact.address.line_2) && (
                      <address className="mt-2 font-serif text-xl not-italic leading-snug">
                        {contact.address.line_1}

                        {contact.address.line_1 &&
                          contact.address.line_2 && (
                            <br />
                          )}

                        {contact.address.line_2}
                      </address>
                    )}

                    {contact.address.cities && (
                      <p className="mt-2 text-sm font-light text-ink/50">
                        {contact.address.cities}
                      </p>
                    )}

                  </div>
                </div>
              )}

              {/* Instagram */}
              {(contact.instagram.label ||
                instagramHandle) && (
                <div className="flex gap-4">

                  <Mail
                    size={18}
                    strokeWidth={1.25}
                    className="mt-0.5 shrink-0 text-ink/50"
                  />

                  <div>

                    {contact.instagram.label && (
                      <p className="label text-[10px] text-ink/40">
                        {contact.instagram.label}
                      </p>
                    )}

                    {instagramHandle && (
                      <a
                        href={instagramLink}
                        target="_blank"
                        rel="noreferrer"
                        className="link-line mt-2 inline-block font-serif text-xl"
                      >
                        {instagramHandle}
                      </a>
                    )}

                  </div>
                </div>
              )}

            </div>
          </Reveal>
        </div>

        {/* =====================================================
            RIGHT — FORM
        ===================================================== */}

        <div className="lg:col-span-6 lg:col-start-7">

          <Reveal delay={0.15}>

            {status === "sent" ? (

              /* =================================================
                 CONFIRMATION
              ================================================= */

              <div className="border border-ink/15 bg-white p-8 md:p-12">

                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ink/20">
                  <Check
                    size={22}
                    strokeWidth={1.25}
                  />
                </span>

                <p className="label mt-8 text-ink/50">
                  Confirmation
                </p>

                <h3 className="display mt-4 text-[clamp(2rem,6vw,3.25rem)]">
                  Message
                  <br />
                  envoyé
                </h3>

                <p className="mt-6 max-w-sm text-base font-light leading-relaxed text-ink/70">
                  Merci {form.firstName}. AS Academy vous
                  recontactera prochainement à{" "}
                  <span className="font-medium text-ink">
                    {form.email}
                  </span>
                  .
                </p>

                <p className="mt-4 text-xs font-light text-ink/40">
                  Démonstration : aucun e-mail n'a été
                  réellement envoyé.
                </p>

                {instagramHandle && (
                  <div className="mt-8">
                    <Button
                      variant="outline-dark"
                      href={instagramLink}
                      icon="external"
                    >
                      {instagramHandle}
                    </Button>
                  </div>
                )}

              </div>

            ) : (

              /* =================================================
                 FORM
              ================================================= */

              <form
                onSubmit={submit}
                className="border border-ink/15 bg-white p-6 sm:p-8 md:p-10"
              >

                <p className="label text-ink/50">
                  Écrire à AS Academy
                </p>

                <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">

                  {/* First name */}
                  <label className="block">
                    <span className="label block text-[10px] text-ink/50">
                      Prénom
                    </span>

                    <input
                      required
                      autoComplete="given-name"
                      className={inputCls}
                      value={form.firstName}
                      onChange={(e) =>
                        set("firstName")(e.target.value)
                      }
                      placeholder="Votre prénom"
                    />
                  </label>

                  {/* Last name */}
                  <label className="block">
                    <span className="label block text-[10px] text-ink/50">
                      Nom
                    </span>

                    <input
                      required
                      autoComplete="family-name"
                      className={inputCls}
                      value={form.lastName}
                      onChange={(e) =>
                        set("lastName")(e.target.value)
                      }
                      placeholder="Votre nom"
                    />
                  </label>

                  {/* Email */}
                  <label className="block">
                    <span className="label block text-[10px] text-ink/50">
                      Email
                    </span>

                    <input
                      required
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      className={inputCls}
                      value={form.email}
                      onChange={(e) =>
                        set("email")(e.target.value)
                      }
                      placeholder="vous@exemple.com"
                    />
                  </label>

                  {/* Phone */}
                  <label className="block">
                    <span className="label block text-[10px] text-ink/50">
                      Téléphone
                    </span>

                    <input
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      className={inputCls}
                      value={form.phone}
                      onChange={(e) =>
                        set("phone")(e.target.value)
                      }
                      placeholder="06 00 00 00 00"
                    />
                  </label>

                  {/* Message */}
                  <label className="block sm:col-span-2">
                    <span className="label block text-[10px] text-ink/50">
                      Message
                    </span>

                    <textarea
                      required
                      rows={4}
                      className={cn(
                        inputCls,
                        "resize-none"
                      )}
                      value={form.message}
                      onChange={(e) =>
                        set("message")(e.target.value)
                      }
                      placeholder="Votre message…"
                    />
                  </label>

                </div>

                {/* Submit */}
                <div className="mt-10 flex flex-col gap-4 border-t border-ink/15 pt-8 sm:flex-row sm:items-center sm:justify-between">

                  <Button
                    type="submit"
                    variant="dark"
                    size="lg"
                    className="w-full sm:w-auto"
                    disabled={status === "sending"}
                  >
                    {status === "sending"
                      ? "Envoi en cours…"
                      : "Envoyer mon message"}
                  </Button>

                  <p className="text-[10px] uppercase tracking-[0.22em] text-ink/40">
                    Réponse sous quelques jours
                  </p>

                </div>
              </form>
            )}

          </Reveal>
        </div>

      </div>
    </section>
  );
}