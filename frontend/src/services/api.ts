import type { AcademyApiResponse } from "../types/academy";
import type { HeroApiResponse } from "../types/hero";
import type { IntroductionApiResponse } from "../types/introduction";
import type { GalleryApiResponse } from "../types/gallery";
import type { ContactApiResponse } from "../types/contact";
import type { TrainingExperienceApiResponse } from "../types/trainingExperience";
import type { SiteSettingApiResponse } from "../types/siteSetting";
import type { PortfolioApiResponse } from "../types/portfolio";
import type { FormationInformationApiResponse } from "../types/formationInformation";
import type { Formation } from "@/types/formation";

const API_URL = import.meta.env.VITE_API_URL;

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// =========================================================
// ACADEMY
// =========================================================

export async function getAcademySection(): Promise<AcademyApiResponse> {
  const response = await fetch(`${API_URL}/contenu/academy`);

  if (!response.ok) {
    throw new Error(
      "Erreur lors du chargement de la section Academy"
    );
  }

  return response.json();
}

// =========================================================
// HERO
// =========================================================

export async function getHeroSection(): Promise<HeroApiResponse> {
  const response = await fetch(`${API_URL}/contenu/hero`);

  if (!response.ok) {
    throw new Error(
      "Erreur lors du chargement de la section Hero"
    );
  }

  return response.json();
}

// =========================================================
// INTRODUCTION
// =========================================================

export async function getIntroductionSection(): Promise<IntroductionApiResponse> {
  const response = await fetch(
    `${API_URL}/contenu/introduction`
  );

  if (!response.ok) {
    throw new Error(
      "Erreur lors du chargement de la section Introduction"
    );
  }

  return response.json();
}

// =========================================================
// GALLERY
// =========================================================

export async function getGallerySection(): Promise<GalleryApiResponse> {
  const response = await fetch(
    `${API_URL}/contenu/gallery`
  );

  if (!response.ok) {
    throw new Error(
      "Erreur lors du chargement de la section Gallery"
    );
  }

  return response.json();
}

// =========================================================
// CONTACT
// =========================================================

export async function getContactSection(): Promise<ContactApiResponse> {
  const response = await fetch(
    `${API_URL}/contenu/contact`
  );

  if (!response.ok) {
    throw new Error(
      "Erreur lors du chargement de la section Contact"
    );
  }

  return response.json();
}

// =========================================================
// CONTACT MESSAGE
// =========================================================

export interface ContactMessagePayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ContactMessageResponse {
  success: boolean;
  message: string;

  data?: {
    id: number;
  };

  errors?: Record<string, string[]>;
}

export async function sendContactMessage(
  payload: ContactMessagePayload
): Promise<ContactMessageResponse> {
  const response = await fetch(
    `${API_URL}/contact/messages`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message:
        data.message ||
        "Impossible d'envoyer votre message.",

      errors: data.errors,
    };
  }

  return data;
}

// =========================================================
// TRAINING EXPERIENCE
// =========================================================

export async function getTrainingExperience(): Promise<TrainingExperienceApiResponse> {
  const response = await fetch(
    `${API_URL}/contenu/training-experience`
  );

  if (!response.ok) {
    throw new Error(
      "Erreur lors du chargement de l'expérience de formation"
    );
  }

  return response.json();
}

// =========================================================
// SITE SETTINGS
// =========================================================

export async function getSiteSettings(): Promise<SiteSettingApiResponse> {
  const response = await fetch(
    `${API_URL}/contenu/settings`
  );

  if (!response.ok) {
    throw new Error(
      "Erreur lors du chargement des paramètres du site"
    );
  }

  return response.json();
}

// =========================================================
// PORTFOLIO
// =========================================================

export async function getPortfolio(): Promise<PortfolioApiResponse> {
  const response = await fetch(
    `${API_URL}/contenu/portfolio`
  );

  if (!response.ok) {
    throw new Error(
      "Erreur lors du chargement du portfolio"
    );
  }

  return response.json();
}

// =========================================================
// STORAGE
// =========================================================

export function getStorageUrl(
  path: string | null | undefined
): string {
  if (!path) {
    return "";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${API_URL.replace(
    /\/api$/,
    ""
  )}/storage/${path.replace(/^\/+/, "")}`;
}

// =========================================================
// FORMATION INFORMATION
// =========================================================

export async function getFormationInformation(): Promise<FormationInformationApiResponse> {
  const response = await fetch(
    `${API_URL}/contenu/formation-information`
  );

  if (!response.ok) {
    throw new Error(
      "Erreur lors du chargement des informations des formations"
    );
  }

  return response.json();
}

// =========================================================
// ALL FORMATIONS
// =========================================================

export async function getFormations(): Promise<Formation[]> {
  const response = await fetch(
    `${API_URL}/contenu/formations`
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de charger les formations."
    );
  }

  const json: ApiResponse<Formation[]> =
    await response.json();

  return Array.isArray(json.data)
    ? json.data
    : [];
}

// =========================================================
// SINGLE FORMATION
// =========================================================

export async function getFormation(
  slug: string
): Promise<Formation> {
  if (!slug) {
    throw new Error("Formation introuvable.");
  }

  const response = await fetch(
    `${API_URL}/contenu/formations/${encodeURIComponent(
      slug
    )}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        "Formation introuvable."
      );
    }

    throw new Error(
      "Impossible de charger la formation."
    );
  }

  const json: ApiResponse<Formation> =
    await response.json();

  if (!json.data) {
    throw new Error(
      "Formation introuvable."
    );
  }

  return json.data;
}