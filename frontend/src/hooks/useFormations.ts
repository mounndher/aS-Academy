import { useEffect, useState } from "react";
import { getFormations } from "@/services/api";
import type { Formation } from "@/types/formation";

export function useFormations() {
  const [data, setData] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFormations() {
      try {
        setLoading(true);
        setError(null);

        const result = await getFormations();

        /*
         * API returns:
         *
         * {
         *   success: true,
         *   data: [...]
         * }
         *
         * We need the array inside "data".
         *
         * This also supports getFormations()
         * already returning an array.
         */

        const formations: Formation[] = Array.isArray(result)
          ? result
          : Array.isArray(
              (result as { data?: Formation[] })?.data
            )
            ? (result as { data: Formation[] }).data
            : [];

        if (!cancelled) {
          setData(formations);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger les formations."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFormations();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    data,
    loading,
    error,
  };
}