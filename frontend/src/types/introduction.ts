export interface IntroductionExpertise {
  number: string | null;
  title: string | null;
}

export interface IntroductionSection {
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  secondary_description: string | null;

  image_primary: string | null;
  image_secondary: string | null;

  bottom_title: string | null;
  bottom_text: string | null;

  expertises: IntroductionExpertise[];

  is_active: boolean;
}

export interface IntroductionApiResponse {
  success: boolean;
  data: IntroductionSection | null;
  message?: string;
}