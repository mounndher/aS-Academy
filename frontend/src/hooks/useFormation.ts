import { useEffect, useState } from "react";
import { getFormation } from "@/services/api";
import type { Formation } from "@/types/formation";

export function useFormation(slug?: string) {
  const [data, setData] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFormation() {
      if (!slug) {
        if (!cancelled) {
          setData(null);
          setError("Formation introuvable.");
          setLoading(false);
        }
        return;
      }

      try {
        if (!cancelled) {
          setLoading(true);
          setError(null);
        }

        const formation = await getFormation(slug);

        if (!cancelled) {
          setData(formation);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setData(null);

          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger la formation."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFormation();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return {
    data,
    loading,
    error,
  };
}

export default useFormation;