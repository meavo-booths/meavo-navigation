import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { APPEARANCE_COOKIE, parseThemePreference, readThemeCookie, serializeThemeCookie, type ThemePreference } from "../theme";

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  saved: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function MeavoThemeProvider({ initialPreference, children }: {
  initialPreference: ThemePreference;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const search = useSearchParams()?.toString();
  const [preference, updatePreference] = useState(() => parseThemePreference(initialPreference));
  const [saved, setSaved] = useState(true);
  const volatilePreference = useRef(false);

  const apply = useCallback((next: ThemePreference) => {
    document.documentElement.dataset.meavoTheme = next;
    updatePreference(next);
  }, []);

  const sync = useCallback(() => {
    // A blocked cookie must not undo a user's in-memory choice on focus.
    if (volatilePreference.current) return;
    try { apply(readThemeCookie(document.cookie)); } catch { /* Storage may be disabled. */ }
  }, [apply]);

  const setPreference = useCallback((next: ThemePreference) => {
    const validated = parseThemePreference(next);
    apply(validated);
    let persisted = false;
    try {
      document.cookie = serializeThemeCookie(validated, window.location);
      persisted = document.cookie.split(";").some((part) => part.trim() === `${APPEARANCE_COOKIE}=${validated}`);
    } catch { /* Keep the current page usable even when storage is unavailable. */ }
    volatilePreference.current = !persisted;
    setSaved(persisted);
  }, [apply]);

  useEffect(() => { sync(); }, [pathname, search, sync]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") sync(); };
    window.addEventListener("focus", sync);
    window.addEventListener("pageshow", sync);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("pageshow", sync);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [sync]);

  // System appearance is resolved by CSS, including OS changes, before hydration.
  const value = useMemo(() => ({ preference, setPreference, saved }), [preference, setPreference, saved]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useMeavoTheme() { return useContext(ThemeContext); }
