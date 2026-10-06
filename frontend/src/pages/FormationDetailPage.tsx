import {
  useParams,
  useSearchParams,
} from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";

export function FormationDetailPage() {
  const { slug } =
    useParams<{
      slug: string;
    }>();

  const [searchParams] =
    useSearchParams();

  const dayId =
    searchParams.get("day");

  const {
    data: formation,
    loading,
    error,
  } = useFormation(slug);

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <main>
        <div className="wrap py-24">
          <p className="text-sm text-ink/50">
            Chargement de la formation...
          </p>
        </div>
      </main>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error || !formation) {
    return (
      <main>
        <div className="wrap py-24">
          <p className="text-sm text-red-500">
            {error ??
              "Formation introuvable."}
          </p>
        </div>
      </main>
    );
  }

  // =======================================================
  // ALL DAYS
  // =======================================================

  const days =
    Array.isArray(
      formation.formationDays
    )
      ? formation.formationDays
      : [];

  // =======================================================
  // SELECTED DAY
  // =======================================================

  const selectedDay =
    dayId
      ? days.find(
          (day) =>
            String(day.id) ===
            String(dayId)
        )
      : null;

  // =======================================================
  // IF URL DOES NOT HAVE A DAY
  // =======================================================

  if (!selectedDay) {
    return (
      <main>
        <div className="wrap py-24">

          <h1 className="display text-4xl">
            {formation.title}
          </h1>

          <p className="mt-6 text-sm text-red-500">
            Aucune session de formation
            sélectionnée.
          </p>

        </div>
      </main>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <main>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="bg-white py-24 lg:py-40">
        <div className="wrap">

          <p className="label text-ink/40">
            {formation.programme?.name ??
              "Formation"}
          </p>

          <h1 className="display mt-5 max-w-4xl text-[clamp(3rem,8vw,7rem)]">
            {formation.title}
          </h1>

          <p className="mt-6 font-serif text-2xl text-ink/70">
            {selectedDay.city}
          </p>

          {formation.description && (
            <div
              className="mt-8 max-w-2xl text-base font-light leading-relaxed text-ink/60"
              dangerouslySetInnerHTML={{
                __html:
                  formation.description,
              }}
            />
          )}

        </div>
      </section>

      {/* =================================================
          SELECTED SESSION
      ================================================= */}

      <section className="bg-white pb-24 lg:pb-40">
        <div className="wrap">

          <div className="border-t border-ink/10 pt-10">

            <p className="label text-ink/40">
              Session sélectionnée
            </p>

            <h2 className="display mt-4 text-4xl">
              {selectedDay.city}
            </h2>

            <div className="mt-10 grid gap-0 border-t border-ink/10 sm:grid-cols-2 lg:grid-cols-4">

              <div className="border-b border-ink/10 py-6 pr-6">
                <p className="label text-ink/40">
                  Dates
                </p>

                <p className="mt-2 font-serif text-xl">
                  {selectedDay.start_date}
                  {" — "}
                  {selectedDay.end_date}
                </p>
              </div>

              <div className="border-b border-ink/10 py-6 pr-6">
                <p className="label text-ink/40">
                  Tarif
                </p>

                <p className="mt-2 font-serif text-xl">
                  {selectedDay.personal_price ??
                    "À venir"}{" "}
                  €
                </p>
              </div>

              <div className="border-b border-ink/10 py-6 pr-6">
                <p className="label text-ink/40">
                  Places
                </p>

                <p className="mt-2 font-serif text-xl">
                  {selectedDay.remaining_places}
                </p>
              </div>

              <div className="border-b border-ink/10 py-6 pr-6">
                <p className="label text-ink/40">
                  Statut
                </p>

                <p className="mt-2 font-serif text-xl">
                  {selectedDay.status}
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

    </main>
  );
}

export default FormationDetailPage;