export interface AcademyStat {
  label: string | null;
  title: string | null;
  text: string | null;
}

export interface AcademySection {
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  heading: string | null;
  description: string | null;
  secondary_description: string | null;
  image_primary: string | null;
  image_secondary: string | null;
  stats: AcademyStat[];
  quote: string | null;
  quote_author: string | null;
  is_active: boolean;
}

export interface AcademyApiResponse {
  success: boolean;
  data: AcademySection | null;
  message?: string;
}