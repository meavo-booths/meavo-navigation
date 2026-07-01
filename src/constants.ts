import type { MeavoAppKey } from "./types";

export const APP_FALLBACK_LABELS: Record<MeavoAppKey, string> = {
  gateway: "Gateway",
  hols: "Vacation Tracker",
  assembly: "Assembly",
};

export const MEAVO_APP_HOSTS = new Set([
  "meavo.app",
  "hols.meavo.app",
  "assembly.meavo.app",
  "localhost",
]);

export function isMeavoAppKey(value: string | undefined): value is MeavoAppKey {
  return value === "gateway" || value === "hols" || value === "assembly";
}
