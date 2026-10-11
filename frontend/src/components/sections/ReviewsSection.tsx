
import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";

interface Review {
  id: number;
  name: string;
  formation: string | null;
  rating: number;
  text: string;
  initials: string;
}

interface ReviewsResponse {
  success: boolean;
  data: Review[];
}

const API_URL = import.meta.env.VITE_API_URL;

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReviews() {
      try {
        setLoading(true);
        setError(false);

        if (!API_URL) {
          throw new Error("VITE_API_URL n'est pas configurée.");
        }

        const response = await fetch(
          `${API_URL.replace(/\/$/, "")}/contenu/reviews`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Impossible de récupérer les avis.");
        }

        const result: ReviewsResponse = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error("Format de réponse API invalide.");
        }

        setReviews(result.data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Erreur chargement des avis :", err);
        setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchReviews();

    return () => controller.abort();
  }, []);

  return (
    <section
      id="avis"
      className="scroll-mt-16 bg-[#f8f7f4] px-6 py-20 text-[#171717] md:px-12 md:py-28 lg:px-20 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center md:mb-20">
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="h-px w-9 bg-neutral-400" />

            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-neutral-500 md:text-xs">
              Témoignages
            </p>

            <span className="h-px w-9 bg-neutral-400" />
          </div>

          <h2 className="font-serif text-4xl font-normal leading-[1.12] tracking-[-0.035em] sm:text-5xl md:text-6xl">
            Elles nous font
            <span className="mt-1 block italic">confiance.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm font-light leading-7 text-neutral-600 md:text-base md:leading-8">
            Découvrez les expériences de nos élèves et leur parcours
            au sein d'AS Academy.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <p className="py-10 text-center text-sm text-neutral-500">
            Chargement des témoignages...
          </p>
        )}

        {/* Error state */}
        {!loading && error && (
          <p className="py-10 text-center text-sm text-neutral-500">
            Les témoignages sont momentanément indisponibles.
          </p>
        )}

        {/* Empty state */}
        {!loading && !error && reviews.length === 0 && (
          <p className="py-10 text-center text-sm text-neutral-500">
            Les témoignages seront bientôt disponibles.
          </p>
        )}

        {/* Dynamic review cards */}
        {!loading && !error && reviews.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="group flex flex-col border border-neutral-200/80 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_18px_45px_rgba(0,0,0,0.05)] sm:p-8 lg:p-9"
              >
                <div className="mb-7 flex items-start justify-between">
                  <div
                    className="flex gap-1"
                    aria-label={`${review.rating} étoiles sur 5`}
                  >
                    {Array.from(
                      { length: Math.max(0, Math.min(5, review.rating)) },
                      (_, index) => (
                        <Star
                          key={index}
                          size={13}
                          strokeWidth={1.5}
                          className="fill-[#b49a72] text-[#b49a72]"
                          aria-hidden="true"
                        />
                      )
                    )}
                  </div>

                  <Quote
                    size={25}
                    strokeWidth={1}
                    className="text-neutral-200 transition-colors duration-300 group-hover:text-[#b49a72]"
                    aria-hidden="true"
                  />
                </div>

                <p className="flex-1 font-serif text-lg font-normal leading-[1.8] text-neutral-700 md:text-xl md:leading-[1.75]">
                  « {review.text} »
                </p>

                <div className="mt-9 border-t border-neutral-100 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-[#f8f7f4] font-serif text-sm text-neutral-700">
                      {review.initials}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-medium tracking-wide text-neutral-900">
                        {review.name}
                      </h3>

                      {review.formation && (
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.13em] text-neutral-500 sm:text-[11px]">
                          {review.formation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <p className="text-xs font-light leading-6 text-neutral-500">
            Votre expérience chez AS Academy nous tient à cœur.
          </p>
        </div>
      </div>
    </section>
  );
}
