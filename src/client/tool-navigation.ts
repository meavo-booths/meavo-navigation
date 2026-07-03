import { MEAVO_APP_HOSTS } from "../constants";

export function isSameTabNavigation(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return MEAVO_APP_HOSTS.has(host);
  } catch {
    return false;
  }
}

export function navigateToTool(url: string): void {
  if (isSameTabNavigation(url)) {
    window.location.href = url;
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
