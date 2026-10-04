import { useEffect, useState } from "react";

import { getFormations } from "@/services/api";
import type { Formation } from "@/types/formation";

export function useFormationFeature() {
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const formations = await getFormations();

        if (!cancelled) {
          setFormation(formations[0] ?? null);
        }
      } catch (err) {
        if (!cancelled) {
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

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    formation,
    loading,
    error,
  };
}