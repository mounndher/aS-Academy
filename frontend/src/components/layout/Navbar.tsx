import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { cn } from "@/utils/cn";
import { site } from "@/data/site";

import { useSiteUI } from "@/context/SiteUIContext";
import { useSectionNav } from "@/hooks/useSectionNav";
import { useSiteSettings } from "@/hooks/useSiteSettings";

import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  const {
    menuOpen,
    setMenuOpen,
    openBooking,
  } = useSiteUI();

  const goTo = useSectionNav();
  const navigate = useNavigate();

  const { pathname } = useLocation();

  const { settings } = useSiteSettings();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener(
        "scroll",
        onScroll
      );
    };
  }, []);

  const solid =
    (scrolled || pathname !== "/") &&
    !menuOpen;

  const siteName =
    settings?.site_name || "AS Academy";

  const logo = settings?.logo || null;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,color,backdrop-filter] duration-700 ease-luxury",
        solid
          ? "border-ink/10 bg-ivory/85 text-ink backdrop-blur-md"
          : "border-transparent bg-transparent text-ivory"
      )}
    >
      <div className="wrap flex h-[68px] items-center justify-between sm:h-[76px] lg:h-[88px]">
        {/* LOGO */}
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            goTo("accueil");
          }}
          className="flex min-w-0 max-w-[calc(100%-80px)] items-baseline gap-2.5 transition-opacity duration-500 hover:opacity-70"
          aria-label={`${siteName} — Accueil`}
        >
          {logo ? (
            <img
              src={logo}
              alt={siteName}
              className="h-9 max-w-[150px] w-auto object-contain sm:h-10 sm:max-w-[180px] lg:h-12 lg:max-w-[220px]"
            />
          ) : (
            <>
              <span className="font-serif text-[24px] font-semibold leading-none tracking-[0.02em] sm:text-[26px] lg:text-[30px]">
                AS
              </span>

              <span className="label text-[9px] tracking-[0.28em] sm:text-[10px] sm:tracking-[0.36em]">
                Academy
              </span>
            </>
          )}
        </button>

        {/* DESKTOP NAVIGATION */}
        <nav
          className="hidden items-center gap-8 lg:flex xl:gap-10"
          aria-label="Navigation principale"
        >
          {site.nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMenuOpen(false);

                if (item.id === "formations") {
                  navigate("/formations");
                } else {
                  goTo(item.id);
                }
              }}
              className="label link-line text-[10px] tracking-[0.28em] opacity-75 transition-opacity duration-500 hover:opacity-100"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* RIGHT */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-5">
          <Button
            variant={
              solid
                ? "outline-dark"
                : "outline-light"
            }
            className="hidden md:inline-flex"
            onClick={() => openBooking()}
          >
            {site.cta.book}
          </Button>

          {/* HAMBURGER */}
          <button
            type="button"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center lg:hidden"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-expanded={menuOpen}
            aria-label={
              menuOpen
                ? "Fermer le menu"
                : "Ouvrir le menu"
            }
          >
            <span
              className={cn(
                "absolute h-px w-7 bg-current transition-transform duration-500 ease-luxury",
                menuOpen
                  ? "translate-y-0 rotate-45"
                  : "-translate-y-[4px]"
              )}
            />

            <span
              className={cn(
                "absolute h-px w-7 bg-current transition-transform duration-500 ease-luxury",
                menuOpen
                  ? "translate-y-0 -rotate-45"
                  : "translate-y-[4px]"
              )}
            />
          </button>
        </div>
      </div>
    </header>
  );
}