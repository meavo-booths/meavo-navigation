# Shared appearance

The appearance API is opt-in for fully converted apps. Install the theme preset,
convert interface colours, and add the root provider together. Do not update an
unconverted app to this package release: the navigation now uses semantic tokens.

## Integration

```tsx
// app/layout.tsx — retain the app's other metadata/providers.
import { cookies } from "next/headers";
import { MeavoThemeProvider } from "@meavo/navigation";
import { APPEARANCE_COOKIE, parseThemePreference } from "@meavo/navigation/theme";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const preference = parseThemePreference((await cookies()).get(APPEARANCE_COOKIE)?.value);
  return (
    <html lang="en" data-meavo-theme={preference}>
      <body><MeavoThemeProvider initialPreference={preference}>{children}</MeavoThemeProvider></body>
    </html>
  );
}
```

```ts
// tailwind.config.ts — build-time import only, never from a client component.
import { createMeavoThemePreset } from "@meavo/navigation/tailwind";
export default {
  presets: [createMeavoThemePreset()], // optional { canvas: "#f4f6f9" }
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./node_modules/@meavo/navigation/dist/**/*.js"],
  // Retain the consumer's existing brand palette and other configuration.
};
```

`MeavoNavBar` includes the desktop selector and a labelled mobile section. Outside
the staff navigation (for example Assembly's partner portal), render
`<AppearanceSelector />` or `<AppearanceSelector inline />` inside the provider.
Without the provider, the selector renders nothing. The profile link is unchanged.

The pure `./theme` entry exports `ThemePreference`, `parseThemePreference`,
`readThemeCookie`, `serializeThemeCookie`, `APPEARANCE_COOKIE` and `APPEARANCE_MAX_AGE`.
The client entry exports `MeavoThemeProvider`, `AppearanceSelector` and
`useMeavoTheme`. The server entry also exports the cookie name/parser/type.
The Tailwind preset has ESM and CommonJS builds; it adds no runtime dependencies.

## Preference and first paint

- Values: `light`, `dark`, `system`; anything else defaults to System.
- Cookie: `meavo-appearance`, one year, `Path=/`, `SameSite=Lax`, Secure on HTTPS.
- `Domain=meavo.app` only for that hostname or its subdomains. Localhost and
  deployment previews use host-only cookies. No account/database storage.
- The server renders the preference attribute. CSS resolves System with
  `prefers-color-scheme`, including live OS changes, before React hydration.
- Selection updates the page immediately. Focus, `pageshow`, visibility return,
  pathname and search-parameter navigation reread the cookie.
- When storage is blocked, the page keeps the in-memory choice and displays a
  not-saved message. Reloading cannot retain a blocked preference.

## Colour contract

Use `bg-canvas`, `bg-surface`, `bg-surface-muted`, `text-foreground`,
`text-secondary`, `text-muted`, `border-line` and `border-line-strong` for ordinary
surfaces. Role-based palette tokens (for example `surface-red-50`, `ink-red-700`,
`line-red-200`) preserve status meanings. `text-on-brand` keeps existing white
light-mode labels and uses high-contrast dark ink on green dark-mode buttons.
Existing sparse consumer brand palettes are retained; do not activate formerly
undefined brand classes as part of a theme-only conversion.

`.meavo-logo` adds a white backing only in dark mode. `.meavo-document` maintains
light tokens for an embedded document preview. Print resets the full palette to
light. Do not migrate PDF/email templates, photo pixels or product swatches.

## Verification and release gate

Run `npm test` and `npx tsc --noEmit`. Consumers must run typechecks, lint and builds,
then verify both appearances, System changes, cookie failure, first paint, keyboard
focus, menus, dialogs, mobile layouts and app-specific calendars/charts.

The approved staging rollout uses `v0.3.0-rc.1`, tagged from the staging PR merge.
Update each fully converted consumer's dependency and lockfile together, using
its normal PR-to-staging workflow. No production branch changes are included.
Do not bump MRP, Factory or Clock. Production approval is separate. Rollback restores the
previous dependency and app styling together. There are no database migrations.
