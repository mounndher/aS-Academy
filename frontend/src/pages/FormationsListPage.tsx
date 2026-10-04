import { useQuery } from "@tanstack/react-query";

import { getFormation } from "@/services/api";

import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

import { useSiteUI } from "@/context/SiteUIContext";

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

function formatPrice(price: string | number | null | undefined) {
  if (price === null || price === undefined || price === "") {
    return "Sur demande";
  }

  return `${Number(price).toLocaleString("fr-FR")} €`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Deep-dive presentation of the Extension de Cils formation.
 */
export function FormationFeature() {
  const { requestDate } = useSiteUI();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["formation", "formation-extension-de-cils"],
    queryFn: () =>
      getFormation("formation-extension-de-cils"),
  });

  if (isLoading) {
    return (
      <section className="bg-charcoal py-24 text-ivory lg:py-40">
        <div className="wrap">
          <p className="text-ivory/50">
            Chargement de la formation...
          </p>
        </div>
      </section>
    );
  }

  if (isError || !data?.data) {
    return (
      <section className="bg-charcoal py-24 text-ivory lg:py-40">
        <div className="wrap">
          <p className="text-ivory/50">
            Impossible de charger la formation.
          </p>
        </div>
      </section>
    );
  }

  const formation = data.data;

  const days = formation.formation_days ?? [];

  const availableDays = days.filter(
    (day) => day.status === "available"
  );

  const cities = [
    ...new Set(
      availableDays.map((day) => day.city)
    ),
  ];

  const personalPrices = availableDays
    .map((day) => Number(day.price))
    .filter((price) => !Number.isNaN(price));

  const cpfPrices = availableDays
    .map((day) => Number(day.cpf_price))
    .filter((price) => !Number.isNaN(price));

  const minPersonalPrice =
    personalPrices.length > 0
      ? Math.min(...personalPrices)
      : Number(formation.personal_price);

  const cpfPrice =
    cpfPrices.length > 0
      ? Math.min(...cpfPrices)
      : null;

  return (
    <section className="overflow-hidden bg-charcoal py-24 text-ivory lg:py-40">
      <div className="wrap">

        {/* Header */}
        <Reveal>
          <p className="label flex items-center gap-4 text-ivory/50">
            <span className="h-px w-10 bg-current" />

            Formation
          </p>
        </Reveal>

        <Headline
          lines={[formation.title]}
          className="mt-6 text-[clamp(3rem,8.5vw,7.5rem)] text-ivory"
        />

        {/* Main content */}
        <div className="mt-14 grid gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-12">

          {/* Image */}
          <div className="relative lg:col-span-6">
            {formation.image ? (
              <ImageReveal
                src={formation.image}
                alt={formation.title}
                className="aspect-[4/5] w-full lg:aspect-[3/4]"
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center bg-white/5 lg:aspect-[3/4]">
                <span className="text-sm text-ivory/40">
                  Image à venir
                </span>
              </div>
            )}

            <Reveal
              delay={0.3}
              className="absolute bottom-5 left-5 hidden sm:block"
            >
              <p className="label bg-ink/50 px-4 py-3 text-[10px] text-ivory/85 backdrop-blur-sm">
                {formation.title}
              </p>
            </Reveal>
          </div>

          {/* Information */}
          <div className="flex flex-col lg:col-span-5 lg:col-start-8">

            {/* Description */}
            <Reveal>
              <p className="font-serif text-[1.5rem] leading-[1.3] text-ivory/90 md:text-[1.8rem]">
                {formation.description}
              </p>
            </Reveal>

            {/* Steps */}
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
                      <div className="border-b border-ivory/10 py-4">

                        <div className="flex items-baseline gap-6">
                          <span className="label w-6 text-[10px] text-ivory/35">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span className="font-serif text-xl uppercase tracking-[0.03em] md:text-2xl">
                            {step.title}
                          </span>
                        </div>

                        {step.description && (
                          <p className="ml-12 mt-2 text-sm font-light text-ivory/50">
                            {step.description}
                          </p>
                        )}

                      </div>
                    </Reveal>
                  ))}

                </div>
              </div>
            )}

            {/* Formation information */}
            <Reveal delay={0.1}>
              <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4">

                <Info
                  label="Villes"
                  value={`${cities.length}`}
                  sub={cities.join(" · ")}
                />

                <Info
                  label="Personnel"
                  value={formatPrice(minPersonalPrice)}
                  sub="selon la ville"
                />

                <Info
                  label="CPF"
                  value={
                    cpfPrice
                      ? formatPrice(cpfPrice)
                      : "Sur demande"
                  }
                />

                <Info
                  label="Acompte"
                  value={formatPrice(formation.deposit_amount)}
                  sub="À la réservation"
                />

              </div>

              {/* Dates */}
              {availableDays.length > 0 && (
                <div className="mt-12">

                  <p className="label text-ivory/50">
                    Prochaines sessions
                  </p>

                  <div className="mt-4 space-y-3">

                    {availableDays.slice(0, 5).map((day) => (
                      <div
                        key={day.id}
                        className="flex items-center justify-between border-b border-ivory/10 py-4"
                      >
                        <div>
                          <p className="font-serif text-lg">
                            {day.city}
                          </p>

                          <p className="text-xs text-ivory/45">
                            {formatDate(day.start_date)}
                            {" — "}
                            {formatDate(day.end_date)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-serif">
                            {formatPrice(day.price)}
                          </p>

                          <p className="text-xs text-ivory/45">
                            {day.remaining_places} place
                            {day.remaining_places > 1
                              ? "s"
                              : ""}{" "}
                            restante
                            {day.remaining_places > 1
                              ? "s"
                              : ""}
                          </p>
                        </div>
                      </div>
                    ))}

                  </div>

                </div>
              )}

              {/* Buttons */}
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

              {/* Cities */}
              {cities.length > 0 && (
                <p className="mt-7 text-[10px] uppercase tracking-[0.26em] text-ivory/40">
                  Sessions · {cities.join(" · ")}
                </p>
              )}

            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
