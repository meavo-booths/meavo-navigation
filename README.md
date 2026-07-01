# @meavo/navigation

Shared main navigation header for Meavo apps: logo, tool switcher, nav links, and user menu.

## Install

```bash
npm install @meavo/navigation
```

From GitHub (before publishing to npm):

```json
"@meavo/navigation": "github:meavo-booths/meavo-navigation#v0.1.0"
```

## Tailwind

Add to `tailwind.config.ts`:

```typescript
content: [
  "./src/**/*.{js,ts,jsx,tsx}",
  "./node_modules/@meavo/navigation/dist/**/*.js",
],
```

## Next.js

```typescript
// next.config.ts
transpilePackages: ["@meavo/navigation"],
```

## Usage

```typescript
import { MeavoNavBar } from "@meavo/navigation";
import { getAccessibleTools, resolveCurrentToolId } from "@meavo/navigation/server";
```

Set `MEAVO_APP_KEY=gateway|hols|assembly` and `GATEWAY_URL=https://meavo.app` in each app.
