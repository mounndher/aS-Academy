export interface FormationInformation {
  id: number;
  eyebrow: string | null;
  title: string;
  subtitle: string;
  description: string | null;
  is_active: boolean;
}

export interface FormationInformationApiResponse {
  information: FormationInformation | null;
}