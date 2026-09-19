import { AS } from "@/data/images";
import { CPF_PRICE, DEPOSIT, eur, priceFrom } from "@/data/formations";
import { mainProgramme } from "@/data/programmes";
import { site } from "@/data/site";
import { useSiteUI } from "@/context/SiteUIContext";
import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

function Info({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="label text-[10px] text-ivory/40">{label}</p>
      <p className="mt-2 font-serif text-2xl leading-none md:text-[1.75rem]">{value}</p>
      {sub && <p className="mt-1.5 text-xs font-light text-ivory/45">{sub}</p>}
    </div>
  );
}

/** Deep-dive presentation of the Extension de Cils programme. */
export function FormationFeature() {
  const p = mainProgramme;
  const { requestDate } = useSiteUI();

  return (
    <section className="overflow-hidden bg-charcoal py-24 text-ivory lg:py-40">
      <div className="wrap">
        <Reveal>
          <p className="label flex items-center gap-4 text-ivory/50">
            <span className="h-px w-10 bg-current" />
            Le programme · {p.duration}
          </p>
        </Reveal>
        <Headline lines={p.titleLines} className="mt-6 text-[clamp(3rem,8.5vw,7.5rem)] text-ivory" />

        <div className="mt-14 grid gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-12">
          <div className="relative lg:col-span-6">
            <ImageReveal
              src={AS.lashCloseup.src}
              fallback={AS.lashCloseup.fallback}
              alt="Résultat volume russe — AS Academy"
              className="aspect-[4/5] w-full lg:aspect-[3/4]"
            />
            <Reveal delay={0.3} className="absolute bottom-5 left-5 hidden sm:block">
              <p className="label bg-ink/50 px-4 py-3 text-[10px] text-ivory/85 backdrop-blur-sm">
                Cils à cils — Volume russe
              </p>
            </Reveal>
          </div>

          <div className="flex flex-col lg:col-span-5 lg:col-start-8">
            <Reveal>
              <p className="font-serif text-[1.5rem] leading-[1.3] text-ivory/90 md:text-[1.8rem]">{p.intro}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 text-base font-light leading-relaxed text-ivory/60">{p.description[0]}</p>
            </Reveal>

            <div className="mt-12">
              <Reveal>
                <p className="label text-ivory/50">Programme</p>
              </Reveal>
              <div className="mt-4 border-t border-ivory/10">
                {p.programme.map((item, i) => (
                  <Reveal key={item} delay={i * 0.06} y={16}>
                    <div className="flex items-baseline gap-6 border-b border-ivory/10 py-4">
                      <span className="label w-6 text-[10px] text-ivory/35">0{i + 1}</span>
                      <span className="font-serif text-xl uppercase tracking-[0.03em] md:text-2xl">{item}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={0.1}>
              <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4">
                <Info label="Durée" value={p.duration} />
                <Info label="Personnel" value={`dès ${priceFrom}`} sub="selon la ville" />
                <Info label="CPF" value={eur(CPF_PRICE)} />
                <Info label="Acompte" value={eur(DEPOSIT)} sub="PayPal" />
              </div>
              <div className="mt-12 flex flex-col gap-3 sm:flex-row">
                <Button to="/formations" variant="light" icon="arrow">
                  Voir les dates & réserver
                </Button>
                <Button variant="outline-light" onClick={requestDate}>
                  Demander une date
                </Button>
              </div>
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
