import type { MeavoAppKey } from "./types";

export { isExternalHref, resolveGatewayUrl } from "./gateway-url";

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
