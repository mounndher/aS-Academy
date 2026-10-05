import { AS, IMAGES } from "./images";

export const GALLERY_CATEGORIES = [
  "Cils à cils",
  "Volume russe",
  "Mapping",
  "Résultats",
  "Formation",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];
export type GallerySize = "small" | "tall" | "wide" | "large";

export interface GalleryItem {
  id: string;
  category: GalleryCategory;
  src: string;
  /** Photo provisoire si le visuel authentique n'est pas encore déposé */
  fallback?: string;
  alt: string;
  size: GallerySize;
  /** Visuel authentique AS Academy — mis en avant en grand */
  authentic?: boolean;
}

/**
 * NOS RÉALISATIONS
 * Les 6 visuels authentiques AS Academy ouvrent la galerie en grand
 * format ; quelques visuels d'illustration complètent les catégories.
 */
export const gallery: GalleryItem[] = [
  {
    id: "g1",
    category: "Résultats",
    src: AS.resultLogo.src,
    fallback: AS.resultLogo.fallback,
    alt: "Résultat extension de cils signé AS Academy",
    size: "large",
    authentic: true,
  },
  {
    id: "g2",
    category: "Volume russe",
    src: AS.lashCloseup.src,
    fallback: AS.lashCloseup.fallback,
    alt: "Gros plan volume russe, regard intense",
    size: "tall",
    authentic: true,
  },
  {
    id: "g3",
    category: "Volume russe",
    src: AS.lashTrio.src,
    fallback: AS.lashTrio.fallback,
    alt: "Trois profils de poses volume russe",
    size: "tall",
    authentic: true,
  },
  {
    id: "g4",
    category: "Formation",
    src: AS.classLivret.src,
    fallback: AS.classLivret.fallback,
    alt: "Élèves AS Academy avec leurs certificats et le livret de formation",
    size: "large",
    authentic: true,
  },
  {
    id: "g5",
    category: "Résultats",
    src: AS.lashMirror.src,
    fallback: AS.lashMirror.fallback,
    alt: "Résultat symétrique, effet miroir",
    size: "wide",
    authentic: true,
  },
  {
    id: "g6",
    category: "Formation",
    src: AS.classCerts.src,
    fallback: AS.classCerts.fallback,
    alt: "Remise des certificats AS Academy",
    size: "wide",
    authentic: true,
  },

  /* Compléments par catégorie */
  { id: "g7", category: "Cils à cils", src: IMAGES.applicationHands, alt: "Isolation et pose d'une extension", size: "wide" },
  { id: "g8", category: "Mapping", src: IMAGES.tweezersClose, alt: "Pinces et extensions", size: "small" },
  { id: "g9", category: "Mapping", src: IMAGES.tweezersHands, alt: "Préparation du mapping", size: "small" },
  { id: "g10", category: "Cils à cils", src: IMAGES.eyePortrait, alt: "Regard cils à cils", size: "small" },
  { id: "g11", category: "Résultats", src: IMAGES.eyeNatural, alt: "Détail des cils après pose", size: "small" },
  { id: "g12", category: "Formation", src: IMAGES.clientPortrait, alt: "Pratique sur modèle en formation", size: "wide" },
];

/** Instagram mood grid — visual only, no fabricated posts */
export const instagramGrid = [
  { src: AS.founder.src, fallback: AS.founder.fallback, alt: "Fondatrice AS Academy" },
  { src: AS.resultLogo.src, fallback: AS.resultLogo.fallback, alt: "Résultat signé AS Academy" },
  { src: AS.lashCloseup.src, fallback: AS.lashCloseup.fallback, alt: "Gros plan cils" },
  { src: AS.classLivret.src, fallback: AS.classLivret.fallback, alt: "Promotion certifiée" },
  { src: AS.lashTrio.src, fallback: AS.lashTrio.fallback, alt: "Profils de poses" },
  { src: AS.storefront.src, fallback: AS.storefront.fallback, alt: "L'académie à Talence" },
];
