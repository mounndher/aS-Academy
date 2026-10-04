export interface FormationDay {
  id: number;
  formation_id: number;
  city: string;
  start_date: string;
  end_date: string;
  personal_price: number | string | null;
  cpf_price: number | string | null;
  max_places: number;
  remaining_places: number;
  status: "available" | "complete" | "cancelled" | "finished" | string;
}

export interface FormationProgramme {
  id: number;
  name: string;
  slug?: string;
}

export interface Formation {
  id: number;
  programme_id: number;
  programme: string | null;
  title: string;
  slug: string;
  description: string | null;
  steps: string[];
  image: string | null;
  pdf_program: string | null;
  is_active: boolean;

  formationDays: FormationDay[];
}

export interface FormationApiResponse {
  success: boolean;
  data: Formation[];
}

export interface FormationSingleApiResponse {
  success: boolean;
  data: Formation;
}
