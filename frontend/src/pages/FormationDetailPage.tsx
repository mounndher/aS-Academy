import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import { useFormation } from "@/hooks/useFormation";
import { ReservationForm } from "@/components/booking/ReservationForm";

interface FormationDay {
  id: number;
  formation_id: number;

  city: string;

  start_date: string | null;
  end_date: string | null;

  image?: string | null;

  personal_price: number | string | null;

  cpf_eligible: boolean;
  cpf_price: number | string | null;

  max_places: number;
  remaining_places: number;

  status: string;
}

interface FormationProgramme {
  id: number;
  name: string;
  slug: string;

  description: string | null;

  duration: string | null;

  is_active: boolean;
}

interface FormationStep {
  title: string;
  description?: string;
}

interface Formation {
  id: number;

  programme_id: number | null;
  programme: FormationProgramme | null;

  title: string;
  slug: string;

  description: string | null;

  steps: FormationStep[];

  image: string | null;

  pdf_program: string | null;

  deposit_amount: number | string | null;

  personal_price: number | string | null;

  has_sale: boolean;

  sale_price: number | string | null;

  installment_enabled: boolean;

  installment_count: number | null;

  is_active: boolean;

  formationDays: FormationDay[];
}

/* ============================================================
   SAFE HELPERS
============================================================ */

function isValidDate(value: unknown): boolean {
  if (!value) return false;

  const date = new Date(String(value));

  return !Number.isNaN(date.getTime());
}

function safeDate(value: unknown): Date | null {
  if (!isValidDate(value)) {
    return null;
  }

  return new Date(String(value));
}

function formatDate(value: unknown): string {
  const date = safeDate(value);

  if (!date) {
    return "Date à confirmer";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateShort(value: unknown): string {
  const date = safeDate(value);

  if (!date) {
    return "Date à confirmer";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
  }).format(date);
}

function formatDateRange(
  startDate: unknown,
  endDate: unknown
): string {
  const start = safeDate(startDate);
  const end = safeDate(endDate);

  if (!start && !end) {
    return "Dates à confirmer";
  }

  if (start && !end) {
    return formatDateShort(start);
  }

  if (!start && end) {
    return formatDateShort(end);
  }

  if (!start || !end) {
    return "Dates à confirmer";
  }

  const startDay = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
  }).format(start);

  const endFormatted = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
  }).format(end);

  return `${startDay} — ${endFormatted}`;
}

