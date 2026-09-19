import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { site } from "@/data/site";
import { useSiteUI } from "@/context/SiteUIContext";
import { useSectionNav } from "@/hooks/useSectionNav";
import { useScrollLock } from "@/hooks/useScrollLock";
import { EASE } from "@/lib/motion";
import { Button } from "@/components/ui/Button";

export function MobileMenu() {
  const { menuOpen, setMenuOpen, openBooking } = useSiteUI();
  const goTo = useSectionNav();
  const location = useLocation();

  useScrollLock(menuOpen);

  // Close on route change or when resizing to desktop
  useEffect(() => setMenuOpen(false), [location.pathname, setMenuOpen]);
  useEffect(() => {
    const onResize = () => window.innerWidth >= 1024 && setMenuOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setMenuOpen]);

  const navigate = useNavigate();
  const handleNav = (id: string) => {
    setMenuOpen(false);
    window.setTimeout(() => {
      if (id === "formations") {
        navigate("/formations");
      } else {
        goTo(id);
      }
    }, 80);
  };

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          key="mobile-menu"
          className="fixed inset-0 z-40 flex flex-col bg-ink text-ivory lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: EASE } }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <div className="wrap flex flex-1 flex-col overflow-y-auto pt-24 pb-8">
            <nav className="flex-1" aria-label="Menu mobile">
              {site.nav.map((item, i) => (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className="flex w-full items-baseline gap-5 border-b border-ivory/10 py-4 text-left font-serif text-[clamp(2rem,8.5vw,3.25rem)] uppercase leading-none tracking-[0.01em]"
                  initial={{ y: 36, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.12 + i * 0.06, duration: 0.85, ease: EASE }}
                >
                  <span className="label w-6 text-[10px] text-ivory/40">0{i + 1}</span>
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </nav>

            <motion.div
              className="mt-10 space-y-8"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.9, ease: EASE }}
            >
              <Button variant="light" size="lg" className="w-full" onClick={() => openBooking()}>
                {site.cta.book}
              </Button>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.28em] text-ivory/50">
                {site.cities.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>

              <div className="flex items-end justify-between gap-6 border-t border-ivory/10 pt-6 text-sm text-ivory/60">
                <address className="not-italic leading-relaxed">
                  {site.address.street}
                  <br />
                  {site.address.city}
                </address>
                <a
                  href={site.instagram.url}
                  target="_blank"
                  rel="noreferrer"
                  className="label link-line text-[10px] text-ivory"
                >
                  {site.instagram.handle}
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
