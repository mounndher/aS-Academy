import { Link } from "react-router-dom";
import {
  CPF_PRICE,
  DEPOSIT,
  dateLabel,
  eur,
  formationImage,
  formations,
  programmeOf,
  type Formation,
} from "@/data/formations";
import { mainProgramme } from "@/data/programmes";
import { site } from "@/data/site";
import { useScrollToState } from "@/hooks/useScrollToState";
import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

/** One simple card per formation → "Voir la formation". */
function Card({ formation: f, index }: { formation: Formation; index: number }) {
  const p = programmeOf(f);
  const img = formationImage(f);
  const to = `/formations/${f.slug}`;
  const d = (index % 3) * 0.08;

  return (
    <article>
      <Link to={to} aria-label={`${p.title} — ${f.city}`} className="block">
        <ImageReveal src={img.src} alt={img.alt} className="aspect-[4/5] w-full" delay={d} priority={index < 3} />
      </Link>
      <Reveal delay={0.1 + d}>
        <p className="label mt-6 text-ink/40">
          {p.title} · {p.duration}
        </p>
        <h2 className="display mt-3 text-[clamp(2rem,5vw,3rem)]">
          <Link to={to} className="transition-opacity duration-500 hover:opacity-60">
            {f.city}
          </Link>
        </h2>
        <p className="mt-1.5 font-serif text-xl text-ink/70 md:text-2xl">{dateLabel(f)}</p>

        <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-ink/10 pt-5">
          <span className="font-serif text-2xl leading-none">
            {f.pricing ? eur(f.pricing.personal) : "Sur demande"}
          </span>
          <span className="text-xs font-light text-ink/50">
            CPF {eur(f.pricing?.cpf ?? CPF_PRICE)} · Acompte {eur(f.pricing?.deposit ?? DEPOSIT)}
          </span>
        </div>

        <Button to={to} variant="outline-dark" icon="arrow" className="mt-6 w-full sm:w-auto">
          Voir la formation
        </Button>
      </Reveal>
    </article>
  );
}

/** All formations — simple grid. Add an entry in src/data/formations.ts → it appears here. */
export function FormationsListPage() {
  useScrollToState();
  const p = mainProgramme;

  return (
    <section className="bg-ivory pt-28 pb-24 lg:pt-36 lg:pb-36">
      <div className="wrap">
        <SectionHeader
          label="Formations"
          title={["Nos", "Formations"]}
          subtitle={
            <>
              {p.title} — {p.duration}. Choisissez votre ville et vos dates, puis réservez en
              ligne.
            </>
          }
        />

        <div className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:mt-24 lg:grid-cols-3">
          {formations.map((f, i) => (
            <Card key={f.slug} formation={f} index={i} />
          ))}
        </div>

        <Reveal>
          <p className="mt-20 border-t border-ink/10 pt-8 text-sm font-light text-ink/55">
            Une autre ville ou une autre date ? Écrivez-nous sur Instagram{" "}
            <a href={site.instagram.url} target="_blank" rel="noreferrer" className="link-line text-ink">
              {site.instagram.handle}
            </a>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
