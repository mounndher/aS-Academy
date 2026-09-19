export interface ScrollState {
  scrollTo?: string;
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scroll to a section id ("top" / "accueil" → top of page). Respects scroll-margin. */
export function scrollToId(id: string, behavior?: ScrollBehavior) {
  const mode: ScrollBehavior = behavior ?? (prefersReducedMotion() ? "instant" : "smooth");
  if (id === "accueil" || id === "top") {
    window.scrollTo({ top: 0, behavior: mode });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  if (typeof el.scrollIntoView === "function") {
    el.scrollIntoView({ behavior: mode, block: "start" });
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top, behavior: mode });
}
