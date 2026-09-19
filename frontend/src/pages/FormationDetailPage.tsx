import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  CPF_PRICE,
  DEPOSIT,
  dateLabel,
  eur,
  formationImage,
  getFormation,
  isScheduled,
  programmeOf,
} from "@/data/formations";
import { useScrollToState } from "@/hooks/useScrollToState";
import { scrollToId } from "@/lib/scroll";
import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";
import { ReservationForm } from "@/components/booking/ReservationForm";

function Row({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-4">
      <dt className="label shrink-0 text-[10px] text-ink/45">{label}</dt>
      <dd className="text-right">
        <span className="font-serif text-xl leading-tight">{value}</span>
        {sub && <span className="mt-0.5 block text-xs font-light text-ink/50">{sub}</span>}
      </dd>
    </div>
  );
}

/** Formation detail: information + reservation form with payment. */
export function FormationDetailPage() {
  const { slug } = useParams();
  const f = getFormation(slug);
  useScrollToState();

  if (!f) return <Navigate to="/formations" replace />;

  const p = programmeOf(f);
  const img = formationImage(f);
  const scheduled = isScheduled(f);
  const deposit = f.pricing?.deposit ?? DEPOSIT;
  const cta = scheduled ? "Réserver ma place" : "Demander une date";

  return (
    <article className="bg-ivory">
      {/* ---------- Information ---------- */}
      <section className="pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="wrap">
          <Link
            to="/formations"
            className="label inline-flex items-center gap-3 text-[10px] text-ink/50 transition-colors hover:text-ink"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Toutes les formations
          </Link>

          <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <ImageReveal src={img.src} alt={img.alt} className="aspect-[4/5] w-full" priority />
            </div>

            <div className="lg:col-span-5 lg:col-start-8">
              <p className="label text-ink/50">
                {p.title} · {p.duration}
              </p>
              <Headline as="h1" immediate lines={[f.city]} className="mt-5 text-[clamp(2.75rem,9vw,5.5rem)]" />
              <p className="mt-3 font-serif text-2xl leading-none text-ink/70 md:text-3xl">{dateLabel(f)}</p>

              <Reveal delay={0.2}>
                <p className="mt-8 font-serif text-xl leading-[1.35] text-ink/85 md:text-2xl">{p.intro}</p>
                <p className="mt-5 text-base font-light leading-relaxed text-ink/60">{p.description[0]}</p>
              </Reveal>

              <Reveal delay={0.3}>
                <dl className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
                  <Row label="Durée" value={p.durationDetail} />
                  <Row label="Dates" value={dateLabel(f)} />
                  <Row label="Ville" value={f.city} />
                  <Row label="Financement personnel" value={f.pricing ? eur(f.pricing.personal) : "Sur demande"} />
                  <Row label="Financement CPF" value={eur(f.pricing?.cpf ?? CPF_PRICE)} />
                  <Row label="Acompte" value={eur(deposit)} sub="Réglé en ligne par PayPal" />
                </dl>
              </Reveal>

              <Reveal delay={0.35}>
                <p className="label mt-10 text-ink/50">Programme</p>
                <ol className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                  {p.programme.map((item, i) => (
                    <li key={item} className="flex items-baseline gap-3 font-serif text-lg leading-snug">
                      <span className="label text-[10px] text-ink/35">0{i + 1}</span>
                      {item}
                    </li>
                  ))}
                </ol>
                <div className="mt-10">
                  <Button
                    variant="dark"
                    size="lg"
                    icon="arrow"
                    className="w-full sm:w-auto"
                    onClick={() => scrollToId("reservation")}
                  >
                    {cta}
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Reservation ---------- */}
      <section id="reservation" className="scroll-mt-20 border-t border-ink/10 bg-white py-20 lg:py-28">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="label flex items-center gap-4 text-ink/50">
                <span className="h-px w-10 bg-current" />
                Réservation
              </p>
            </Reveal>
            <Headline
              lines={scheduled ? ["Réserver", "ma place"] : ["Demander", "une date"]}
              className="mt-6 text-[clamp(2.5rem,7vw,4.5rem)]"
            />
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-sm text-base font-light leading-relaxed text-ink/60">
                {scheduled ? (
                  <>
                    Remplissez vos coordonnées et réglez l'acompte de {eur(deposit)} par PayPal.
                    Le solde est réglé auprès de l'académie.
                  </>
                ) : (
                  <>
                    Les dates {f.city} ne sont pas encore ouvertes. Laissez-nous vos coordonnées
                    et votre période souhaitée : nous vous recontactons dès l'ouverture.
                  </>
                )}
              </p>
              <dl className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
                <Row label="Formation" value={p.title} />
                <Row label="Ville" value={f.city} />
                <Row label="Dates" value={dateLabel(f)} />
                {scheduled && <Row label="Acompte" value={eur(deposit)} />}
              </dl>
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <Reveal delay={0.15}>
              <ReservationForm formation={f} programme={p} />
            </Reveal>
          </div>
        </div>
      </section>
    </article>
  );
}
