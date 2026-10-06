import { useParams, Link, useLocation } from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";

import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";
import { Meta } from "@/components/sections/FormationCard";

/* =========================================================
   HELPERS
========================================================= */

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

  return `${Number(price).toLocaleString("fr-FR")} €`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateRange(
  start: string,
  end: string
) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startDay = startDate.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
    }
  );

  const endDay = endDate.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
    }
  );

  const startMonth = startDate.toLocaleDateString(
    "fr-FR",
    {
      month: "long",
    }
  );

  const endMonth = endDate.toLocaleDateString(
    "fr-FR",
    {
      month: "long",
    }
  );

  if (startMonth === endMonth) {
    return `${startDay} — ${endDay} ${endMonth}`;
  }

  return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
}

/* =========================================================
   PAGE
========================================================= */

export function FormationDetailPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const location = useLocation();

  /* =======================================================
     LOAD FORMATION
  ======================================================= */

  const {
    data: formation,
    loading,
    error,
  } = useFormation(slug);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="bg-white py-32">
        <div className="wrap">
          <p className="text-sm text-ink/50">
            Chargement de la formation...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !formation) {
    return (
      <main className="bg-white py-32">
        <div className="wrap">
          <p className="text-sm text-red-500">
            {error ?? "Formation introuvable."}
          </p>

          <div className="mt-8">
            <Button
              to="/formations"
              variant="dark"
              icon="arrow"
            >
              Retour aux formations
            </Button>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     FORMATION DATA
  ======================================================= */

  const programme = formation.programme;

  const days = Array.isArray(
    formation.formationDays
  )
    ? formation.formationDays
    : [];

  /*
   * IMPORTANT:
   *
   * We DO NOT use only one formationDay.
   *
   * The detail page displays ALL sessions.
   *
   * Example:
   *
   * Paris      → 10-12 September
   * Toulouse   → 17-19 September
   * Bruxelles  → 1-3 October
   * Bordeaux   → 10-12 October
   */

  /* =======================================================
     RESERVATION STATE
  ======================================================= */

  const reserveState = {
    scrollTo: "reservation",
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="bg-white">

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="py-20 lg:py-32">
        <div className="wrap">

          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">

            {/* IMAGE */}

            <Reveal>
              {formation.image ? (
                <ImageReveal
                  src={formation.image}
                  alt={formation.title}
                  className="aspect-[4/5] w-full"
                />
              ) : (
                <div className="aspect-[4/5] w-full bg-ink/5" />
              )}
            </Reveal>

            {/* CONTENT */}

            <div className="lg:pt-10">

              <Reveal>

                <p className="label text-ink/40">
                  {programme?.name ??
                    "Formation"}
                </p>

                <h1 className="display mt-5 text-[clamp(3rem,7vw,6rem)] leading-[0.95]">
                  {formation.title}
                </h1>

                {programme?.duration && (
                  <p className="mt-6 font-serif text-2xl text-ink/60">
                    {programme.duration}
                  </p>
                )}

              </Reveal>

              {/* DESCRIPTION */}

              {formation.description && (
                <Reveal delay={0.1}>
                  <div
                    className="prose prose-sm mt-10 max-w-xl font-light leading-relaxed text-ink/65"
                    dangerouslySetInnerHTML={{
                      __html:
                        formation.description,
                    }}
                  />
                </Reveal>
              )}

              {/* PRICE */}

              <Reveal delay={0.15}>

                <dl className="mt-10 grid grid-cols-2 border-t border-ink/10 sm:grid-cols-3">

                  <Meta
                    label="Durée"
                    value={
                      programme?.duration ??
                      "À définir"
                    }
                  />

                  <Meta
                    label="Acompte"
                    value={formatPrice(
                      formation.deposit_amount
                    )}
                    sub="PayPal"
                  />

                  {formation.installment_enabled && (
                    <Meta
                      label="Paiement"
                      value="Paiement en plusieurs fois"
                      sub={
                        formation.installment_count
                          ? `${formation.installment_count} fois`
                          : undefined
                      }
                      className="col-span-2 sm:col-span-1"
                    />
                  )}

                </dl>

              </Reveal>

            </div>
          </div>

        </div>
      </section>

      {/* ===================================================
          SESSIONS / VILLES
      =================================================== */}

      <section
        id="sessions"
        className="border-t border-ink/10 bg-[#f8f7f4] py-20 lg:py-32"
      >
        <div className="wrap">

          <Reveal>

            <div className="flex flex-col gap-4 border-b border-ink/10 pb-6 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p className="label text-ink/40">
                  Calendrier
                </p>

                <h2 className="display mt-3 text-4xl md:text-5xl">
                  Prochaines sessions
                </h2>
              </div>

              <p className="max-w-sm text-sm font-light leading-relaxed text-ink/50">
                Choisissez la ville et la date
                qui vous conviennent.
              </p>

            </div>

          </Reveal>

          {/* =================================================
              NO SESSIONS
          ================================================= */}

          {days.length === 0 ? (

            <div className="mt-14 border border-ink/10 bg-white p-8">
              <p className="text-sm text-ink/50">
                Aucune session disponible
                actuellement.
              </p>
            </div>

          ) : (

            /* =================================================
               ALL SESSIONS
            ================================================= */

            <div className="mt-14 grid gap-6 lg:grid-cols-2">

              {days.map((day, index) => {

                const available =
                  day.status === "available" &&
                  day.remaining_places > 0;

                return (
                  <Reveal
                    key={day.id}
                    delay={index * 0.05}
                  >

                    <article className="border border-ink/10 bg-white p-6 md:p-8">

                      {/* CITY */}

                      <div className="flex items-start justify-between gap-6">

                        <div>

                          <p className="label text-ink/40">
                            Session {String(
                              index + 1
                            ).padStart(2, "0")}
                          </p>

                          <h3 className="display mt-2 text-4xl md:text-5xl">
                            {day.city}
                          </h3>

                        </div>

                        {/* STATUS */}

                        <span
                          className={
                            available
                              ? "text-xs uppercase tracking-[0.15em] text-emerald-700"
                              : "text-xs uppercase tracking-[0.15em] text-ink/40"
                          }
                        >
                          {available
                            ? "Disponible"
                            : "Complet"}
                        </span>

                      </div>

                      {/* DATE */}

                      <p className="mt-6 font-serif text-2xl text-ink/70">
                        {formatDateRange(
                          day.start_date,
                          day.end_date
                        )}
                      </p>

                      {/* INFORMATION */}

                      <dl className="mt-8 grid grid-cols-2 border-t border-ink/10 sm:grid-cols-3">

                        <Meta
                          label="Tarif"
                          value={formatPrice(
                            day.personal_price ??
                              formation.personal_price
                          )}
                          sub={
                            day.cpf_eligible &&
                            day.cpf_price
                              ? `CPF ${formatPrice(
                                  day.cpf_price
                                )}`
                              : undefined
                          }
                        />

                        <Meta
                          label="Places"
                          value={`${day.remaining_places}`}
                          sub={`sur ${day.max_places}`}
                        />

                        <Meta
                          label="Acompte"
                          value={formatPrice(
                            formation.deposit_amount
                          )}
                          sub="PayPal"
                          className="col-span-2 sm:col-span-1"
                        />

                      </dl>

                      {/* BUTTON */}

                      <div className="mt-8">

                        <Button
                          to={
                            available
                              ? "#reservation"
                              : "#contact"
                          }
                          state={{
                            ...reserveState,
                            formationId:
                              formation.id,
                            formationDayId:
                              day.id,
                          }}
                          variant={
                            available
                              ? "dark"
                              : "outline-dark"
                          }
                          icon="arrow"
                        >
                          {available
                            ? "Réserver cette session"
                            : "Demander une date"}
                        </Button>

                      </div>

                    </article>

                  </Reveal>
                );
              })}

            </div>

          )}

        </div>
      </section>

      {/* ===================================================
          PROGRAMME
      =================================================== */}

      {Array.isArray(formation.steps) &&
        formation.steps.length > 0 && (

          <section className="bg-white py-20 lg:py-32">

            <div className="wrap">

              <Reveal>

                <p className="label text-ink/40">
                  Programme
                </p>

                <h2 className="display mt-4 text-4xl md:text-5xl">
                  Le programme
                </h2>

              </Reveal>

              <div className="mt-12 divide-y divide-ink/10 border-y border-ink/10">

                {formation.steps.map(
                  (step, index) => (

                    <Reveal
                      key={`${step.title}-${index}`}
                      delay={index * 0.05}
                    >

                      <div className="grid gap-4 py-7 md:grid-cols-[80px_1fr]">

                        <span className="font-serif text-lg text-ink/40">
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </span>

                        <div>

                          <h3 className="font-serif text-2xl">
                            {step.title}
                          </h3>

                          {step.description && (
                            <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-ink/60">
                              {step.description}
                            </p>
                          )}

                        </div>

                      </div>

                    </Reveal>

                  )
                )}

              </div>

            </div>

          </section>
        )}

      {/* ===================================================
          RESERVATION
      =================================================== */}

      <section
        id="reservation"
        className="border-t border-ink/10 bg-ink py-24 text-ivory lg:py-40"
      >
        <div className="wrap">

          <Reveal>

            <p className="label text-ivory/40">
              Réservation
            </p>

            <h2 className="display mt-4 max-w-3xl text-5xl md:text-7xl">
              Prête à réserver votre formation ?
            </h2>

            <p className="mt-6 max-w-xl text-sm font-light leading-relaxed text-ivory/60">
              Choisissez votre session et contactez-nous
              pour finaliser votre réservation.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <Button
                to="/contact"
                variant="light"
                icon="arrow"
              >
                Nous contacter
              </Button>

              <Button
                to="/formations"
                variant="link-light"
              >
                Toutes les formations
              </Button>

            </div>

          </Reveal>

        </div>
      </section>

    </main>
  );
}

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default FormationDetailPage;