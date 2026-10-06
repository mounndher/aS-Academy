import { useEffect, useState } from "react";

import type {
  Formation,
  FormationApiResponse,
} from "@/types/formation";

const API_URL =
  import.meta.env.VITE_API_URL || "";

function normalizeFormation(
  response: unknown
): Formation | null {
  if (!response) {
    return null;
  }

  const body =
    response as FormationApiResponse;

  const formation =
    body.formation ??
    body.data ??
    response;

  if (
    !formation ||
    typeof formation !== "object"
  ) {
    return null;
  }

  return formation as Formation;
}

export function useFormation(
  slug?: string
) {
  const [formation, setFormation] =
    useState<Formation | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug) {
        setFormation(null);
        setLoading(false);
        setError(
          "Aucun slug de formation."
        );
        return;
      }

      setLoading(true);
      setError(null);
      setFormation(null);

      try {
        if (!API_URL) {
          throw new Error(
            "VITE_API_URL n'est pas configuré."
          );
        }

        const cleanSlug =
          decodeURIComponent(slug)
            .replace(/^\/+|\/+$/g, "")
            .trim();

        const response =
          await fetch(
            `${API_URL}/formations/${encodeURIComponent(
              cleanSlug
            )}`,
            {
              method: "GET",

              headers: {
                Accept:
                  "application/json",
              },

              cache: "no-store",
            }
          );

        if (!response.ok) {
          if (
            response.status === 404
          ) {
            throw new Error(
              "Formation introuvable."
            );
          }

          throw new Error(
            `Erreur API ${response.status}`
          );
        }

        const json =
          await response.json();

        const result =
          normalizeFormation(json);

        if (!result) {
          throw new Error(
            "Réponse API invalide."
          );
        }

        if (!cancelled) {
          setFormation(result);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        setFormation(null);

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger la formation."
        );
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
  }, [slug]);

  return {
    formation,
    loading,
    error,
  };
}

export default useFormation;