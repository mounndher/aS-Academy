export interface PortfolioInformation {
  id: number;
  eyebrow: string | null;
  title: string;
  subtitle: string;
  description: string | null;
  is_active: boolean;
}

export interface PortfolioCategory {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

export interface PortfolioItem {
  id: number;
  portfolio_category_id: number;
  title: string | null;
  image: string;
  layout: string;
  sort_order: number;
  is_active: boolean;
  category: PortfolioCategory | null;
}

export interface PortfolioApiResponse {
  information: PortfolioInformation | null;
  categories: PortfolioCategory[];
  items: PortfolioItem[];
}