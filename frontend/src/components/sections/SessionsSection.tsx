import { DEPOSIT, eur, scheduledFormations, upcomingFormations } from "@/data/formations";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RESERVE_STATE } from "./FormationCard";
import { SessionCard } from "./SessionCard";

export function SessionsSection() {
  return (
    <section id="sessions" className="scroll-mt-16 bg-ivory py-24 lg:py-40">
      <div className="wrap">
        <SectionHeader
          label="Calendrier"
          title={["Prochaines", "Sessions"]}
          subtitle="Formation Extension de Cils — 3 jours. Chaque session dispose de sa page détaillée et de sa réservation en ligne."
        />

        <div className="mt-16 border-t border-ink/15 lg:mt-24">
          {scheduledFormations.map((f, i) => (
            <SessionCard key={f.slug} formation={f} index={i} />
          ))}
        </div>

        {upcomingFormations.length > 0 && (
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:mt-20">
            {upcomingFormations.map((f, i) => (
              <Reveal key={f.slug} delay={i * 0.1}>
                <div className="flex flex-col gap-6 border border-ink/10 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                  <div>
                    <p className="label text-[10px] text-ink/40">{f.month}</p>
                    <p className="display mt-2 text-3xl md:text-4xl">{f.city}</p>
                  </div>
                  <Button to={`/formations/${f.slug}`} state={RESERVE_STATE} variant="link-dark" icon="arrow">
                    Demander une date
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal delay={0.1}>
          <p className="mt-10 max-w-xl text-xs font-light leading-relaxed text-ink/45">
            Acompte de {eur(DEPOSIT)} réglé en ligne — PayPal ou carte bancaire — pour confirmer
            votre inscription. Financement personnel ou CPF selon la session.
          </p>
        </Reveal>
      </div>
    </section>
  );
}