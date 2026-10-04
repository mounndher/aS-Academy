
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { useFormationFeature } from "@/hooks/useFormationFeature";
import { site } from "@/data/site";

import { useSiteUI } from "@/context/SiteUIContext";
import { EASE } from "@/lib/motion";
import { scrollToId } from "@/lib/scroll";

import { Button } from "@/components/ui/Button";

export function MobileStickyCTA() {
  const { openBooking, menuOpen } = useSiteUI();
  const { pathname } = useLocation();

  const [visible, setVisible] = useState(false);

  const isFormationPage =
    /^\/formations\/[^/]+$/.test(pathname);

  /*
   * Get formation dynamically from Laravel API.
   *
   * No more:
   * getFormation(...)
   * isScheduled(...)
   * @/data/formations
   */
  const {
    formation,
    loading,
  } = useFormationFeature();

  useEffect(() => {
    const onScroll = () => {
      const pastHero =
        window.scrollY > window.innerHeight * 0.85;

      const form =
        document.getElementById("reservation");

      const formInView = form
        ? form.getBoundingClientRect().top <
          window.innerHeight * 0.7
        : false;

      setVisible(
        pastHero &&
        !formInView
      );
    };

    onScroll();

    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        onScroll
      );
    };
  }, [pathname]);

  /*
   * Determine if at least one future formation day
   * is available and has remaining places.
   */
  const isScheduled =
    formation?.formationDays?.some(
      (day) =>
        day.status === "available" &&
        Number(day.remaining_places) > 0
    ) ?? false;

  const label = isFormationPage
    ? loading
      ? "Chargement..."
      : isScheduled
        ? "Réserver ma place"
        : "Demander une date"
    : site.cta.book;

  const handleClick = () => {
    if (isFormationPage && formation) {
      scrollToId("reservation");
      return;
    }

    openBooking();
  };

  const show =
    visible &&
    !menuOpen &&
    pathname !== "/formations";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="sticky-cta"
          className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ivory/90 backdrop-blur-md md:hidden"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{
            duration: 0.6,
            ease: EASE,
          }}
        >
          <div className="px-5 py-3">
            <Button
              variant="dark"
              className="w-full"
              onClick={handleClick}
            >
              {label}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
