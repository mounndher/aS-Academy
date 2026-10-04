export interface FormationPlanning {
  id: number;
  city: string;

  start_date: string;
  end_date: string;

  price: string | number;

  cpf_eligible: boolean;
  cpf_price: string | number | null;

  max_places: number;
  remaining_places: number;

  status: "available" | "full" | "cancelled" | "finished";
}

export interface Formation {
  id: number;

  programme_id: number | null;
  programme: string | null;

  title: string;
  slug: string;

  description: string | null;

  steps: Array<{
    title: string;
    description?: string;
  }>;

  image: string | null;
  pdf_program: string | null;

  personal_price: string | number | null;

  has_sale: boolean;
  sale_price: string | number | null;

  installment_enabled: boolean;
  installment_count: number | null;

  deposit_amount: string | number | null;

  is_active: boolean;

  planning?: FormationPlanning[];
}

export interface FormationApiResponse {
  success: boolean;
  data: Formation;
}

export interface FormationsApiResponse {
  success: boolean;
  data: Formation[];
}

export interface PlanningFormation {
  formation_id: number;
  formation: string;
  slug: string;

  programme_id: number | null;
  programme: string | null;

  planning: FormationPlanning[];
}

export interface PlanningApiResponse {
  success: boolean;
  data: PlanningFormation[];
}
