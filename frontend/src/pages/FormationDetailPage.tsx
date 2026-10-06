import { useLocation, useParams } from "react-router-dom";
import { useMemo } from "react";

import { useFormation } from "@/hooks/useFormation";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { ReservationForm } from "@/components/booking/ReservationForm";


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

function formatDate(
  date: string
) {
  return new Date(date).toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}

function formatShortDate(
  start: string,
  end: string
) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  const startMonth = startDate.toLocaleDateString(
    "fr-FR",
    { month: "long" }
  );

  const endMonth = endDate.toLocaleDateString(
    "fr-FR",
    { month: "long" }
  );

  if (
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    return `${startDay} — ${endDay} ${endMonth}`;
  }

  return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
}

export function FormationDetailPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const location = useLocation();

  const { data: formation, loading, error } =
    useFormation(slug);

  /*
   * Selected session from URL:
   *
   * /formations/formation-extension-de-cils?day=2
   */
  const searchParams = new URLSearchParams(
    location.search
  );

  const dayId = searchParams.get("day");

  const selectedDay = useMemo(() => {
    if (!formation?.formationDays?.length) {
      return null;
    }

    if (dayId) {
      const found = formation.formationDays.find(
        (day) => String(day.id) === String(dayId)
      );

      if (found) {
        return found;
      }
    }

    return formation.formationDays[0];
  }, [formation, dayId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory py-32">
        <div className="mx-auto max-w-6xl px-6">
          Chargement...
        </div>
      </main>
    );
  }

  if (error || !formation) {
    return (
      <main className="min-h-screen bg-ivory py-32">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-red-500">
            {error ?? "Formation introuvable."}
          </p>
        </div>
      </main>
    );
  }

  const programme =
    formation.programme;

  const duration =
    programme?.duration ?? "3 jours";

  const image =
    formation.image;

  return (
    <main className="bg-ivory">

      {/* =====================================================
          HEADER / BACK
      ===================================================== */}

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:px-10">

        <a
          href="/#/formations"
          className="label text-ink/50 transition-opacity hover:opacity-60"
        >
          ← Toutes les formations
        </a>

        {/* ===================================================
            HERO
        =================================================== */}

        <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-20">

          {/* IMAGE */}

          <Reveal>
            {image ? (
              <ImageReveal
                src={image}
                alt={formation.title}
                className="aspect-[4/5] w-full"
              />
            ) : (
              <div className="aspect-[4/5] w-full bg-ink/5" />
            )}
          </Reveal>

          {/* CONTENT */}

          <Reveal delay={0.1}>

            <p className="label text-ink/40">
              {programme?.name ?? formation.title}
              {" · "}
              {duration}
            </p>

            <h1 className="display mt-5 text-[clamp(3rem,7vw,6rem)]">
              {selectedDay?.city ??
                formation.title}
            </h1>

            {selectedDay && (
              <p className="mt-3 font-serif text-xl text-ink/70 md:text-2xl">
                {formatShortDate(
                  selectedDay.start_date,
                  selectedDay.end_date
                )}
              </p>
            )}

            {/* DESCRIPTION */}

            {formation.description && (
              <div
                className="mt-8 max-w-xl text-base font-light leading-relaxed text-ink/65"
                dangerouslySetInnerHTML={{
                  __html:
                    formation.description,
                }}
              />
            )}

            {/* =================================================
                FORMATION INFORMATION
            ================================================= */}

            <div className="mt-10 border-t border-ink/10">

              {/* DURÉE */}

              <div className="flex items-center justify-between border-b border-ink/10 py-4">
                <span className="label text-ink/40">
                  Durée
                </span>

                <span className="font-serif text-lg">
                  {duration}
                </span>
              </div>

              {/* SESSION */}

              {selectedDay && (
                <>
                  <div className="flex items-center justify-between border-b border-ink/10 py-4">
                    <span className="label text-ink/40">
                      Dates
                    </span>

                    <span className="font-serif text-right text-lg">
                      {formatShortDate(
                        selectedDay.start_date,
                        selectedDay.end_date
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-ink/10 py-4">
                    <span className="label text-ink/40">
                      Ville
                    </span>

                    <span className="font-serif text-lg">
                      {selectedDay.city}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-ink/10 py-4">
                    <span className="label text-ink/40">
                      Financement personnel
                    </span>

                    <span className="font-serif text-lg">
                      {formatPrice(
                        selectedDay.personal_price
                      )}
                    </span>
                  </div>

                  {selectedDay.cpf_eligible &&
                    selectedDay.cpf_price && (
                      <div className="flex items-center justify-between border-b border-ink/10 py-4">
                        <span className="label text-ink/40">
                          Financement CPF
                        </span>

                        <span className="font-serif text-lg">
                          {formatPrice(
                            selectedDay.cpf_price
                          )}
                        </span>
                      </div>
                    )}
                </>
              )}

              {/* ACOMPTE */}

              <div className="flex items-center justify-between border-b border-ink/10 py-4">
                <span className="label text-ink/40">
                  Acompte
                </span>

                <div className="text-right">
                  <span className="font-serif text-lg">
                    {formatPrice(
                      formation.deposit_amount
                    )}
                  </span>

                  <p className="text-xs text-ink/40">
                    Réglé en ligne par PayPal
                  </p>
                </div>
              </div>

            </div>

          </Reveal>
        </div>

        {/* =====================================================
            PROGRAMME
        ===================================================== */}

        <Reveal className="mt-24">

          <div className="max-w-4xl">

            <p className="label text-ink/40">
              Programme
            </p>

            <h2 className="display mt-5 text-[clamp(2.5rem,5vw,4.5rem)]">
              Le programme
            </h2>

            {/* IMPORTANT:
                Always display programme.
                PDF does NOT replace it.
            */}

            {formation.steps &&
              formation.steps.length > 0 ? (
              <div className="mt-10 grid gap-x-12 gap-y-5 border-t border-ink/10 pt-8 sm:grid-cols-2">

                {formation.steps.map(
                  (step, index) => (
                    <div
                      key={`${step.title}-${index}`}
                      className="flex gap-5 border-b border-ink/10 pb-5"
                    >
                      <span className="label text-ink/35">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>

                      <div>
                        <h3 className="font-serif text-lg">
                          {step.title}
                        </h3>

                        {step.description && (
                          <p className="mt-2 text-sm font-light leading-relaxed text-ink/55">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}

              </div>
            ) : (
              <p className="mt-8 text-ink/50">
                Programme à venir.
              </p>
            )}

            {/* PDF OPTIONAL */}

            {formation.pdf_program && (
              <div className="mt-8">

                <a
                  href={formation.pdf_program}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex border-b border-ink pb-1 text-sm uppercase tracking-[0.2em] transition-opacity hover:opacity-50"
                >
                  Télécharger le programme PDF →
                </a>

              </div>
            )}

          </div>

        </Reveal>

        {/* =====================================================
            SESSIONS DISPONIBLES
        ===================================================== */}

        <Reveal className="mt-24">

          <div className="max-w-5xl">

            <p className="label text-ink/40">
              Sessions disponibles
            </p>

            <div className="mt-7 border-t border-ink/10">

              {formation.formationDays?.map(
                (day) => {

                  const available =
                    day.status === "available" &&
                    day.remaining_places > 0;

                  const dayUrl =
                    `?day=${day.id}#reservation`;

                  return (
                    <div
                      key={day.id}
                      className="grid gap-5 border-b border-ink/10 py-7 md:grid-cols-[1fr_auto_auto] md:items-center"
                    >

                      {/* CITY + DATE */}

                      <div>

                        <h3 className="font-serif text-2xl">
                          {day.city}
                        </h3>

                        <p className="mt-1 text-sm text-ink/50">
                          {formatShortDate(
                            day.start_date,
                            day.end_date
                          )}
                        </p>

                        <p className="mt-2 text-xs text-ink/45">
                          {day.remaining_places}{" "}
                          place
                          {day.remaining_places > 1
                            ? "s"
                            : ""}{" "}
                          restante
                          {day.remaining_places > 1
                            ? "s"
                            : ""}
                        </p>

                      </div>

                      {/* PRICE */}

                      <div className="font-serif text-xl">
                        {formatPrice(
                          day.personal_price
                        )}
                      </div>

                      {/* RESERVE */}

                      <Button
                        to={dayUrl}
                        variant={
                          available
                            ? "dark"
                            : "outline-dark"
                        }
                        icon="arrow"
                        state={{
                          formationDayId:
                            day.id,
                        }}
                      >
                        {available
                          ? "Réserver"
                          : "Demander une date"}
                      </Button>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </Reveal>

      </section>

      {/* =====================================================
          RESERVATION — SAME PAGE
      ===================================================== */}

      <section
        id="reservation"
        className="scroll-mt-24 border-t border-ink/10"
      >
        <ReservationForm 
          formation={formation}
          formationDay={selectedDay}
        />
      </section>

    </main>
  );
}

export default FormationDetailPage;