function formatPrice(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "—";
  }

  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(number)} €`;
}

function getSessionPrice(
  formation: Formation,
  session: FormationDay
): number | string | null {
  if (
    formation.has_sale &&
    formation.sale_price !== null &&
    formation.sale_price !== undefined
  ) {
    return formation.sale_price;
  }

  if (
    session.personal_price !== null &&
    session.personal_price !== undefined
  ) {
    return session.personal_price;
  }

  return formation.personal_price;
}

function getStatus(session: FormationDay): string {
  const remaining = Number(session.remaining_places ?? 0);

  if (remaining <= 0) {
    return "COMPLET";
  }

  if (
    session.status &&
    String(session.status).toLowerCase() === "completed"
  ) {
    return "TERMINÉE";
  }

  return "DISPONIBLE";
}

/* ============================================================
   MAIN PAGE
============================================================ */

export function FormationDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const [searchParams, setSearchParams] = useSearchParams();

  const { formation, loading, error } = useFormation(slug || "");

  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);

  /*
   * ----------------------------------------------------------
   * NORMALIZE FORMATION
   * ----------------------------------------------------------
   */

  const currentFormation = formation as Formation | null;

  /*
   * ----------------------------------------------------------
   * SESSIONS
   * ----------------------------------------------------------
   */

  const sessions = useMemo<FormationDay[]>(() => {
    if (!currentFormation) {
      return [];
    }

    if (!Array.isArray(currentFormation.formationDays)) {
      return [];
    }

    return currentFormation.formationDays;
  }, [currentFormation]);

  /*
   * ----------------------------------------------------------
   * SELECT SESSION FROM URL
   *
   * Example:
   * #/formations/formation-extension-de-cils?city=Paris&day=1
   *
   * or:
   *
   * #/formations/formation-extension-de-cils?dayId=12
   * ----------------------------------------------------------
   */

  useEffect(() => {
    if (!sessions.length) {
      setSelectedDayId(null);
      return;
    }

    const dayIdParam =
      searchParams.get("dayId") ||
      searchParams.get("day");

    if (dayIdParam) {
      const parsed = Number(dayIdParam);

      if (!Number.isNaN(parsed)) {
        const found = sessions.find(
          (session) => session.id === parsed
        );

        if (found) {
          setSelectedDayId(found.id);
          return;
        }
      }
    }

    const cityParam = searchParams.get("city");

    if (cityParam) {
      const citySession = sessions.find(
        (session) =>
          String(session.city).toLowerCase() ===
          String(cityParam).toLowerCase()
      );

      if (citySession) {
        setSelectedDayId(citySession.id);
        return;
      }
    }

    setSelectedDayId(null);
  }, [sessions, searchParams]);

  /*
   * ----------------------------------------------------------
   * SELECTED SESSION
   * ----------------------------------------------------------
   */

  const selectedDay = useMemo(() => {
    if (!selectedDayId) {
      return null;
    }

    return (
      sessions.find(
        (session) => session.id === selectedDayId
      ) || null
    );
  }, [sessions, selectedDayId]);

  /*
   * ----------------------------------------------------------
   * SELECT SESSION
   * ----------------------------------------------------------
   */

  function handleSelectSession(session: FormationDay) {
    const status = getStatus(session);

    if (status !== "DISPONIBLE") {
      return;
    }

    setSelectedDayId(session.id);

    setSearchParams({
      dayId: String(session.id),
    });

    /*
     * Scroll to reservation section after selecting.
     */
    window.setTimeout(() => {
      document
        .getElementById("reservation")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  /*
   * ----------------------------------------------------------
   * LOADING
   * ----------------------------------------------------------
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory text-ink">
        <section className="mx-auto max-w-7xl px-6 py-32 md:px-10">
          <div className="h-4 w-32 animate-pulse bg-black/5" />

          <div className="mt-10 h-20 w-2/3 animate-pulse bg-black/5" />

          <div className="mt-8 h-5 w-1/2 animate-pulse bg-black/5" />
        </section>
      </main>
    );
  }

  /*
   * ----------------------------------------------------------
   * ERROR
   * ----------------------------------------------------------
   */

  if (error || !currentFormation) {
    return (
      <main className="min-h-screen bg-ivory text-ink">
        <section className="mx-auto max-w-7xl px-6 py-32 md:px-10">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/50">
            Formation
          </p>

          <h1 className="mt-6 font-serif text-5xl md:text-7xl">
            Formation introuvable
          </h1>

          <Link
            to="/formations"
            className="mt-10 inline-block border border-ink px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
          >
            Toutes les formations
          </Link>
        </section>
      </main>
    );
  }

  /*
   * ----------------------------------------------------------
   * FORMATION DATA
   * ----------------------------------------------------------
   */

  const programme = currentFormation.programme;

  const steps = Array.isArray(currentFormation.steps)
    ? currentFormation.steps
    : [];

  /*
   * ----------------------------------------------------------
   * HERO IMAGE
   * ----------------------------------------------------------
   */

  const image =
    currentFormation.image ||
    sessions.find((session) => session.image)?.image ||
    null;

  return (
    <main className="bg-ivory text-ink">
      {/* ======================================================
          HERO
      ======================================================= */}

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-32 md:px-10 md:pb-28 md:pt-40">
        <div className="grid items-end gap-12 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.35em] text-ink/45">
              <span className="h-px w-8 bg-ink/40" />
              Formation
            </div>

            <h1 className="mt-8 max-w-3xl font-serif text-6xl leading-[0.9] md:text-8xl">
              {currentFormation.title}
            </h1>

            {currentFormation.description && (
              <p className="mt-10 max-w-xl text-base leading-8 text-ink/65">
                {currentFormation.description}
              </p>
            )}
          </div>

          {image && (
            <div className="overflow-hidden">
              <img
                src={image}
                alt={currentFormation.title}
                className="h-[420px] w-full object-cover md:h-[560px]"
              />
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          FORMATION INFORMATION
      ======================================================= */}

      <section className="border-y border-ink/10">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-ink/45">
                Formation
              </div>

              <h2 className="mt-5 font-serif text-4xl md:text-5xl">
                {currentFormation.title}
              </h2>
            </div>

            <div className="space-y-0">
              <InfoRow
                label="Durée"
                value={programme?.duration || "À confirmer"}
              />

              <InfoRow
                label="Tarif"
                value={formatPrice(
                  currentFormation.personal_price
                )}
              />

              {currentFormation.deposit_amount !== null &&
                currentFormation.deposit_amount !== undefined && (
                  <InfoRow
                    label="Acompte"
                    value={formatPrice(
                      currentFormation.deposit_amount
                    )}
                  />
                )}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          PROGRAMME
          FIRST BEFORE SESSIONS
      ======================================================= */}

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-32">
        <div className="grid gap-16 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.35em] text-ink/45">
              <span className="h-px w-8 bg-ink/40" />
              Programme
            </div>

            <h2 className="mt-7 font-serif text-5xl leading-[0.95] md:text-7xl">
              Le programme
            </h2>

            {programme?.description && (
              <p className="mt-8 max-w-md text-sm leading-7 text-ink/60">
                {programme.description}
              </p>
            )}

            {currentFormation.pdf_program && (
              <a
                href={currentFormation.pdf_program}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-block border border-ink px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.25em] transition-opacity hover:opacity-60"
              >
                Télécharger le programme
              </a>
            )}
          </div>

          <div>
            {steps.length > 0 ? (
              <div className="border-t border-ink/10">
                {steps.map((step, index) => (
                  <div
                    key={`${step.title}-${index}`}
                    className="grid gap-6 border-b border-ink/10 py-8 md:grid-cols-[70px_1fr]"
                  >
                    <span className="text-xs tracking-[0.2em] text-ink/40">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <h3 className="font-serif text-2xl">
                        {step.title}
                      </h3>

                      {step.description && (
                        <p className="mt-3 max-w-xl text-sm leading-7 text-ink/60">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-t border-ink/10 py-8 text-sm text-ink/50">
                Programme détaillé à venir.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================
          SESSIONS DISPONIBLES
      ======================================================= */}

      <section
        id="sessions"
        className="border-t border-ink/10"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="text-[10px] uppercase tracking-[0.35em] text-ink/45">
            Sessions disponibles
          </div>

          <h2 className="mt-7 font-serif text-6xl uppercase leading-none md:text-8xl">
            {sessions.length > 0
              ? Array.from(
                  new Set(
                    sessions.map((session) =>
                      String(session.city || "À définir").toUpperCase()
                    )
                  )
                ).join(" · ")
              : "Sessions"}
          </h2>

          {sessions.length === 0 ? (
            <div className="mt-16 border-y border-ink/10 py-12 text-sm text-ink/50">
              Aucune session disponible pour le moment.
            </div>
          ) : (
            <div className="mt-16 border-t border-ink/10">
              {sessions.map((session, index) => {
                const status = getStatus(session);

                const price = getSessionPrice(
                  currentFormation,
                  session
                );

                const isSelected =
                  selectedDayId === session.id;

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                    }}
                    className={`grid gap-8 border-b border-ink/10 py-10 md:grid-cols-[1fr_auto_auto] md:items-center ${
                      isSelected ? "bg-ink/[0.025]" : ""
                    }`}
                  >
                    {/* SESSION */}
                    <div>
                      <div className="font-serif text-2xl md:text-3xl">
                        {session.city || "Ville à confirmer"}
                      </div>

                      <div className="mt-3 text-sm text-ink/60">
                        {formatDateRange(
                          session.start_date,
                          session.end_date
                        )}
                      </div>

                      <div className="mt-2 text-sm text-ink/50">
                        {Number(session.remaining_places ?? 0)}{" "}
                        place
                        {Number(
                          session.remaining_places ?? 0
                        ) > 1
                          ? "s"
                          : ""}{" "}
                        restante
                        {Number(
                          session.remaining_places ?? 0
                        ) > 1
                          ? "s"
                          : ""}
                      </div>
                    </div>

                    {/* PRICE */}
                    <div className="text-right">
                      <div className="font-serif text-xl">
                        {formatPrice(price)}
                      </div>

                      {session.cpf_eligible && (
                        <div className="mt-2 text-xs text-ink/50">
                          CPF{" "}
                          {formatPrice(
                            session.cpf_price
                          )}
                        </div>
                      )}

                      {currentFormation.deposit_amount !==
                        null &&
                        currentFormation.deposit_amount !==
                          undefined && (
                          <div className="mt-1 text-xs text-ink/50">
                            Acompte{" "}
                            {formatPrice(
                              currentFormation.deposit_amount
                            )}
                          </div>
                        )}
                    </div>

                    {/* BUTTON */}
                    <div className="md:pl-4">
                      <button
                        type="button"
                        disabled={status !== "DISPONIBLE"}
                        onClick={() =>
                          handleSelectSession(session)
                        }
                        className={`min-w-[145px] border px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all ${
                          status === "DISPONIBLE"
                            ? isSelected
                              ? "bg-ink text-white"
                              : "border-ink hover:bg-ink hover:text-white"
                            : "cursor-not-allowed border-ink/20 text-ink/30"
                        }`}
                      >
                        {isSelected
                          ? "Sélectionnée"
                          : status === "DISPONIBLE"
                            ? "Réserver"
                            : status}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          RESERVATION
          ONLY AFTER SESSION SELECTION
      ======================================================= */}

      {selectedDay && (
        <section
          id="reservation"
          className="border-t border-ink/10"
        >
          <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
            <div className="grid gap-16 lg:grid-cols-[0.75fr_1.25fr]">
              {/* LEFT SIDE */}
              <div>
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.35em] text-ink/45">
                  <span className="h-px w-8 bg-ink/40" />
                  Réservation
                </div>

                <h2 className="mt-7 font-serif text-6xl leading-[0.9] md:text-8xl">
                  Réserver
                  <br />
                  ma place
                </h2>

                <p className="mt-8 max-w-md text-sm leading-7 text-ink/60">
                  Remplissez vos coordonnées pour
                  réserver votre place auprès de
                  l'académie.
                </p>

                {/* SELECTED SESSION */}
                <div className="mt-12 border-t border-ink/10">
                  <div className="border-b border-ink/10 py-7">
                    <div className="text-[9px] uppercase tracking-[0.3em] text-ink/45">
                      Session sélectionnée
                    </div>

                    <div className="mt-5 font-serif text-2xl">
                      {selectedDay.city}
                    </div>

                    <div className="mt-2 text-sm text-ink/60">
                      {formatDateRange(
                        selectedDay.start_date,
                        selectedDay.end_date
                      )}
                    </div>
                  </div>

                  <div className="border-b border-ink/10 py-7">
                    <ReservationInfoRow
                      label="Tarif"
                      value={formatPrice(
                        getSessionPrice(
                          currentFormation,
                          selectedDay
                        )
                      )}
                    />

                    <ReservationInfoRow
                      label="Places"
                      value={`${Number(
                        selectedDay.remaining_places ?? 0
                      )} restantes`}
                    />

                    <ReservationInfoRow
                      label="Acompte"
                      value={formatPrice(
                        currentFormation.deposit_amount
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="min-w-0">
                <ReservationForm
                  formationDay={selectedDay}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          BACK
      ======================================================= */}

      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
          <Link
            to="/formations"
            className="text-[10px] uppercase tracking-[0.35em] text-ink/50 transition-opacity hover:opacity-60"
          >
            ← Toutes les formations
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   SMALL COMPONENTS
============================================================ */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-ink/10 py-5">
      <span className="text-[9px] uppercase tracking-[0.3em] text-ink/45">
        {label}
      </span>

      <span className="font-serif text-lg text-right">
        {value}
      </span>
    </div>
  );
}

function ReservationInfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[9px] uppercase tracking-[0.3em] text-ink/45">
        {label}
      </span>

      <span className="font-serif text-lg">
        {value}
      </span>
    </div>
  );
}

export default FormationDetailPage;