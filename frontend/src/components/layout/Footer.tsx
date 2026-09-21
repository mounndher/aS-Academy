import { site } from "@/data/site";

import { useSiteUI } from "@/context/SiteUIContext";
import { useSectionNav } from "@/hooks/useSectionNav";
import { useSiteSettings } from "@/hooks/useSiteSettings";

import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Footer() {
  const { openBooking } = useSiteUI();
  const goTo = useSectionNav();

  const { settings } = useSiteSettings();

  const year = new Date().getFullYear();

  // ============================================
  // DYNAMIC SITE SETTINGS
  // ============================================

  const siteName = settings?.site_name || "AS Academy";

  const tagline = settings?.tagline || site.tagline;

  const logo = settings?.logo || null;

  const address =
    settings?.contact.address || site.address.street;

  const city = settings?.contact.city
    ? `${settings.contact.city}${
        settings.contact.postal_code
          ? ` ${settings.contact.postal_code}`
          : ""
      }`
    : site.address.city;

  const instagramUrl =
    settings?.social.instagram || site.instagram.url;

  const instagramHandle = settings?.social.instagram
    ? "@asacademy__"
    : site.instagram.handle;

  const footerDescription =
    settings?.footer.description || null;

  const copyright =
    settings?.footer.copyright ||
    `© ${year} ${siteName}`;

  return (
    <footer className="bg-ink text-ivory">
      <div className="wrap pt-16 lg:pt-20">

        {/* =========================================
            TOP FOOTER
        ========================================= */}

        <div className="grid gap-12 border-b border-ivory/10 pb-14 lg:grid-cols-12 lg:gap-8 lg:pb-16">

          {/* =====================================
              BRAND
          ===================================== */}

          <div className="lg:col-span-4">
            <Reveal>
              <button
                type="button"
                onClick={() => goTo("accueil")}
                className="flex items-baseline gap-2.5 transition-opacity duration-500 hover:opacity-70"
                aria-label={`${siteName} — Accueil`}
              >
                {logo ? (
                  <img
                    src={logo}
                    alt={siteName}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <>
                    <span className="font-serif text-[28px] font-semibold leading-none tracking-[0.02em]">
                      AS
                    </span>

                    <span className="label text-[10px] tracking-[0.36em]">
                      Academy
                    </span>
                  </>
                )}
              </button>

              <p className="label mt-5 text-ivory/50">
                {tagline}
              </p>

              {footerDescription && (
                <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-ivory/50">
                  {footerDescription}
                </p>
              )}
            </Reveal>
          </div>

          {/* =====================================
              NAVIGATION
          ===================================== */}

          <Reveal
            delay={0.1}
            className="lg:col-span-3"
          >
            <p className="label text-ivory/50">
              Navigation
            </p>

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

          {/* =====================================
              CONTACT / ADDRESS
          ===================================== */}

          <Reveal
            delay={0.15}
            className="lg:col-span-3"
          >
            <p className="label text-ivory/50">
              Adresse
            </p>

            <address className="mt-5 font-serif text-xl leading-snug not-italic">
              {address}
              <br />
              {city}
            </address>

            {/* Email */}

            {settings?.contact.email && (
              <a
                href={`mailto:${settings.contact.email}`}
                className="label link-line mt-5 block text-[10px] text-ivory/70"
              >
                {settings.contact.email}
              </a>
            )}

            {/* Instagram */}

            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="label link-line mt-4 inline-block text-[10px] text-ivory/70"
            >
              {instagramHandle}
            </a>
          </Reveal>

          {/* =====================================
              BOOKING BUTTON
          ===================================== */}

          <Reveal
            delay={0.2}
            className="min-w-0 lg:col-span-2"
          >
            <Button
              variant="light"
              className="
                w-full
                min-w-0
                whitespace-nowrap
                px-3
                text-[8px]
                tracking-[0.16em]
                sm:text-[9px]
                sm:tracking-[0.18em]
                lg:px-2
                lg:text-[7px]
                lg:tracking-[0.12em]
                xl:px-3
                xl:text-[8px]
                xl:tracking-[0.16em]
              "
              onClick={() => openBooking()}
            >
              RÉSERVER UNE FORMATION
            </Button>
          </Reveal>
        </div>

        {/* =========================================
            LARGE BRAND
        ========================================= */}

        <div className="overflow-hidden py-10 lg:py-12">
          <Reveal y={30}>
            <p
              aria-hidden
              className="
                whitespace-nowrap
                font-serif
                text-[clamp(2.5rem,12vw,10rem)]
                uppercase
                leading-[0.85]
                tracking-[-0.005em]
                text-ivory
              "
            >
              {siteName}
            </p>
          </Reveal>
        </div>

        {/* =========================================
            BOTTOM FOOTER
        ========================================= */}

        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-ivory/10
            py-6
            pb-28
            text-[10px]
            uppercase
            tracking-[0.22em]
            text-ivory/40
            md:flex-row
            md:items-center
            md:justify-between
            md:pb-6
          "
        >
          {/* Copyright */}

          <span>
            {copyright}
          </span>

          {/* Cities */}

          <span className="hidden md:inline">
            {site.cities.join(" · ")}
          </span>

          {/* Instagram */}

          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-ivory"
          >
            {instagramHandle}
          </a>
        </div>
      </div>
    </footer>
  );
}