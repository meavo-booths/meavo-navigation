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
