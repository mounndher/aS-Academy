import { useEffect, useState } from "react";
import { getSiteSettings } from "@/services/api";
import type { SiteSetting } from "@/types/siteSetting";

let cachedSettings: SiteSetting | null = null;
let settingsPromise: Promise<SiteSetting | null> | null = null;

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSetting | null>(
    cachedSettings
  );

  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        if (!settingsPromise) {
          settingsPromise = getSiteSettings().then((response) => {
            if (response.success && response.data) {
              cachedSettings = response.data;
              return response.data;
            }

            return null;
          });
        }

        const data = await settingsPromise;

        if (mounted) {
          setSettings(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    settings,
    loading,
  };
}