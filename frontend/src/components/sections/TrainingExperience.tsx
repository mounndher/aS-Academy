import { AS, IMAGES } from "@/data/images";
import { Headline } from "@/components/ui/Headline";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

const WORD = "text-[clamp(3rem,12vw,6.5rem)]";

/** Editorial collage — different sizes, overlaps, whitespace and oversized words. */
export function TrainingExperience() {
  return (
    <section className="overflow-hidden bg-ivory py-24 lg:py-40" aria-label="L'expérience de formation">
      <div className="wrap">
        <Reveal>
          <p className="label flex items-center gap-4 text-ink/50">
            <span className="h-px w-10 bg-current" />
            L'expérience de formation
          </p>
        </Reveal>

        {/* 01 — Apprendre */}
        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-6">
            <Headline lines={["Apprendre"]} className={WORD} />
            <Reveal delay={0.2}>
              <p className="label mt-5 text-ink/40">01 — Théorie, hygiène & bases du métier</p>
            </Reveal>
          </div>
          <ImageReveal
            src={AS.classCerts.src}
            fallback={AS.classCerts.fallback}
            alt="Élèves certifiées AS Academy"
            className="aspect-[4/3] w-full lg:col-span-6"
          />
        </div>

        {/* 02 — Pratiquer */}
        <div className="mt-20 grid gap-8 lg:mt-6 lg:grid-cols-12 lg:items-start lg:gap-12">
          <ImageReveal
            src={AS.lashTrio.src}
            fallback={AS.lashTrio.fallback}
            alt="Trois profils de poses de cils"
            className="aspect-[3/4] w-[68%] sm:w-[50%] lg:col-span-4 lg:-mt-24 lg:w-full"
            direction="left"
          />
          <div className="lg:col-span-8 lg:pt-20 lg:text-right">
            <Headline lines={["Pratiquer"]} className={WORD} />
            <Reveal delay={0.2}>
              <p className="label mt-5 text-ink/40">02 — Mapping & pose sur modèle</p>
            </Reveal>
            <ImageReveal
              src={IMAGES.applicationHands}
              alt="Pose d'une extension à la pince"
              className="ml-auto mt-10 aspect-[4/3] w-[82%] sm:w-[62%] lg:w-[60%]"
              delay={0.15}
            />
          </div>
        </div>

        {/* 03 — Maîtriser */}
        <div className="mt-20 grid gap-8 lg:mt-24 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-6">
            <Headline lines={["Maîtriser"]} className={WORD} />
            <Reveal delay={0.2}>
              <p className="label mt-5 text-ink/40">03 — Finition & résultat</p>
              <p className="mt-6 max-w-sm text-base font-light leading-relaxed text-ink/60">
                Le regard final : régulier, propre, durable. C'est le niveau d'exigence
                visé à chaque pose.
              </p>
            </Reveal>
          </div>
          <div className="relative lg:col-span-6">
            <ImageReveal
              src={AS.resultLogo.src}
              fallback={AS.resultLogo.fallback}
              alt="Résultat final signé AS Academy"
              className="aspect-[16/10] w-full"
            />
            <ImageReveal
              src={IMAGES.tweezersClose}
              alt="Outils professionnels"
              className="absolute -bottom-10 -left-4 hidden aspect-square w-[34%] border-[6px] border-ivory sm:block lg:-left-12"
              delay={0.3}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
