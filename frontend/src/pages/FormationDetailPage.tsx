import { ArrowLeft, Check, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getFormation } from "@/services/api";
import type {
  Formation,
  FormationDay,
  FormationStep,
} from "@/types/formation";

import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";


// =========================================================
// HELPERS
// =========================================================

function formatPrice(
  price: number | string | null | undefined
): string {
  if (price === null || price === undefined || price === "") {
    return "—";
  }

  const value = Number(price);

  if (Number.isNaN(value)) {
    return String(price);
  }

  return `${value.toLocaleString("fr-FR")} €`;
}


function formatDate(
  date: string | null | undefined
): string {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


function getDateRange(
  day: FormationDay
): string {
  const start = formatDate(day.start_date);
  const end = formatDate(day.end_date);

  if (!start) {
    return "";
  }

  if (!end || start === end) {
    return start;
  }

  const startDate = new Date(day.start_date);
  const endDate = new Date(day.end_date);

  if (
    !Number.isNaN(startDate.getTime()) &&
    !Number.isNaN(endDate.getTime()) &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    const startDay = startDate.getDate();

    const endDay = endDate.getDate();

    const month = endDate.toLocaleDateString(
      "fr-FR",
      {
        month: "long",
      }
    );

    const year = endDate.getFullYear();

    return `${startDay} — ${endDay} ${month} ${year}`;
  }

  return `${start} — ${end}`;
}


// =========================================================
// PAGE
// =========================================================

export function FormationDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const [formation, setFormation] =
    useState<Formation | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  // =========================================================
  // LOAD FORMATION
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadFormation() {
      if (!slug) {
        setError("Formation introuvable.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getFormation(slug);

        if (!cancelled) {
          setFormation(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger la formation."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFormation();

    return () => {
      cancelled = true;
    };
  }, [slug]);


  // =========================================================
  // LOADING
  // =========================================================

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


  // =========================================================
  // ERROR
  // =========================================================

  if (error || !formation) {
    return (
      <main className="bg-white py-32">
        <div className="wrap">

          <p className="mb-8 text-sm text-red-500">
            {error ?? "Formation introuvable."}
          </p>

          <Link
            to="/formations"
            className="inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} />
            Retour aux formations
          </Link>

        </div>
      </main>
    );
  }


  // =========================================================
  // SAFE DATA
  // =========================================================

  const steps: FormationStep[] =
    Array.isArray(formation.steps)
      ? formation.steps
      : [];

  const days: FormationDay[] =
    Array.isArray(formation.formationDays)
      ? formation.formationDays
      : [];

  const programme =
    formation.programme ?? null;


  // =========================================================
  // IMAGE
  // =========================================================

  const mainImage =
    formation.image ?? null;


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="bg-white">

      {/* =====================================================
          BACK
      ===================================================== */}

      <section className="pt-10 lg:pt-16">
        <div className="wrap">

          <Link
            to="/formations"
            className="inline-flex items-center gap-2 text-sm text-ink/60 transition hover:text-ink"
          >
            <ArrowLeft size={16} />
            Toutes les formations
          </Link>

        </div>
      </section>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="py-16 lg:py-24">
        <div className="wrap">

          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

            {/* IMAGE */}

            <Reveal>

              {mainImage ? (
                <ImageReveal
                  src={mainImage}
                  alt={formation.title}
                  className="aspect-[4/3] w-full overflow-hidden"
                />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-ink/5">
                  <span className="text-sm text-ink/40">
                    Aucune image
                  </span>
                </div>
              )}

            </Reveal>


            {/* CONTENT */}

            <div>

              <p className="label mb-6 text-ink/50">
                Formation professionnelle
              </p>

              <Headline
                title={[formation.title]}
              />


              {/* PROGRAMME */}

              {programme && (
                <div className="mt-6">

                  <p className="text-sm text-ink/60">
                    {programme.name}
                  </p>

                  {programme.duration && (
                    <p className="mt-2 text-sm text-ink/50">
                      {programme.duration}
                    </p>
                  )}

                </div>
              )}


              {/* DESCRIPTION */}

              {formation.description && (
                <div
                  className="prose prose-sm mt-8 max-w-none text-ink/70"
                  dangerouslySetInnerHTML={{
                    __html:
                      formation.description,
                  }}
                />
              )}

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          FORMATION DAYS
      ===================================================== */}

      <section className="border-y border-ink/10 bg-[#F7F3EE] py-20 lg:py-28">

        <div className="wrap">

          <Reveal>

            <div className="mb-12">

              <p className="label text-ink/50">
                Prochaines sessions
              </p>

              <h2 className="mt-4 text-3xl font-medium tracking-tight lg:text-5xl">
                Choisissez votre ville
              </h2>

            </div>

          </Reveal>


          {days.length === 0 ? (

            <div className="border border-ink/10 bg-white p-8">

              <p className="text-sm text-ink/50">
                Aucune session disponible
                actuellement.
              </p>

            </div>

          ) : (

            <div className="grid gap-6 md:grid-cols-2">

              {days.map((day) => (

                <Reveal key={day.id}>

                  <article className="overflow-hidden border border-ink/10 bg-white">

                    {/* CITY IMAGE */}

                    {day.image ? (
                      <img
                        src={day.image}
                        alt={day.city}
                        className="aspect-[16/9] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[16/9] w-full items-center justify-center bg-ink/5">
                        <span className="text-sm text-ink/40">
                          {day.city}
                        </span>
                      </div>
                    )}


                    {/* CONTENT */}

                    <div className="p-7">

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <div className="flex items-center gap-2">

                            <MapPin
                              size={17}
                              strokeWidth={1.5}
                            />

                            <h3 className="text-xl font-medium">
                              {day.city}
                            </h3>

                          </div>

                          <p className="mt-3 text-sm text-ink/60">
                            {getDateRange(day)}
                          </p>

                        </div>


                        <div className="text-right">

                          <p className="text-lg font-medium">
                            {formatPrice(
                              day.personal_price
                            )}
                          </p>

                        </div>

                      </div>


                      {/* PLACES */}

                      <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-5">

                        <div>

                          <p className="text-xs uppercase tracking-wider text-ink/40">
                            Places disponibles
                          </p>

                          <p className="mt-1 text-sm">
                            {day.remaining_places}{" "}
                            /{" "}
                            {day.max_places}
                          </p>

                        </div>


                        <div>

                          {day.status === "available" &&
                          day.remaining_places > 0 ? (
                            <span className="text-sm text-emerald-700">
                              Disponible
                            </span>
                          ) : day.status === "full" ||
                            day.remaining_places === 0 ? (
                            <span className="text-sm text-red-500">
                              Complet
                            </span>
                          ) : (
                            <span className="text-sm text-ink/50">
                              {day.status}
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                  </article>

                </Reveal>

              ))}

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          PROGRAMME / STEPS
      ===================================================== */}

      {steps.length > 0 && (

        <section className="py-20 lg:py-32">

          <div className="wrap">

            <Reveal>

              <div className="mb-14">

                <p className="label text-ink/50">
                  Le programme
                </p>

                <h2 className="mt-4 text-3xl font-medium lg:text-5xl">
                  Une formation complète
                </h2>

              </div>

            </Reveal>


            <div className="grid gap-0 border-t border-ink/10 md:grid-cols-2">

              {steps.map(
                (step, index) => (

                  <Reveal
                    key={`${index}-${step.title}`}
                  >

                    <article className="border-b border-ink/10 p-8 md:border-r">

                      <div className="flex gap-6">

                        <span className="text-sm text-ink/40">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </span>


                        <div>

                          <h3 className="text-lg font-medium">
                            {step.title}
                          </h3>

                          {step.description && (
                            <p className="mt-3 text-sm leading-7 text-ink/60">
                              {step.description}
                            </p>
                          )}

                        </div>

                      </div>

                    </article>

                  </Reveal>

                )
              )}

            </div>

          </div>

        </section>

      )}


      {/* =====================================================
          INFOS
      ===================================================== */}

      <section className="border-t border-ink/10 py-20 lg:py-28">

        <div className="wrap">

          <div className="grid gap-8 md:grid-cols-3">

            {/* DURATION */}

            <div className="border border-ink/10 p-7">

              <p className="label text-ink/40">
                Durée
              </p>

              <p className="mt-4 text-xl">
                {programme?.duration ?? "—"}
              </p>

            </div>


            {/* DEPOSIT */}

            <div className="border border-ink/10 p-7">

              <p className="label text-ink/40">
                Acompte
              </p>

              <p className="mt-4 text-xl">
                {formatPrice(
                  formation.deposit_amount
                )}
              </p>

            </div>


            {/* CPF */}

            <div className="border border-ink/10 p-7">

              <p className="label text-ink/40">
                CPF
              </p>

              <p className="mt-4 text-xl">
                {days.some(
                  (day) => day.cpf_eligible
                )
                  ? "Éligible"
                  : "Non disponible"}
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="bg-[#18453B] py-20 text-white lg:py-28">

        <div className="wrap text-center">

          <p className="label text-white/60">
            Réservation
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-medium lg:text-5xl">
            Prête à commencer votre formation ?
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/70">
            Choisissez votre ville et votre session
            pour réserver votre place.
          </p>

          <div className="mt-8">

            <Button
              to="#sessions"
              variant="light"
              icon="arrow"
            >
              Réserver ma formation
            </Button>

          </div>

        </div>

      </section>

    </main>
  );
}


export default FormationDetailPage;