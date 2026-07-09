import type { MeavoAppKey } from "./types";

export const APP_FALLBACK_LABELS: Record<MeavoAppKey, string> = {
  gateway: "Gateway",
  hols: "Vacation Tracker",
  assembly: "Assembly",
  sales: "Sales",
  mrp: "MRP",
  factory: "Factory",
  rp: "RP",
  clock: "Clock-In",
  tasks: "Tasks",
};

export const MEAVO_APP_HOSTS = new Set([
  "meavo.app",
  "hols.meavo.app",
  "assembly.meavo.app",
  "sales.meavo.app",
  "mrp.meavo.app",
  "factory.meavo.app",
  "rp.meavo.app",
  "clock.meavo.app",
  "tasks.meavo.app",
  "localhost",
]);

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function resolveGatewayUrl(raw: string | undefined): string {
  const fallback = "https://meavo.app";
  const value = raw?.trim();
  if (!value) return fallback;

  if (isExternalHref(value)) {
    try {
      const url = new URL(value);
      if (url.hostname === "gateway.meavo.app") return fallback;
      return url.origin;
    } catch {
      return fallback;
    }
  }

  if (value.includes(".") && !value.startsWith("/")) {
    return `https://${value.replace(/\/$/, "")}`;
  }

  return fallback;
}

export function isMeavoAppKey(value: string | undefined): value is MeavoAppKey {
  return (
    value === "gateway" ||
    value === "hols" ||
    value === "assembly" ||
    value === "sales" ||
    value === "mrp" ||
    value === "factory" ||
    value === "rp" ||
    value === "clock" ||
    value === "tasks"
  );
}
