/**
 * Image helper — hosted photography (Pexels CDN).
 * Replace any id/URL with authentic AS Academy imagery when available.
 */
export const px = (id: number, w = 1400, h?: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}${
    h ? `&h=${h}&fit=crop` : ""
  }`;

/**
 * ============================================================
 *  VISUELS AUTHENTIQUES AS ACADEMY
 *
 *  Déposez ces 8 fichiers dans `public/images/` : le site les
 *  détecte automatiquement et remplace les photos provisoires.
 *  (Voir public/images/README.md pour la correspondance.)
 * ============================================================
 */
export interface AssetSlot {
  src: string;
  fallback: string;
}

export const AS = {
  /** Fondatrice assise, logo AS ACADEMY au mur (carré) — Introduction */
  founder: { src: "/images/as-founder.jpg", fallback: px(37524408, 1000, 1400) },
  /** Fondatrice devant la vitrine de l'académie (portrait) — L'Academy */
  storefront: { src: "/images/as-storefront.jpg", fallback: px(5128233, 1000, 1350) },
  /** Œil résultat avec logo AS Academy (carré, 2 bandes) */
  resultLogo: { src: "/images/as-result-logo.jpg", fallback: px(36930354, 1100, 1500) },
  /** Gros plan des deux yeux, fond sombre (carré) */
  lashCloseup: { src: "/images/as-lash-closeup.jpg", fallback: px(7588357, 1000, 1350) },
  /** Trois profils de poses de cils (vertical) */
  lashTrio: { src: "/images/as-lash-trio.jpg", fallback: px(7479509, 900, 1250) },
  /** Œil effet miroir (carré) */
  lashMirror: { src: "/images/as-lash-mirror.jpg", fallback: px(17948025, 1600) },
  /** Élèves certifiées devant le banner noir (carré) */
  classCerts: { src: "/images/as-class-certificates.jpg", fallback: px(6684148, 1400) },
  /** Groupe avec certificats & livret de formation (carré) */
  classLivret: { src: "/images/as-class-livret.jpg", fallback: px(6684149, 1400) },
} satisfies Record<string, AssetSlot>;

export const IMAGES = {
  // Hero & signature
  heroPortrait: px(36930354, 1100, 1500),
  heroWide: px(36930354, 1800, 1100),
  heroExtension: px(8554941, 1800),
  heroCilsACils: px(7755523, 1800, 1100),
  heroVolume: px(7588357, 1800, 1100),
  heroSpa: px(7755520, 1800),
  heroRelaxed: px(7755496, 1800),
  heroPrecision: px(9743993, 1800),
  applicationWide: px(8554941, 1600),
  applicationPortrait: px(6135662, 1000, 1400),
  clientPortrait: px(5128233, 1000, 1350),
  tweezersClose: px(7755650, 1400),
  tweezersHands: px(7755524, 900, 1250),
  applicationHands: px(7755523, 1400),
  spaTreatment: px(7755520, 1400),
  relaxedClient: px(7755496, 1400),

  // Eyes / results
  eyeElegant: px(7588357, 1000, 1350),
  eyeHazel: px(17948025, 1600),
  eyeFreckles: px(3064717, 1400),
  eyeNatural: px(7479509, 900, 1250),
  eyePortrait: px(34460007, 900, 1250),
  eyeLight: px(37494545, 1400),
  mascaraApplied: px(7712438, 1400),
  makeupPrecision: px(9743993, 1400),

  // Training environment
  classroomA: px(6684148, 1400),
  classroomB: px(6684149, 1400),
  classroomC: px(6684167, 1400),
  workshopBright: px(33714903, 1400),

  // Portraits (academy story)
  portraitProfile: px(37524408, 1000, 1400),
  portraitStudio: px(20459101, 900, 1250),

  // Cities
  bordeaux: px(30732709, 1400, 1800),
  paris: px(35982033, 1400, 1800),
  lyon: px(34811176, 1400, 1800),
  toulouse: px(30753262, 1400, 1800),
  marrakech: px(17649841, 1400, 1800),
};
