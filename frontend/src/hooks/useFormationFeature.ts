import { useEffect, useState } from "react";

import { getFormation } from "@/services/api";
import type { Formation } from "@/types/formation";

export function useFormationFeature() {
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFormation() {
      try {
        setLoading(true);
        setError(null);

        const response = await getFormation(
          "formation-extension-de-cils"
        );

        setFormation(response.data);
      } catch (err) {
        console.error("Formation Feature error:", err);

        setError(
          "Impossible de charger les informations de la formation."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFormation();
  }, []);

  return {
    formation,
    loading,
    error,
  };
}
