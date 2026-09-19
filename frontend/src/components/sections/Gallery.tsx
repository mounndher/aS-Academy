import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/utils/cn";
import { GALLERY_CATEGORIES, gallery, type GalleryCategory, type GallerySize } from "@/data/gallery";
import { EASE } from "@/lib/motion";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

type Filter = "Tous" | GalleryCategory;

const sizeClass: Record<GallerySize, string> = {
  small: "col-span-1 row-span-1",
  tall: "col-span-1 row-span-2",
  wide: "col-span-2 row-span-1",
  large: "col-span-2 row-span-2",
};

export function Gallery() {
  const [filter, setFilter] = useState<Filter>("Tous");
  const items = filter === "Tous" ? gallery : gallery.filter((g) => g.category === filter);

  return (
    <section id="realisations" className="scroll-mt-16 bg-white py-24 lg:py-40">
      <div className="wrap">
        <SectionHeader
          label="Portfolio"
          title={["Nos", "Réalisations"]}
          subtitle="Cils à cils, volume russe, mapping — un aperçu du travail réalisé en formation et en pose."
        />

        {/* Filters */}
        <Reveal>
          <div className="no-scrollbar -mx-5 mt-14 flex gap-x-8 overflow-x-auto border-b border-ink/10 px-5 pb-4 sm:mx-0 sm:px-0 lg:mt-20">
            {(["Tous", ...GALLERY_CATEGORIES] as Filter[]).map((cat) => {
              const active = filter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "label relative shrink-0 whitespace-nowrap py-2.5 text-[10px] transition-colors duration-500",
                    active ? "text-ink" : "text-ink/40 hover:text-ink/75",
                  )}
                  aria-pressed={active}
                >
                  {cat}
                  {active && (
                    <motion.span
                      layoutId="gallery-underline"
                      className="absolute -bottom-[17px] left-0 h-px w-full bg-ink"
                      transition={{ duration: 0.6, ease: EASE }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Asymmetric grid */}
        <motion.div
          layout
          className="mt-8 grid grid-flow-dense grid-cols-2 auto-rows-[42vw] gap-3 md:grid-cols-4 md:auto-rows-[21vw] md:gap-4 xl:auto-rows-[15.5rem]"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item, i) => (
              <motion.figure
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.8, ease: EASE }}
                className={cn("group relative overflow-hidden bg-sand/40", sizeClass[item.size])}
              >
                <Photo
                  src={item.src}
                  fallback={item.fallback}
                  alt={item.alt}
                  priority={i < 4}
                  imgClassName="transition-transform duration-[1400ms] ease-luxury group-hover:scale-[1.05]"
                />
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-ink/65 to-transparent p-4 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                  <span className="label text-[10px] text-ivory">{item.category}</span>
                  {item.authentic && (
                    <span className="label text-[9px] text-ivory/70">AS Academy</span>
                  )}
                </figcaption>
              </motion.figure>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
