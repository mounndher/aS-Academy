import { useEffect, useMemo } from "react";
import {
  Link,
  useLocation,
  useParams,
} from "react-router-dom";

import { useFormation } from "@/hooks/useFormation";

import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";

import type {
  FormationDay,
} from "@/types/formation";

/* =========================================================
   DATE
========================================================= */

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

function formatDateRange(
  start: string,
  end: string
) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startDay =
    startDate.toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
      }
    );

  const endDay =
    endDate.toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
      }
    );

  const startMonth =
    startDate.toLocaleDateString(
      "fr-FR",
      {
        month: "long",
      }
    );

  const endMonth =
    endDate.toLocaleDateString(
      "fr-FR",
      {
        month: "long",
      }
    );

  const startYear =
    startDate.getFullYear();

  const endYear =
    endDate.getFullYear();

  if (
    startMonth === endMonth &&
    startYear === endYear
  ) {
    return `${startDay} — ${endDay} ${endMonth} ${endYear}`;
  }

  return `${startDay} ${startMonth} ${startYear} — ${endDay} ${endMonth} ${endYear}`;
}

function formatPrice(
  price: number | string | null
) {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "À venir";
  }

  return `${Number(price).toLocaleString(
    "fr-FR"
  )} €`;
}

/* =========================================================
   PAGE
========================================================= */

