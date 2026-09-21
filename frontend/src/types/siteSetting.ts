export interface SiteSettingContact {
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
}

export interface SiteSettingSocial {
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  youtube: string | null;
}

export interface SiteSettingFooter {
  description: string | null;
  copyright: string | null;
}

export interface SiteSettingSeo {
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
}

export interface SiteSetting {
  site_name: string | null;
  tagline: string | null;

  logo: string | null;
  favicon: string | null;

  contact: SiteSettingContact;
  social: SiteSettingSocial;
  footer: SiteSettingFooter;
  seo: SiteSettingSeo;

  is_active: boolean;
}

export interface SiteSettingApiResponse {
  success: boolean;
  data: SiteSetting | null;
  message?: string;
}