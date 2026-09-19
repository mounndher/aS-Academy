import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import { site } from "@/data/site";
import { useSiteUI } from "@/context/SiteUIContext";
import { useSectionNav } from "@/hooks/useSectionNav";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { menuOpen, setMenuOpen, openBooking } = useSiteUI();
  const goTo = useSectionNav();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { pathname } = useLocation();
  // Only the home page has a dark hero under the transparent navbar.
  const solid = (scrolled || pathname !== "/") && !menuOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,color,backdrop-filter] duration-700 ease-luxury",
        solid
          ? "border-ink/10 bg-ivory/85 text-ink backdrop-blur-md"
          : "border-transparent bg-transparent text-ivory",
      )}
    >
      <div className="wrap flex h-[72px] items-center justify-between lg:h-[88px]">
        {/* Wordmark */}
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            goTo("accueil");
          }}
          className="flex items-baseline gap-2.5 transition-opacity duration-500 hover:opacity-70"
          aria-label="AS Academy — Accueil"
        >
          <span className="font-serif text-[26px] font-semibold leading-none tracking-[0.02em] lg:text-[30px]">
            AS
          </span>
          <span className="label text-[10px] tracking-[0.36em]">Academy</span>
        </button>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 lg:flex xl:gap-10" aria-label="Navigation principale">
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

        <div className="flex items-center gap-5">
          <Button
            variant={solid ? "outline-dark" : "outline-light"}
            className="hidden md:inline-flex"
            onClick={() => openBooking()}
          >
            {site.cta.book}
          </Button>

          {/* Hamburger */}
          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            <span
              className={cn(
                "absolute h-px w-7 bg-current transition-transform duration-500 ease-luxury",
                menuOpen ? "translate-y-0 rotate-45" : "-translate-y-[4px]",
              )}
            />
            <span
              className={cn(
                "absolute h-px w-7 bg-current transition-transform duration-500 ease-luxury",
                menuOpen ? "translate-y-0 -rotate-45" : "translate-y-[4px]",
              )}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