export function FormationDetailPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const location = useLocation();

  /* =======================================================
     GET FORMATION
  ======================================================= */

  const {
    data: formation,
    loading,
    error,
  } = useFormation(slug);

  /* =======================================================
     GET DAY ID FROM URL
     
     Example:
     
     ?day=1
  ======================================================= */

  const selectedDayId = useMemo(() => {
    const params =
      new URLSearchParams(
        location.search
      );

    const value =
      params.get("day");

    if (!value) {
      return null;
    }

    const id = Number(value);

    return Number.isFinite(id)
      ? id
      : null;
  }, [location.search]);

  /* =======================================================
     SELECT FORMATION DAY
  ======================================================= */

  const selectedDay: FormationDay | null =
    useMemo(() => {
      if (!formation) {
        return null;
      }

      const days =
        Array.isArray(
          formation.formationDays
        )
          ? formation.formationDays
          : [];

      /*
       * If URL contains ?day=123
       * find exactly that session.
       */

      if (selectedDayId !== null) {
        return (
          days.find(
            (day) =>
              Number(day.id) ===
              selectedDayId
          ) ?? null
        );
      }

      /*
       * If user opens the detail page
       * directly without ?day=
       *
       * We can show the first session.
       */

      return days[0] ?? null;
    }, [
      formation,
      selectedDayId,
    ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="bg-white py-32">
        <div className="wrap">
          <p className="text-sm text-ink/50">
            Chargement de la formation...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !formation) {
    return (
      <main className="bg-white py-32">
        <div className="wrap">
          <p className="text-sm text-red-500">
            {error ??
              "Formation introuvable."}
          </p>

          <div className="mt-8">
            <Button
              to="/formations"
              variant="dark"
              icon="arrow"
            >
              Toutes les formations
            </Button>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     NO SESSION
  ======================================================= */

  if (!selectedDay) {
    return (
      <main className="bg-white py-32">
        <div className="wrap">

          <p className="text-sm text-ink/50">
            Aucune session disponible.
          </p>

          <div className="mt-8">
            <Button
              to="/formations"
              variant="dark"
              icon="arrow"
            >
              Toutes les formations
            </Button>
          </div>

        </div>
      </main>
    );
  }

  const programme =
    formation.programme;

  const duration =
    programme?.duration ??
    "3 jours";

  /* =======================================================
     RESERVATION URL
     
     Keep the SAME day selected.
  ======================================================= */

  const reservationUrl =
    `/formations/${formation.slug}?day=${selectedDay.id}#reservation`;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="bg-white">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="py-20 lg:py-28">
        <div className="wrap">

          {/* BACK */}

          <Link
            to="/formations"
            className="label text-ink/50 transition-opacity hover:opacity-60"
          >
            ← Toutes les formations
          </Link>

          {/* HERO GRID */}

          <div className="mt-16 grid gap-16 lg:grid-cols-2 lg:items-start">

            {/* IMAGE */}

            <Reveal>
              {formation.image ? (
                <ImageReveal
                  src={formation.image}
                  alt={formation.title}
                  className="aspect-[4/5] w-full"
                />
              ) : (
                <div className="aspect-[4/5] w-full bg-ink/5" />
              )}
            </Reveal>

            {/* CONTENT */}

            <Reveal delay={0.1}>

              <p className="label text-ink/50">
                {programme?.name ??
                  formation.title}
              </p>

              <h1 className="display mt-6 max-w-2xl text-[clamp(3rem,7vw,6rem)]">
                {formation.title}
              </h1>

              {formation.description && (
                <div
                  className="mt-8 max-w-xl text-base font-light leading-relaxed text-ink/60"
                  dangerouslySetInnerHTML={{
                    __html:
                      formation.description,
                  }}
                />
              )}

              {/* =================================================
                  SELECTED SESSION
              ================================================= */}

              <div className="mt-12 border-t border-ink/10">

                <p className="label mt-6 text-ink/40">
                  Session sélectionnée
                </p>

                <div className="mt-5 flex items-start justify-between border-b border-ink/10 py-6">

                  <div>

                    <h2 className="font-serif text-3xl">
                      {selectedDay.city}
                    </h2>

                    <p className="mt-2 text-sm text-ink/50">
                      {formatDateRange(
                        selectedDay.start_date,
                        selectedDay.end_date
                      )}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="font-serif text-xl">
                      {formatPrice(
                        selectedDay.personal_price
                      )}
                    </p>

                    <p className="mt-1 text-xs text-ink/50">
                      {selectedDay.remaining_places}{" "}
                      places restantes
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  INFORMATION
              ================================================= */}

              <dl className="mt-8 grid grid-cols-2 border-t border-ink/10 sm:grid-cols-3">

                <div className="border-b border-ink/10 py-5">
                  <dt className="label text-[10px] text-ink/40">
                    Durée
                  </dt>

                  <dd className="mt-2 font-serif text-xl">
                    {duration}
                  </dd>
                </div>

                <div className="border-b border-ink/10 py-5">
                  <dt className="label text-[10px] text-ink/40">
                    Tarif
                  </dt>

                  <dd className="mt-2 font-serif text-xl">
                    {formatPrice(
                      selectedDay.personal_price
                    )}
                  </dd>
                </div>

                <div className="col-span-2 border-b border-ink/10 py-5 sm:col-span-1">
                  <dt className="label text-[10px] text-ink/40">
                    Acompte
                  </dt>

                  <dd className="mt-2 font-serif text-xl">
                    {formatPrice(
                      formation.deposit_amount
                    )}
                  </dd>
                </div>

              </dl>

              {/* =================================================
                  RESERVE
              ================================================= */}

              <div className="mt-10">

                <Button
                  to={reservationUrl}
                  variant="dark"
                  icon="arrow"
                  state={{
                    formationDayId:
                      selectedDay.id,
                    scrollTo:
                      "reservation",
                  }}
                >
                  Réserver cette session
                </Button>

              </div>

            </Reveal>

          </div>
        </div>
      </section>

      {/* =====================================================
          OTHER SESSIONS
          
          Optional:
          Show other sessions as links.
      ===================================================== */}

      <section className="border-t border-ink/10 py-20 lg:py-28">
        <div className="wrap">

          <p className="label text-ink/50">
            Autres sessions disponibles
          </p>

          <div className="mt-8">

            {formation.formationDays
              .filter(
                (day) =>
                  day.id !==
                  selectedDay.id
              )
              .map((day) => (
                <Link
                  key={day.id}
                  to={`/formations/${formation.slug}?day=${day.id}`}
                  className="flex items-center justify-between border-b border-ink/10 py-6 transition-opacity hover:opacity-60"
                >

                  <div>
                    <h3 className="font-serif text-2xl">
                      {day.city}
                    </h3>

                    <p className="mt-1 text-sm text-ink/50">
                      {formatDateRange(
                        day.start_date,
                        day.end_date
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-serif text-lg">
                      {formatPrice(
                        day.personal_price
                      )}
                    </p>

                    <p className="text-xs text-ink/50">
                      {day.remaining_places}{" "}
                      places
                    </p>
                  </div>

                </Link>
              ))}

          </div>

        </div>
      </section>

    </main>
  );
}

export default FormationDetailPage;