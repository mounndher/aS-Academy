import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getFormation, isScheduled } from "@/data/formations";
import { site } from "@/data/site";
import { useSiteUI } from "@/context/SiteUIContext";
import { EASE } from "@/lib/motion";
import { scrollToId } from "@/lib/scroll";
import { Button } from "@/components/ui/Button";

/**
 * Sticky bottom CTA for mobile (Instagram traffic).
 * On a formation page it jumps to the inline reservation form and hides
 * once the form is on screen; elsewhere it leads to the Formations page.
 */
export function MobileStickyCTA() {
  const { openBooking, menuOpen } = useSiteUI();
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  const match = pathname.match(/^\/formations\/([^/]+)$/);
  const formation = match ? getFormation(match[1]) : undefined;

  useEffect(() => {
    const onScroll = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.85;
      const form = document.getElementById("reservation");
      const formInView = form ? form.getBoundingClientRect().top < window.innerHeight * 0.7 : false;
      setVisible(pastHero && !formInView);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const label = formation
    ? isScheduled(formation)
      ? "Réserver ma place"
      : "Demander une date"
    : site.cta.book;

  const handleClick = () => (formation ? scrollToId("reservation") : openBooking());
  const show = visible && !menuOpen && pathname !== "/formations";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="sticky-cta"
          className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ivory/90 backdrop-blur-md md:hidden"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="px-5 py-3">
            <Button variant="dark" className="w-full" onClick={handleClick}>
              {label}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
