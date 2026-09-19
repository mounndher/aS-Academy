import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollToId, type ScrollState } from "@/lib/scroll";

interface SiteUIValue {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  /** Go to a formation's reservation form — or to the Formations page. */
  openBooking: (formationSlug?: string) => void;
  /** Go to the Formations page (all dates & cities). */
  requestDate: () => void;
}

const SiteUIContext = createContext<SiteUIValue | null>(null);

export function SiteUIProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const go = useCallback(
    (path: string, section?: string) => {
      setMenuOpen(false);
      if (location.pathname === path) {
        window.setTimeout(() => scrollToId(section ?? "top"), 60);
        return;
      }
      navigate(path, { state: section ? ({ scrollTo: section } satisfies ScrollState) : null });
    },
    [location.pathname, navigate],
  );

  const openBooking = useCallback(
    (slug?: string) => (slug ? go(`/formations/${slug}`, "reservation") : go("/formations")),
    [go],
  );
  const requestDate = useCallback(() => go("/formations"), [go]);

  const value = useMemo(
    () => ({ menuOpen, setMenuOpen, openBooking, requestDate }),
    [menuOpen, openBooking, requestDate],
  );

  return <SiteUIContext.Provider value={value}>{children}</SiteUIContext.Provider>;
}

export function useSiteUI() {
  const ctx = useContext(SiteUIContext);
  if (!ctx) throw new Error("useSiteUI must be used within SiteUIProvider");
  return ctx;
}
