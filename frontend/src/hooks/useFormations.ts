import { useCallback, useEffect, useState } from "react";

import { getFormations } from "@/services/api";
import type { Formation } from "@/types/formation";

interface UseFormationsReturn {
  formations: Formation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFormations(): UseFormationsReturn {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFormations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getFormations();

      console.log("FORMATIONS API:", response);

      if (response && Array.isArray(response.data)) {
        setFormations(response.data);
      } else {
        setFormations([]);
      }
    } catch (err) {
      console.error("Erreur formations:", err);

      setFormations([]);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les formations."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFormations();
  }, [loadFormations]);

  return {
    formations,
    loading,
    error,
    refetch: loadFormations,
  };
}

export default useFormations;