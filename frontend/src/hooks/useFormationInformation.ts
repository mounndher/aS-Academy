import { useEffect, useState } from "react";

import { getFormationInformation } from "@/services/api";

import type {
  FormationInformationApiResponse,
} from "../types/formationInformation";

export function useFormationInformation() {
  const [data, setData] =
    useState<FormationInformationApiResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFormationInformation()
      .then((response) => {
        setData(response);
      })
      .catch((err) => {
        console.error(
          "Formation Information API error:",
          err
        );

        setError(
          "Impossible de charger les informations des formations."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    data,
    loading,
    error,
  };
}