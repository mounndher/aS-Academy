
import { useEffect, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";
import { ReservationForm } from "@/components/booking/ReservationForm";

export function FormationReservationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();

  const dayId = searchParams.get("day");

  const {
    data: formation,
    loading,
    error,
  } = useFormation(slug);

  const selectedSession = useMemo(() => {
    if (!dayId || !formation?.formationDays) {
      return null;
    }

    return (
      formation.formationDays.find(
        (day) => String(day.id) === dayId
      ) ?? null
    );
  }, [formation, dayId]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory py-32">
        <div className="wrap">
          Chargement de votre réservation...
        </div>
      </main>
    );
  }

  if (error || !formation || !selectedSession) {
    return (
      <main className="min-h-screen bg-ivory py-32">
        <div className="wrap">
          <h1 className="display text-4xl">
            Session introuvable
          </h1>

          <p className="mt-4 text-ink/60">
            Veuillez sélectionner une session disponible.
          </p>

          <Link
            to="/planning"
            className="mt-8 inline-flex border border-ink px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            Retour au planning
          </Link>
        </div>
      </main>
    );
  }

  const formatDate = (value: string | null | undefined) => {
    if (!value) return "Date à confirmer";

    const match = String(value).match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

    if (!match) return "Date à confirmer";

    const date = new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3])
    );

    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatPrice = (value: unknown) => {
    if (value === null || value === undefined || value === "") {
      return "À confirmer";
    }

    const price = Number(value);

    return Number.isFinite(price)
      ? `${price.toLocaleString("fr-FR")} €`
      : "À confirmer";
  };

  const price =
    selectedSession.personal_price ??
    formation.personal_price;

  return (
    <main className="min-h-screen bg-ivory">
      <section className="py-16 sm:py-20 lg:py-28">
        <div className="wrap">
          <Link
            to="/planning"
            className="label text-ink/45 hover:opacity-70"
          >
            ← Retour au planning
          </Link>

          <div className="mt-12 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="label text-ink/45">
                AS Academy · Réservation
              </p>

              <h1 className="display mt-5 text-5xl lg:text-7xl">
                Réservez votre place
              </h1>

              <p className="mt-6 text-sm leading-7 text-ink/60">
                Vérifiez les informations de votre session,
                puis complétez le formulaire pour réserver.
              </p>

              <div className="mt-10 border-y border-ink/10 py-7">
                <p className="label text-ink/40">
                  Formation
                </p>

                <h2 className="display mt-3 text-3xl">
                  {formation.title}
                </h2>

                <div className="mt-7 space-y-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-ink/50">Ville</span>
                    <span>{selectedSession.city || "À confirmer"}</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-ink/50">Début</span>
                    <span>
                      {formatDate(selectedSession.start_date)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-ink/50">Fin</span>
                    <span>
                      {formatDate(selectedSession.end_date)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-ink/50">Tarif</span>
                    <span className="font-semibold">
                      {formatPrice(price)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-ink/50">
                      Places restantes
                    </span>
                    <span>
                      {Number(selectedSession.remaining_places) || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-ink/10 bg-white p-6 sm:p-10 lg:p-12">
              <p className="label text-ink/45">
                Vos informations
              </p>

              <h2 className="display mt-4 text-3xl sm:text-4xl">
                Finaliser la réservation
              </h2>

              <div className="mt-8">
                <ReservationForm
                  formation={formation}
                  formationDay={selectedSession}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default FormationReservationPage;
