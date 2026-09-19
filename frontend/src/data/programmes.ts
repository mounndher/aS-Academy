import { IMAGES } from "./images";

/**
 * ADMIN — PROGRAMME PÉDAGOGIQUE
 * Ce qui est enseigné (contenu, durée, textes).
 * Les villes, dates et tarifs se gèrent dans `formations.ts`.
 */
export interface Technique {
  title: string;
  text: string;
}

export interface Programme {
  slug: string;
  title: string;
  titleLines: string[];
  subtitle: string;
  eyebrow: string;
  short: string;
  intro: string;
  description: string[];
  programme: string[];
  techniques: Technique[];
  duration: string;
  durationDetail: string;
  image: { src: string; alt: string };
  hero: string;
}

/** Programme officiel de la formation AS Academy */
export const PROGRAMME = [
  "Bases du métier",
  "Hygiène",
  "Mapping",
  "Entretien des extensions de cils",
  "Pose cils à cils",
  "Volume russe",
];

export const programmes: Programme[] = [
  {
    slug: "extension-de-cils",
    title: "Extension de Cils",
    titleLines: ["Formation", "Extension de Cils"],
    subtitle: "Cils à cils & Volume russe",
    eyebrow: "Formation professionnelle · 3 jours",
    short:
      "Le programme complet pour apprendre le métier : des bases et de l'hygiène jusqu'à la pose cils à cils et au volume russe.",
    intro:
      "Une formation professionnelle conçue pour acquérir une technique précise, une méthode rigoureuse et une véritable maîtrise de l'extension de cils — de la théorie à la pratique.",
    description: [
      "La formation Extension de Cils réunit en un seul programme l'ensemble des fondamentaux du métier : les bases, les règles d'hygiène indispensables, le mapping, l'entretien des extensions, la pose cils à cils et le volume russe.",
      "Chaque étape est abordée avec exigence — comprendre, observer, pratiquer, corriger — jusqu'à obtenir une pose précise, propre et durable.",
    ],
    programme: PROGRAMME,
    techniques: [
      {
        title: "Cils à cils",
        text: "Une extension posée sur un cil naturel, pour un résultat net, régulier et élégant. La base de toute pose réussie.",
      },
      {
        title: "Volume russe",
        text: "Des bouquets de plusieurs extensions très fines posés sur un seul cil naturel, pour un regard plus dense et plus intense.",
      },
    ],
    duration: "3 jours",
    durationDetail: "3 jours consécutifs",
    image: { src: IMAGES.heroPortrait, alt: "Pose d'extensions de cils en gros plan" },
    hero: IMAGES.heroExtension,
  },
];

export const mainProgramme = programmes[0];
export const getProgramme = (slug: string) => programmes.find((p) => p.slug === slug);
