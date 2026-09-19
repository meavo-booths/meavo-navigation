/** Browser preference, not an account setting. Safe to import on the server. */
export type ThemePreference = "light" | "dark" | "system";

export const APPEARANCE_COOKIE = "meavo-appearance";
export const APPEARANCE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseThemePreference(value: unknown): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

export function readThemeCookie(cookieHeader: string): ThemePreference {
  const value = cookieHeader.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${APPEARANCE_COOKIE}=`))
    ?.slice(APPEARANCE_COOKIE.length + 1);
  return parseThemePreference(value);
}

export function serializeThemeCookie(
  preference: ThemePreference,
  location: { hostname: string; protocol: string },
): string {
  const hostname = location.hostname.toLowerCase();
  const domain = hostname === "meavo.app" || hostname.endsWith(".meavo.app")
    ? "; Domain=meavo.app" : "";
  const secure = location.protocol === "https:" ? "; Secure" : "";
  return `${APPEARANCE_COOKIE}=${parseThemePreference(preference)}; Path=/; Max-Age=${APPEARANCE_MAX_AGE}; SameSite=Lax${domain}${secure}`;
}
