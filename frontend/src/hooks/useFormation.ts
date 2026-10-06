import { useEffect, useState } from "react";
import type { Formation } from "@/types/formation";

const API_URL =
  import.meta.env.VITE_API_URL || "";

export function useFormation(
  slug?: string
) {
  const [data, setData] =
    useState<Formation | undefined>(undefined);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchFormation() {
      if (!slug) {
        setData(undefined);
        setError("Slug manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        /*
         * IMPORTANT:
         *
         * Your Laravel API returns:
         *
         * {
         *   success: true,
         *   data: [...]
         * }
         *
         * So we load ALL formations and
         * find the requested slug.
         */

        const response = await fetch(
          `${API_URL}/api/contenu/formations`,
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

        /*
         * React Router gives us:
         *
         * formation-extension-de-cils
         *
         * Decode it and remove accidental slash.
         */

        const requestedSlug =
          decodeURIComponent(slug)
            .replace(/\/+$/, "")
            .trim()
            .toLowerCase();

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
          console.error(
            "Formation introuvable.",
            {
              requestedSlug,
              availableSlugs:
                formations.map(
                  (item) => item.slug
                ),
            }
          );

          throw new Error(
            `Formation introuvable: ${slug}`
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
              : "Erreur lors du chargement de la formation"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchFormation();

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