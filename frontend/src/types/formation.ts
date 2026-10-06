export interface FormationDay {
  id: number;
  formation_id: number;

  city: string | null;

  start_date: string | null;
  end_date: string | null;

  image?: string | null;

  personal_price: number | string | null;

  cpf_eligible: boolean;
  cpf_price: number | string | null;

  max_places: number;
  remaining_places: number;

  status: string | null;
}

export interface FormationProgramme {
  id: number;
  name: string;
  slug: string;

  description: string | null;
  duration: string | null;

  is_active: boolean;
}

export interface FormationStep {
  title: string;
  description?: string | null;
}

export interface Formation {
  id: number;

  programme_id: number | null;

  programme: FormationProgramme | null;

  title: string;
  slug: string;

  description: string | null;

  steps: FormationStep[];

  image: string | null;

  pdf_program: string | null;

  deposit_amount: number | string | null;

  personal_price: number | string | null;

  has_sale: boolean;

  sale_price: number | string | null;

  installment_enabled: boolean;

  installment_count: number | null;

  is_active: boolean;

  formationDays: FormationDay[];
}

export interface FormationApiResponse {
  data?: Formation;
  formation?: Formation;
}