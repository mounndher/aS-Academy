export interface TrainingExperienceItem {
  number: string | null;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image_primary: string | null;
  image_secondary: string | null;
}

export interface TrainingExperienceSection {
  eyebrow: string | null;
  experiences: TrainingExperienceItem[];
  is_active: boolean;
}

export interface TrainingExperienceApiResponse {
  success: boolean;
  data: TrainingExperienceSection | null;
  message?: string;
}