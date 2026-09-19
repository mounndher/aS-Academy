import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollToId, type ScrollState } from "@/lib/scroll";

/**
 * On page mount: scroll to top — or to the section requested through
 * `location.state.scrollTo` (e.g. land directly on the reservation form).
 */
export function useScrollToState() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const target = (location.state as ScrollState | null)?.scrollTo;
    if (!target) {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    const t = window.setTimeout(() => {
      scrollToId(target, "instant");
      navigate(location.pathname, { replace: true, state: null });
    }, 160);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
