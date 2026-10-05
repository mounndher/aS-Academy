import { IMAGES } from "./images";
import { getProgramme, mainProgramme, type Programme } from "./programmes";

/**
 * ============================================================
 *  ADMIN — FORMATIONS (villes · dates · tarifs)
 *
 *  Chaque entrée = UNE formation réservable par les clientes.
 *  Ajoutez une ligne : elle apparaît automatiquement sur la page
 *  Formations, l'accueil, le calendrier — et dispose de sa propre
 *  page de détail avec formulaire de réservation + paiement.
 *
 *  Exemple — ajouter une formation à Paris en octobre :
 *
 *    {
 *      slug: "extension-de-cils-paris-octobre",
 *      programmeSlug: "extension-de-cils",
 *      city: "Paris",
 *      citySlug: "paris",
 *      days: ["17", "18", "19"],
 *      month: "Octobre",
 *      pricing: { personal: 850, cpf: 1500, deposit: 150 },
 *    },
 *
 *  Laissez `days: []` et `pricing: null` pour « Dates à venir »
 *  (la page affiche alors un formulaire de demande de date).
 * ============================================================
 */
export interface Pricing {
  personal: number;
  cpf: number;
  deposit: number;
}

export interface Formation {
  slug: string;
  programmeSlug: string;
  city: string;
  citySlug: string;
  days: string[];
  month: string;
  pricing: Pricing | null;
  /** Visuel de la carte (optionnel — sinon celui du programme) */
  image?: { src: string; alt: string };
  /** Visuel large de la page de détail (optionnel) */
  hero?: string;
}

export const formations: Formation[] = [
  {
    slug: "extension-de-cils-toulouse-septembre",
    programmeSlug: "extension-de-cils",
    city: "Toulouse",
    citySlug: "toulouse",
    days: ["12", "13", "14"],
    month: "Septembre",
    pricing: { personal: 850, cpf: 1500, deposit: 150 },
    image: { src: IMAGES.clientPortrait, alt: "Pose d'extensions de cils sur modèle" },
    hero: IMAGES.heroExtension,
  },
  {
    slug: "extension-de-cils-paris-septembre",
    programmeSlug: "extension-de-cils",
    city: "Paris",
    citySlug: "paris",
    days: ["19", "20", "21"],
    month: "Septembre",
    pricing: { personal: 850, cpf: 1500, deposit: 150 },
    image: { src: IMAGES.applicationPortrait, alt: "Pose d'extensions de cils en formation" },
    hero: IMAGES.heroCilsACils,
  },
  {
    slug: "extension-de-cils-bordeaux-septembre",
    programmeSlug: "extension-de-cils",
    city: "Bordeaux",
    citySlug: "bordeaux",
    days: ["26", "27", "28"],
    month: "Septembre",
    pricing: { personal: 700, cpf: 1500, deposit: 150 },
    image: { src: IMAGES.heroPortrait, alt: "Pose d'extensions de cils en gros plan" },
    hero: IMAGES.heroSpa,
  },
  {
    slug: "extension-de-cils-lyon",
    programmeSlug: "extension-de-cils",
    city: "Lyon",
    citySlug: "lyon",
    days: [],
    month: "Dates à venir",
    pricing: null,
    image: { src: IMAGES.eyeElegant, alt: "Regard après pose d'extensions" },
    hero: IMAGES.heroRelaxed,
  },
  {
    slug: "extension-de-cils-marrakech",
    programmeSlug: "extension-de-cils",
    city: "Marrakech",
    citySlug: "marrakech",
    days: [],
    month: "Dates à venir",
    pricing: null,
    image: { src: IMAGES.tweezersHands, alt: "Pinces et extensions de cils" },
    hero: IMAGES.heroPrecision,
  },
];

/* ---------- Constantes tarifaires (référence) ---------- */
export const DEPOSIT = 150;
export const CPF_PRICE = 1500;

/* ---------- Helpers ---------- */
export const eur = (n: number) =>
  `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f")}\u00a0€`;

export const isScheduled = (f: Formation) => f.days.length > 0;
export const formatDays = (f: Formation) => f.days.join(" — ");
export const dateLabel = (f: Formation) =>
  isScheduled(f) ? `${formatDays(f)} ${f.month}` : "Dates à venir";
export const formationLabel = (f: Formation) => `${f.city} · ${dateLabel(f)}`;

export const programmeOf = (f: Formation): Programme =>
  getProgramme(f.programmeSlug) ?? mainProgramme;
export const formationImage = (f: Formation) => f.image ?? programmeOf(f).image;
export const formationHero = (f: Formation) => f.hero ?? programmeOf(f).hero;

export const getFormation = (slug?: string) => formations.find((f) => f.slug === slug);
export const scheduledFormations = formations.filter(isScheduled);
export const upcomingFormations = formations.filter((f) => !isScheduled(f));

const personalPrices = scheduledFormations
  .map((f) => f.pricing?.personal ?? 0)
  .filter((n) => n > 0);
const minPersonal = personalPrices.length ? Math.min(...personalPrices) : 0;
const maxPersonal = personalPrices.length ? Math.max(...personalPrices) : 0;

/** "700 €" */
export const priceFrom = minPersonal ? eur(minPersonal) : "Sur demande";
/** "700 € à 850 €" */
export const priceRange =
  minPersonal && maxPersonal && minPersonal !== maxPersonal
    ? `${eur(minPersonal)} à ${eur(maxPersonal)}`
    : priceFrom;
