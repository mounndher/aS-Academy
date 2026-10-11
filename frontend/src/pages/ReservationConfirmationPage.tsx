import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";

type ConfirmationState = {
  formationTitle?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  deposit?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function calendarDate(date: Date, endOfDay = false): string {
  const value = new Date(date);
  if (endOfDay) value.setDate(value.getDate() + 1);
  return `${value.getFullYear()}${String(value.getMonth()+1).padStart(2,"0")}${String(value.getDate()).padStart(2,"0")}`;
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export default function ReservationConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const details = (location.state || {}) as ConfirmationState;

  const start = useMemo(() => parseDate(details.startDate), [details.startDate]);
  const end = useMemo(() => parseDate(details.endDate || details.startDate), [details.endDate, details.startDate]);
  const datesLabel = useMemo(() => {
    if (!start) return "Dates à confirmer";
    const format = (date: Date) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date);
    return end && end.getTime() !== start.getTime() ? `${format(start)} — ${format(end)}` : format(start);
  }, [start, end]);

  const googleCalendarUrl = useMemo(() => {
    if (!start) return "";
    const endDate = end || start;
    const dates = `${calendarDate(start)}/${calendarDate(endDate, true)}`;
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: details.formationTitle || "Formation AS Academy",
      dates,
      details: `Réservation AS Academy${details.firstName ? ` pour ${details.firstName} ${details.lastName || ""}` : ""}. Acompte : ${details.deposit || "à confirmer"}.`,
      location: details.city || "À confirmer",
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, [start, end, details.formationTitle, details.firstName, details.lastName, details.deposit, details.city]);

  function downloadCalendarFile() {
    if (!start) return;
    const endDate = end || start;
    const uid = `as-academy-${Date.now()}@as-academy`;
    const description = `Réservation AS Academy. Acompte : ${details.deposit || "à confirmer"}.`;
    const content = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AS Academy//Reservation//FR", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
      `DTSTART;VALUE=DATE:${calendarDate(start)}`,
      `DTEND;VALUE=DATE:${calendarDate(endDate, true)}`,
      `SUMMARY:${escapeIcs(details.formationTitle || "Formation AS Academy")}`,
      `LOCATION:${escapeIcs(details.city || "À confirmer")}`,
      `DESCRIPTION:${escapeIcs(description)}`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Rappel : formation AS Academy demain", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reservation-as-academy.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  if (!details.formationTitle) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="display text-4xl">Aucune réservation à afficher</h1>
        <p className="mt-4 text-sm text-ink/60">Les détails ne sont pas disponibles dans cette session. Revenez à la formation pour effectuer une réservation.</p>
        <button onClick={() => navigate("/formations")} className="mt-8 bg-[#111] px-6 py-3 text-xs uppercase tracking-widest text-white">Voir les formations</button>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[0.8fr_1.2fr] md:px-10 md:py-24">
      <section>
        <p className="label text-ink/45">Réservation confirmée</p>
        <h1 className="display mt-6 text-4xl leading-tight md:text-6xl">Merci pour votre demande.</h1>
        <p className="mt-6 text-sm leading-relaxed text-ink/65">Votre demande a bien été envoyée. L’académie vous contactera pour confirmer votre inscription.</p>
      </section>
      <section className="border border-ink/15 bg-[#faf9f6] p-7 md:p-10">
        <p className="label text-ink/45">Récapitulatif</p>
        <h2 className="display mt-5 text-3xl md:text-4xl">{details.formationTitle}</h2>
        <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
          <div className="flex justify-between gap-6 py-4"><span className="label text-[10px] text-ink/45">Participant</span><span className="text-right">{[details.firstName, details.lastName].filter(Boolean).join(" ") || "—"}</span></div>
          <div className="flex justify-between gap-6 py-4"><span className="label text-[10px] text-ink/45">Email</span><span className="text-right">{details.email || "—"}</span></div>
          <div className="flex justify-between gap-6 py-4"><span className="label text-[10px] text-ink/45">Ville</span><span className="text-right">{details.city || "À confirmer"}</span></div>
          <div className="flex justify-between gap-6 py-4"><span className="label text-[10px] text-ink/45">Dates</span><span className="text-right">{datesLabel}</span></div>
          <div className="flex justify-between gap-6 py-4"><span className="label text-[10px] text-ink/45">Acompte</span><span className="font-serif text-lg">{details.deposit || "À confirmer"}</span></div>
        </div>
        <div className="mt-8">
          <p className="label text-ink/45">Ajouter à mon agenda</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a href={googleCalendarUrl || undefined} target="_blank" rel="noreferrer" aria-disabled={!googleCalendarUrl} className={`inline-flex min-h-12 items-center justify-center bg-[#111] px-5 py-3 text-center text-xs uppercase tracking-widest text-white ${!googleCalendarUrl ? "pointer-events-none opacity-40" : "hover:opacity-80"}`}>Google Calendar</a>
            <button type="button" onClick={downloadCalendarFile} disabled={!start} className="min-h-12 border border-ink/20 px-5 py-3 text-xs uppercase tracking-widest disabled:opacity-40">Outlook / Apple Calendar (.ics)</button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink/50">Le fichier .ics peut être ouvert avec Outlook, Apple Calendar et la plupart des applications d’agenda.</p>
        </div>
      </section>
    </main>
  );
}
