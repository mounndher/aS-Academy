import { useEffect, useState } from "react";

import { getFormation } from "@/services/api";
import type { Formation } from "@/types/formation";

export function useFormation(slug: string) {
  const [data, setData] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFormation() {
      try {
        setLoading(true);
        setError(null);

        const response = await getFormation(slug);

        setData(response.data);
      } catch (err) {
        console.error("Erreur formation:", err);

        setError(
          "Impossible de charger la formation."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFormation();
  }, [slug]);

  return {
    data,
    loading,
    error,
  };
}
