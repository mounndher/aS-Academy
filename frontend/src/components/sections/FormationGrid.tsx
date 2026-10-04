import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { useFormations } from "@/hooks/useFormations";
import { getStorageUrl } from "@/services/api";

export function FormationGrid() {
  const {
    formations = [],
    loading,
    error,
  } = useFormations();

  if (loading) {
    return (
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden bg-gray-100"
              >
                <div className="h-72 bg-gray-200" />

                <div className="space-y-4 p-6">
                  <div className="h-4 w-24 bg-gray-200" />
                  <div className="h-7 w-3/4 bg-gray-200" />
                  <div className="h-4 w-full bg-gray-200" />
                  <div className="h-4 w-2/3 bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (formations.length === 0) {
    return (
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="py-12 text-center">
            <p className="text-gray-500">
              Aucune formation disponible pour le moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {formations.map((formation, index) => {
            const image = getStorageUrl(
              formation.image ??
                formation.cover_image ??
                formation.thumbnail ??
                null
            );

            return (
              <motion.article
                key={formation.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                }}
                className="group overflow-hidden bg-white"
              >
                <Link to={`/formations/${formation.slug}`}>
                  <div className="relative h-72 overflow-hidden bg-gray-100">
                    {image ? (
                      <img
                        src={image}
                        alt={formation.title ?? "Formation"}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100">
                        <span className="text-sm text-gray-400">
                          Aucune image
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                  </div>
                </Link>

                <div className="p-6">
                  {formation.category && (
                    <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#C9A96A]">
                      {typeof formation.category === "string"
                        ? formation.category
                        : formation.category.name}
                    </p>
                  )}

                  <h3 className="mb-3 font-serif text-2xl text-[#18453B]">
                    {formation.title}
                  </h3>

                  {(formation.short_description ||
                    formation.description) && (
                    <p className="mb-5 line-clamp-3 text-sm leading-6 text-gray-600">
                      {formation.short_description ||
                        formation.description}
                    </p>
                  )}

                  <Link
                    to={`/formations/${formation.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.15em] text-[#18453B] transition-colors hover:text-[#C9A96A]"
                  >
                    Découvrir la formation

                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FormationGrid;