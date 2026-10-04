import { useParams } from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";

import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

function formatPrice(price: string | number | null | undefined) {
  if (price === null || price === undefined) {
    return "Sur demande";
  }

  return `${Number(price).toLocaleString("fr-FR")} €`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function FormationFeature() {
  const { slug } = useParams<{ slug: string }>();

  const {
    data: formation,
    loading,
    error,
  } = useFormation(slug);

  if (loading) {
    return (
      <section className="bg-charcoal py-24 text-ivory">
        <div className="wrap">
          <p>Chargement de la formation...</p>
        </div>
      </section>
    );
  }

  if (error || !formation) {
    return (
      <section className="bg-charcoal py-24 text-ivory">
        <div className="wrap">
          <p className="text-red-400">
            Impossible de charger la formation.
          </p>
        </div>
      </section>
    );
  }

  const days = formation.formationDays ?? [];

  return (
    <section className="overflow-hidden bg-charcoal py-24 text-ivory lg:py-40">
      <div className="wrap">

        {/* HEADER */}
        <Reveal>
          <p className="label flex items-center gap-4 text-ivory/50">
            <span className="h-px w-10 bg-current" />

            Formation professionnelle
          </p>
        </Reveal>

        <Reveal>
          <h1 className="display mt-6 text-[clamp(3rem,8.5vw,7.5rem)] text-ivory">
            {formation.title}
          </h1>
        </Reveal>

        <div className="mt-14 grid gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-12">

          {/* IMAGE */}
          <div className="relative lg:col-span-6">
            {formation.image && (
              <ImageReveal
                src={formation.image}
                alt={formation.title}
                className="aspect-[4/5] w-full lg:aspect-[3/4]"
              />
            )}

            <Reveal
              delay={0.3}
              className="absolute bottom-5 left-5 hidden sm:block"
            >
              <p className="label bg-ink/50 px-4 py-3 text-[10px] text-ivory/85 backdrop-blur-sm">
                {formation.programme || "Formation"}
              </p>
            </Reveal>
          </div>

          {/* CONTENT */}
          <div className="flex flex-col lg:col-span-5 lg:col-start-8">

            {/* DESCRIPTION */}
            <Reveal>
              <p className="font-serif text-[1.5rem] leading-[1.3] text-ivory/90 md:text-[1.8rem]">
                {formation.description}
              </p>
            </Reveal>

            {/* PROGRAMME / STEPS */}
            {formation.steps?.length > 0 && (
              <div className="mt-12">
                <Reveal>
                  <p className="label text-ivory/50">
                    Programme
                  </p>
                </Reveal>

                <div className="mt-4 border-t border-ivory/10">
                  {formation.steps.map((step, index) => (
                    <Reveal
                      key={index}
                      delay={index * 0.06}
                      y={16}
                    >
                      <div className="flex items-baseline gap-6 border-b border-ivory/10 py-4">

                        <span className="label w-6 text-[10px] text-ivory/35">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div>
                          <span className="font-serif text-xl uppercase tracking-[0.03em] md:text-2xl">
                            {step.title}
                          </span>

                          {step.description && (
                            <p className="mt-1 text-sm text-ivory/50">
                              {step.description}
                            </p>
                          )}
                        </div>

                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}

            {/* FORMATION DAYS */}
            {days.length > 0 && (
              <div className="mt-12">
                <Reveal>
                  <p className="label text-ivory/50">
                    Prochaines sessions
                  </p>
                </Reveal>

                <div className="mt-4 border-t border-ivory/10">
                  {days.map((day) => (
                    <div
                      key={day.id}
                      className="border-b border-ivory/10 py-4"
                    >
                      <div className="flex items-center justify-between gap-4">

                        <div>
                          <p className="font-serif text-xl">
                            {day.city}
                          </p>

                          <p className="mt-1 text-sm text-ivory/50">
                            Du {formatDate(day.start_date)} au{" "}
                            {formatDate(day.end_date)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-serif text-lg">
                            {formatPrice(day.personal_price)}
                          </p>

                          {day.cpf_price && (
                            <p className="text-xs text-ivory/40">
                              CPF {formatPrice(day.cpf_price)}
                            </p>
                          )}
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INFO */}
            <Reveal delay={0.1}>
              <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3">

                <div>
                  <p className="label text-[10px] text-ivory/40">
                    Programme
                  </p>

                  <p className="mt-2 font-serif text-xl">
                    {formation.programme || "Formation"}
                  </p>
                </div>

                <div>
                  <p className="label text-[10px] text-ivory/40">
                    Sessions
                  </p>

                  <p className="mt-2 font-serif text-xl">
                    {days.length}
                  </p>
                </div>

                <div>
                  <p className="label text-[10px] text-ivory/40">
                    Tarif
                  </p>

                  <p className="mt-2 font-serif text-xl">
                    {days.length > 0
                      ? `dès ${formatPrice(
                          Math.min(
                            ...days
                              .map((day) =>
                                Number(day.personal_price)
                              )
                              .filter((price) => price > 0)
                          )
                        )}`
                      : "Sur demande"}
                  </p>
                </div>

              </div>

              {/* CTA */}
              <div className="mt-12 flex flex-col gap-3 sm:flex-row">

                <Button
                  to="/formations"
                  variant="light"
                  icon="arrow"
                >
                  Voir les dates & réserver
                </Button>

              </div>
            </Reveal>

          </div>
        </div>
      </div>
    </section>
  );
}
