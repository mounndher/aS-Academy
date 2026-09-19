export const site = {
  name: "AS Academy",
  wordmark: "AS ACADEMY",
  tagline: "Formation Extension de Cils",
  positioning: "Formation professionnelle",
  instagram: {
    handle: "@asacademy__",
    url: "https://www.instagram.com/asacademy__/",
  },
  address: {
    street: "135 rue Jean Jaurès",
    city: "Talence 33400",
  },
  cities: ["Bordeaux", "Paris", "Lyon", "Toulouse", "Marrakech"],
  nav: [
    { label: "Accueil", id: "accueil" },
    { label: "Formations", id: "formations" },
    { label: "L'Academy", id: "academy" },
    { label: "Réalisations", id: "realisations" },
    { label: "Contact", id: "contact" },
  ],
  cta: {
    book: "Réserver une formation",
    askDate: "Demander une date",
  },
} as const;

export type NavItem = (typeof site.nav)[number];
