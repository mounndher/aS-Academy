export interface FormationProgramme {
  id: number;
  name: string;
}

export interface FormationDay {
  id: number;
  city: string;

  start_date: string;
  end_date: string;

  price: number | string;

  cpf_eligible: boolean;
  cpf_price: number | string | null;

  max_places: number;
  remaining_places: number;

  status: "available" | "full" | "cancelled" | "finished";
}

export interface Formation {
  id: number;

  programme_id: number;

  programme: FormationProgramme | null;

  title: string;
  slug: string;
  description: string | null;

  steps: Array<{
    title: string;
    description?: string;
  }>;

  image: string | null;
  pdf_program: string | null;

  personal_price: number | string;
  has_sale: boolean;
  sale_price: number | string | null;

  installment_enabled: boolean;
  installment_count: number | null;

  is_active: boolean;

  formation_days: FormationDay[];
}

export interface FormationsApiResponse {
  success: boolean;
  data: Formation[];
}

export interface FormationApiResponse {
  success: boolean;
  data: Formation;
}
