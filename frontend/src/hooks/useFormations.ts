import { useEffect, useState } from "react";
import { getFormation } from "@/api/api";
import type { Formation } from "@/types/formation";

export function useFormation(slug: string) {
  const [data, setData] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    getFormation(slug)
      .then((response) => {
        setData(response.data);
      })
      .catch((err) => {
        console.error(err);
        setError(
          "Impossible de charger la formation."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  return {
    data,
    loading,
    error,
  };
}
