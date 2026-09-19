import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollToId, type ScrollState } from "@/lib/scroll";

export type { ScrollState };

/**
 * Navigate to a home-page section from anywhere.
 * On the home page: smooth scroll. Elsewhere: go home, then scroll.
 */
export function useSectionNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (id: string) => {
      if (location.pathname === "/") {
        scrollToId(id);
      } else {
        navigate("/", { state: { scrollTo: id } satisfies ScrollState });
      }
    },
    [location.pathname, navigate],
  );
}
