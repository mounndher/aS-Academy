import { useEffect, useState } from "react";
import type { Formation } from "@/types/formation";

const API_URL =
  import.meta.env.VITE_API_URL || "";

export function useFormation(slug?: string) {
  const [data, setData] =
    useState<Formation | undefined>();

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFormation() {
      if (!slug) {
        setData(undefined);
        setError("Slug manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const requestedSlug =
          decodeURIComponent(slug)
            .replace(/\/+$/, "")
            .trim()
            .toLowerCase();

        const response = await fetch(
          `${API_URL}/contenu/formations`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Erreur API: ${response.status}`
          );
        }

        const json = await response.json();

        const formations: Formation[] =
          Array.isArray(json?.data)
            ? json.data
            : [];

        const formation =
          formations.find(
            (item) =>
              String(item.slug)
                .replace(/\/+$/, "")
                .trim()
                .toLowerCase() ===
              requestedSlug
          );

        if (!formation) {
          throw new Error(
            `Formation introuvable: ${requestedSlug}`
          );
        }

        if (!cancelled) {
          setData(formation);
        }
      } catch (err) {
        if (!cancelled) {
          setData(undefined);

          setError(
            err instanceof Error
              ? err.message
              : "Erreur lors du chargement"
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