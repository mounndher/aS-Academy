import { site } from "@/data/site";
import { useSiteUI } from "@/context/SiteUIContext";
import { useSectionNav } from "@/hooks/useSectionNav";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Footer() {
  const { openBooking } = useSiteUI();
  const goTo = useSectionNav();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-ivory">
      <div className="wrap pt-16 lg:pt-20">
        <div className="grid gap-12 border-b border-ivory/10 pb-14 lg:grid-cols-12 lg:gap-8 lg:pb-16">
          <div className="lg:col-span-4">
            <Reveal>
              <button
                type="button"
                onClick={() => goTo("accueil")}
                className="flex items-baseline gap-2.5 transition-opacity duration-500 hover:opacity-70"
              >
                <span className="font-serif text-[28px] font-semibold leading-none tracking-[0.02em]">AS</span>
                <span className="label text-[10px] tracking-[0.36em]">Academy</span>
              </button>
              <p className="label mt-5 text-ivory/50">{site.tagline}</p>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:col-span-3">
            <p className="label text-ivory/50">Navigation</p>
            <ul className="mt-5 space-y-3">
              {site.nav.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => goTo(item.id)}
                    className="link-line text-sm font-light text-ivory/80 transition-colors hover:text-ivory"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.15} className="lg:col-span-3">
            <p className="label text-ivory/50">Adresse</p>
            <address className="mt-5 font-serif text-xl leading-snug not-italic">
              {site.address.street}
              <br />
              {site.address.city}
            </address>
            <a
              href={site.instagram.url}
              target="_blank"
              rel="noreferrer"
              className="label link-line mt-6 inline-block text-[10px] text-ivory/70"
            >
              {site.instagram.handle}
            </a>
          </Reveal>

          <Reveal delay={0.2} className="lg:col-span-2">
            <Button variant="light" className="w-full" onClick={() => openBooking()}>
              {site.cta.book}
            </Button>
          </Reveal>
        </div>

        <div className="overflow-hidden py-10 lg:py-12">
          <Reveal y={30}>
            <p
              aria-hidden
              className="whitespace-nowrap font-serif text-[clamp(2.5rem,12vw,10rem)] uppercase leading-[0.85] tracking-[-0.005em] text-ivory"
            >
              AS Academy
            </p>
          </Reveal>
        </div>

        <div className="flex flex-col gap-3 border-t border-ivory/10 py-6 pb-28 text-[10px] uppercase tracking-[0.22em] text-ivory/40 md:flex-row md:items-center md:justify-between md:pb-6">
          <span>© {year} AS Academy</span>
          <span className="hidden md:inline">{site.cities.join(" · ")}</span>
          <a
            href={site.instagram.url}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-ivory"
          >
            {site.instagram.handle}
          </a>
        </div>
      </div>
    </footer>
  );
}
