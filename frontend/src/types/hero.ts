export interface HeroSection {
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  heading: string | null;
  description: string | null;

  primary_button: {
    text: string | null;
    link: string | null;
  };

  secondary_button: {
    text: string | null;
    link: string | null;
  };

  image: string | null;
  is_active: boolean;
}

export interface HeroApiResponse {
  success: boolean;
  data: HeroSection | null;
  message?: string;
}