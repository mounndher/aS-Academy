import { useSectionNav } from "@/hooks/useSectionNav";
import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCTA() {
  const goTo = useSectionNav();

  return (
    <section className="border-t border-ink/10 bg-ivory py-28 lg:py-44" aria-label="Votre expertise commence ici">
      <div className="wrap">
        <Headline
          lines={["Votre expertise", "commence ici."]}
          className="text-[clamp(2.25rem,9vw,9rem)]"
        />
        <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between lg:mt-16">
          <Reveal delay={0.2}>
            <p className="max-w-sm text-lg font-light leading-relaxed text-ink/60">
              Découvrez les prochaines formations
              <br />
              AS Academy.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Button variant="dark" size="lg" icon="arrow" onClick={() => goTo("formations")}>
              Voir les formations
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
