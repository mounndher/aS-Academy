
import { useEffect, useState } from "react";
import { eur } from "@/data/formations";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SessionCard } from "./SessionCard";

const API_URL = import.meta.env.VITE_API_URL;

interface FormationDay {
  id: number;
  formation_id: number;
  city: string;
  image: string | null;
  start_date: string;
  end_date: string;
  personal_price: string | null;
  cpf_eligible: boolean;
  cpf_price: string | null;
  max_places: number;
  remaining_places: number;
  status: string;
}

interface Formation {
  id: number;
  title: string;
  slug: string;
  deposit_amount: string | null;
  formationDays: FormationDay[];
}

interface ApiResponse {
  success: boolean;
  data: Formation[];
}

interface Session {
  formation: Formation;
  day: FormationDay;
}

export function SessionsSection() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFormations() {
      try {
        setLoading(true);
        setError(false);

        if (!API_URL) {
          throw new Error("VITE_API_URL n'est pas configurée.");
        }

        const response = await fetch(
          `${API_URL.replace(/\/$/, "")}/contenu/formations`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des formations.");
        }

        const result: ApiResponse = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error("Réponse API invalide.");
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const allSessions = result.data.flatMap((formation) =>
          (formation.formationDays ?? []).map((day) => ({
            formation,
            day,
          }))
        );

        const upcomingSessions = allSessions
          .filter(({ day }) => {
            const endDate = new Date(day.end_date);
            return !Number.isNaN(endDate.getTime()) && endDate >= today;
          })
          .sort(
            (a, b) =>
              new Date(a.day.start_date).getTime() -
              new Date(b.day.start_date).getTime()
          );

        setSessions(upcomingSessions);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Erreur des sessions :", err);
        setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadFormations();

    return () => controller.abort();
  }, []);

  return (
    <section
      id="sessions"
      className="scroll-mt-16 bg-ivory py-24 lg:py-40"
    >
      <div className="wrap">
        <SectionHeader
          label="Calendrier"
          title={["Prochaines", "Sessions"]}
          subtitle="Découvrez les prochaines dates de formation et réservez votre place en ligne."
        />

        {loading && (
          <p className="mt-16 py-10 text-center text-sm text-ink/50">
            Chargement des prochaines sessions...
          </p>
        )}

        {error && !loading && (
          <p className="mt-16 py-10 text-center text-sm text-red-700">
            Impossible de charger les sessions. Veuillez réessayer plus tard.
          </p>
        )}

        {!loading && !error && sessions.length === 0 && (
          <p className="mt-16 py-10 text-center text-sm text-ink/50">
            Aucune session à venir pour le moment.
          </p>
        )}

        {!loading && !error && sessions.length > 0 && (
          <div className="mt-16 border-t border-ink/15 lg:mt-24">
            {sessions.map(({ formation, day }, index) => (
              <SessionCard
                key={day.id}
                formation={formation}
                day={day}
                index={index}
              />
            ))}
          </div>
        )}

        <Reveal delay={0.1}>
          <p className="mt-10 max-w-xl text-xs font-light leading-relaxed text-ink/45">
            Les tarifs et les places disponibles sont indiqués pour chaque
            session. Le montant de l'acompte est défini par la formation.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
