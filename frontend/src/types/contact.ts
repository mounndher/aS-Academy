export interface ContactAddress {
  label: string | null;
  line_1: string | null;
  line_2: string | null;
  cities: string | null;
}

export interface ContactInstagram {
  label: string | null;
  handle: string | null;
  link: string | null;
}

export interface ContactSection {
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  heading: string | null;
  description: string | null;

  address: ContactAddress;

  instagram: ContactInstagram;

  is_active: boolean;
}

export interface ContactApiResponse {
  success: boolean;
  data: ContactSection | null;
  message?: string;
}