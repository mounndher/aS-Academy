import { useEffect, useState } from "react";
import { getFormations } from "@/api/api";
import type { Formation } from "@/types/formation";

export function useFormations() {
  const [data, setData] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFormations()
      .then((response) => {
        setData(response.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les formations.");
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
