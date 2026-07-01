import { APP_FALLBACK_LABELS } from "../constants";
import type { MeavoAppKey, ToolSwitcherOption } from "../types";

export function resolveCurrentToolId(
  options: ToolSwitcherOption[],
  currentAppKey: MeavoAppKey
): string {
  if (currentAppKey === "gateway") {
    return "gateway";
  }

  const linked = options.find((option) => option.linkedAppKey === currentAppKey);
  if (linked) return linked.id;

  const fallbackName = APP_FALLBACK_LABELS[currentAppKey];
  const byName = options.find((option) => option.name === fallbackName);
  if (byName) return byName.id;

  return "gateway";
}

export function currentToolLabel(
  options: ToolSwitcherOption[],
  currentId: string,
  currentAppKey: MeavoAppKey
): string {
  const match = options.find((option) => option.id === currentId);
  if (match) return match.name;
  return APP_FALLBACK_LABELS[currentAppKey];
}
