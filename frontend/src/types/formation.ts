export interface FormationStep {
  title: string;
  description?: string;
}

export interface Formation {
  id: number;
  programme_id: number;
  programme: string | null;

  title: string;
  slug: string;
  description: string | null;

  steps: FormationStep[];

  image: string | null;
  pdf_program: string | null;

  personal_price?: number | string | null;
  has_sale?: boolean;
  sale_price?: number | string | null;

  installment_enabled?: boolean;
  installment_count?: number | null;

  is_active: boolean;
}

export interface FormationApiResponse {
  success: boolean;
  data: Formation;
}

export interface FormationsApiResponse {
  success: boolean;
  data: Formation[];
}
