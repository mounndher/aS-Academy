import { Star } from "lucide-react";

const reviews = [
  {
    name: "Sarah M.",
    formation: "Formation Nail Art",
    rating: 5,
    text: "Une magnifique expérience ! La formatrice est très professionnelle, patiente et à l'écoute. J'ai appris énormément de nouvelles techniques.",
    initials: "SM",
  },
  {
    name: "Inès B.",
    formation: "Formation Onglerie",
    rating: 5,
    text: "Une formation complète avec beaucoup de pratique. Je recommande AS Academy à toutes celles qui souhaitent développer leurs compétences.",
    initials: "IB",
  },
  {
    name: "Lina K.",
    formation: "Formation Perfectionnement",
    rating: 5,
    text: "Une équipe professionnelle et une excellente ambiance. La formation m'a permis de gagner en confiance et d'améliorer mon travail.",
    initials: "LK",
  },
];

export function ReviewsSection() {
  return (
    <section
      id="avis"
      className="bg-white px-6 py-20 text-neutral-900 md:px-12 lg:px-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Témoignages
          </p>

          <h2 className="text-3xl font-light tracking-tight md:text-5xl">
            Elles nous font{" "}
            <span className="font-semibold">confiance.</span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-neutral-600 md:text-base">
            Découvrez les expériences de nos élèves et leur parcours au sein
            d'AS Academy.
          </p>

          <div className="mx-auto mt-6 h-px w-16 bg-neutral-900" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="flex flex-col border border-neutral-200 bg-neutral-50 p-7 transition duration-300 hover:-translate-y-1 hover:border-neutral-400 hover:shadow-lg md:p-8"
            >
              <div
                className="mb-5 flex gap-1"
                aria-label={`${review.rating} étoiles sur 5`}
              >
                {Array.from({ length: review.rating }).map((_, index) => (
                  <Star
                    key={index}
                    size={15}
                    className="fill-neutral-900 text-neutral-900"
                    aria-hidden="true"
                  />
                ))}
              </div>

              <p className="flex-1 text-sm leading-7 text-neutral-700">
                « {review.text} »
              </p>

              <div className="mt-8 flex items-center gap-4 border-t border-neutral-200 pt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                  {review.initials}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {review.name}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    {review.formation}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs leading-6 text-neutral-500">
          Les témoignages doivent être remplacés par les avis authentiques de
          vos élèves avant la publication.
        </p>
      </div>
    </section>
  );
}
