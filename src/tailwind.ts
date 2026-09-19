import type { Config, PluginAPI } from "tailwindcss/types/config";
import { palettes } from "./theme-palettes";

const DARK = ':root[data-meavo-theme="dark"]';
const SYSTEM = ':root:not([data-meavo-theme="light"]):not([data-meavo-theme="dark"])';
const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const neutralNames = new Set(["slate", "gray", "zinc", "neutral", "stone"]);

function rgb(hex: string) {
  const expanded = hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join("")}` : hex;
  if (!/^#[\da-f]{6}$/i.test(expanded)) throw new Error(`Appearance palette requires a hex colour: ${hex}`);
  return [1, 3, 5].map((start) => parseInt(expanded.slice(start, start + 2), 16)).join(" ");
}

/** Compile-time only: colours are CSS variables, never runtime stylesheet injection. */
export function createMeavoThemePreset({ canvas = "#f8fafc" }: { canvas?: string } = {}): Partial<Config> {
  const colours: Record<string, string> = {};
  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};
  function token(name: string, day: string, night: string) {
    const key = `--meavo-${name}`;
    colours[name] = `rgb(var(${key}) / <alpha-value>)`;
    light[key] = rgb(day);
    dark[key] = rgb(night);
  }
  const s = palettes.slate;
  const neutrals: Record<string, [string, string]> = {
    canvas: [canvas, s[950]], surface: ["#ffffff", s[900]],
    "surface-muted": [s[50], "#172033"], "surface-hover": [s[100], s[800]],
    "surface-pressed": [s[200], s[700]], "surface-disabled": [s[300], s[600]],
    "surface-dim": [s[400], s[500]], "surface-contrast": [s[900], s[700]],
    foreground: [s[900], s[100]], heading: [s[800], s[200]], label: [s[700], s[200]],
    secondary: [s[600], s[300]], muted: [s[500], s[400]], faint: [s[400], s[400]],
    "text-disabled": [s[300], s[500]], "ink-strong": [s[950], s[50]],
    line: [s[200], s[700]], "line-soft": [s[100], s[800]], "line-strong": [s[300], s[600]],
    "line-default": [palettes.gray[200], s[700]],
    "line-emphasis": [s[400], s[500]], "on-brand": ["#ffffff", s[950]],
    "surface-warm": ["#FAF9F7", s[900]], "line-warm": ["#F2F0EB", s[700]],
    "surface-culture": ["#EEDCDC", "#38252e"],
  };
  for (const [name, [day, night]] of Object.entries(neutrals)) token(name, day, night);

  // Separate ink/surface/line tokens: a red label and a red button cannot share
  // the same dark-mode mapping. Light values retain the original Tailwind hues.
  const palette: Record<string, Record<string, string>> = { ...palettes, brand: { ...palettes.emerald, 50: "#f0fdf4", 100: "#d1f4e0", 500: "#30A46C", 600: "#30A46C", 700: "#0C8F61" } };
  for (const [name, scale] of Object.entries(palette)) {
    for (const shade of shades) {
      const neutral = neutralNames.has(name);
      const inkShade = shade <= 300 ? shade : shade <= 500 ? 400 : 1000 - shade;
      const surfaceShade = shade <= 300 ? 1000 - shade : shade;
      const lineShade = shade === 50 ? 900 : shade <= 300 ? 900 - shade : shade <= 600 ? 500 : 400;
      const nightInk = neutral ? s[Math.max(100, Math.min(400, inkShade))] : palettes[name === "brand" ? "emerald" : name][inkShade];
      token(`ink-${name}-${shade}`, scale[shade], nightInk);
      token(`surface-${name}-${shade}`, scale[shade], scale[surfaceShade]);
      token(`line-${name}-${shade}`, scale[shade], scale[lineShade]);
    }
  }

  function plugin({ addBase, theme }: PluginAPI) {
    const day = { ...light };
    const night = { ...dark };
    const chevron = (stroke: string) => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1.5 1.75L6 6.25L10.5 1.75' stroke='%23${stroke}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;
    day["--meavo-select-chevron"] = chevron("475569");
    night["--meavo-select-chevron"] = chevron("94a3b8");
    // Consumer-owned brand values stay intact (Tasks/Requests use a distinct 600).
    for (const shade of shades) {
      const brand = theme(`colors.brand.${shade}`);
      if (typeof brand !== "string" || !/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(brand)) continue;
      for (const role of ["ink", "surface", "line"]) day[`--meavo-${role}-brand-${shade}`] = rgb(brand);
      if (shade >= 400) night[`--meavo-surface-brand-${shade}`] = rgb(brand);
    }
    const logo = { backgroundColor: "#ffffff", borderRadius: "0.25rem", boxShadow: "0 0 0 3px #ffffff" };
    addBase({
      ":root": { ...day, colorScheme: "light" },
      [DARK]: { ...night, colorScheme: "dark" },
      ".meavo-document": { ...day, colorScheme: "light" },
      [`${DARK} .meavo-logo`]: logo,
      '@media screen and (prefers-color-scheme: dark)': {
        [SYSTEM]: { ...night, colorScheme: "dark" },
        [`${SYSTEM} .meavo-logo`]: logo,
      },
      // Plain native inputs previously relied on the browser's white default.
      'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]), textarea, select': {
        backgroundColor: "rgb(var(--meavo-surface))", color: "rgb(var(--meavo-foreground))",
      },
      "@media print": {
        ':root, :root[data-meavo-theme="dark"], :root[data-meavo-theme="system"]': { ...day, colorScheme: "light" },
        ".meavo-logo": { boxShadow: "none" },
      },
    });
  }
  return { theme: { extend: { colors: colours } }, plugins: [plugin] };
}
