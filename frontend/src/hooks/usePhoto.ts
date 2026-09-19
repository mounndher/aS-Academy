import { useEffect, useState } from "react";

/**
 * Resolves an image slot: tries the authentic AS Academy file first
 * (e.g. /images/as-founder.jpg) and falls back to the hosted photo
 * when the file is not present yet. Never shows a broken image.
 */
export function usePhoto(src: string, fallback?: string): string {
  const [resolved, setResolved] = useState(fallback && fallback !== src ? fallback : src);

  useEffect(() => {
    if (!fallback || fallback === src) {
      setResolved(src);
      return;
    }
    let alive = true;
    const probe = new Image();
    probe.onload = () => {
      if (alive) setResolved(src);
    };
    probe.onerror = () => {
      if (alive) setResolved(fallback);
    };
    probe.src = src;
    return () => {
      alive = false;
    };
  }, [src, fallback]);

  return resolved;
}
