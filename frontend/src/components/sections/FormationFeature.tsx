
import { site } from "@/data/site";

import { useSiteUI } from "@/context/SiteUIContext";
import { useFormationFeature } from "@/hooks/useFormationFeature";

import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

function Info({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="label text-[10px] text-ivory/40">
        {label}
      </p>

      <p className="mt-2 font-serif text-2xl leading-none md:text-[1.75rem]">
        {value}
      </p>

      {sub && (
        <p className="mt-1.5 text-xs font-light text-ivory/45">
          {sub}
        </p>
      )}
    </div>
  );
}

export function FormationFeature() {
  const { requestDate } = useSiteUI();

  const {
    formation,
    loading,
    error,
  } = useFormationFeature();

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <section className="overflow-hidden bg-charcoal py-24 text-ivory lg:py-40">
        <div className="wrap">
          <p className="text-sm text-ivory/50">
            Chargement de la formation...
          </p>
        </div>
      </section>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error || !formation) {
    return (
      <section className="overflow-hidden bg-charcoal py-24 text-ivory lg:py-40">
        <div className="wrap">
          <p className="text-sm text-red-400">
            {error || "Formation introuvable."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden bg-charcoal py-24 text-ivory lg:py-40">
      <div className="wrap">

        {/* =========================
            HEADER
        ========================= */}

        <Reveal>
          <p className="label flex items-center gap-4 text-ivory/50">
            <span className="h-px w-10 bg-current" />

            Le programme · 3 jours
          </p>
        </Reveal>

        <Headline
          lines={[
            "Formation",
            formation.title.replace(/^Formation\s*/i, ""),
          ]}
          className="mt-6 text-[clamp(3rem,8.5vw,7.5rem)] text-ivory"
        />

        <div className="mt-14 grid gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-12">

          {/* =========================
              IMAGE
          ========================= */}

          <div className="relative lg:col-span-6">

            {formation.image ? (
              <ImageReveal
                src={formation.image}
                alt={formation.title}
                className="aspect-[4/5] w-full lg:aspect-[3/4]"
              />
            ) : (
              <div className="flex aspect-[4/5] w-full items-center justify-center bg-ink/10 lg:aspect-[3/4]">
                <span className="text-sm text-ivory/40">
                  Image indisponible
                </span>
              </div>
            )}

            <Reveal
              delay={0.3}
              className="absolute bottom-5 left-5 hidden sm:block"
            >
              <p className="label bg-ink/50 px-4 py-3 text-[10px] text-ivory/85 backdrop-blur-sm">
                Cils à cils — Volume russe
              </p>
            </Reveal>

          </div>

          {/* =========================
              CONTENT
          ========================= */}

          <div className="flex flex-col lg:col-span-5 lg:col-start-8">

            {/* INTRO */}

            <Reveal>
              <p className="font-serif text-[1.5rem] leading-[1.3] text-ivory/90 md:text-[1.8rem]">
                Une formation professionnelle conçue
                pour acquérir une technique précise,
                une méthode rigoureuse et une véritable
                maîtrise de l&apos;extension de cils.
              </p>
            </Reveal>

            {/* DESCRIPTION */}

            {formation.description && (
              <Reveal delay={0.1}>
                <p className="mt-6 text-base font-light leading-relaxed text-ivory/60">
                  {formation.description}
                </p>
              </Reveal>
            )}

            {/* =========================
                PROGRAMME / STEPS
            ========================= */}

            <div className="mt-12">

              <Reveal>
                <p className="label text-ivory/50">
                  Programme
                </p>
              </Reveal>

              <div className="mt-4 border-t border-ivory/10">

                {formation.steps &&
                  formation.steps.length > 0 &&
                  formation.steps.map((step, i) => (
                    <Reveal
                      key={`${step.title}-${i}`}
                      delay={i * 0.06}
                      y={16}
                    >
                      <div className="flex items-baseline gap-6 border-b border-ivory/10 py-4">

                        <span className="label w-6 text-[10px] text-ivory/35">
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        <div>
                          <span className="font-serif text-xl uppercase tracking-[0.03em] md:text-2xl">
                            {step.title}
                          </span>

                          {step.description && (
                            <p className="mt-1 text-sm font-light text-ivory/50">
                              {step.description}
                            </p>
                          )}
                        </div>

                      </div>
                    </Reveal>
                  ))}

              </div>
            </div>

            {/* =========================
                PRICE / INFORMATION
            ========================= */}

            <Reveal delay={0.1}>

              <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4">

                <Info
                  label="Durée"
                  value="3 jours"
                />

                <Info
                  label="Personnel"
                  value="700 €"
                  sub="Bordeaux"
                />

                <Info
                  label="Autres villes"
                  value="850 €"
                />

                <Info
                  label="CPF"
                  value={eur(CPF_PRICE)}
                />

              </div>

              {/* =========================
                  BUTTONS
              ========================= */}

              <div className="mt-12 flex flex-col gap-3 sm:flex-row">

                <Button
                  to="/formations"
                  variant="light"
                  icon="arrow"
                >
                  Voir les dates & réserver
                </Button>

                <Button
                  variant="outline-light"
                  onClick={requestDate}
                >
                  Demander une date
                </Button>

              </div>

              {/* =========================
                  CITIES
              ========================= */}

              <p className="mt-7 text-[10px] uppercase tracking-[0.26em] text-ivory/40">
                Sessions · {site.cities.join(" · ")}
              </p>

            </Reveal>

          </div>
        </div>
      </div>
    </section>
  );
}
