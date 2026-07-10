# @meavo/navigation

Shared main navigation header for Meavo apps: logo, tool switcher, nav links, and user menu.

## Install

```bash
npm install @meavo/navigation
```

From GitHub (Vercel-compatible HTTPS URL):

```json
"@meavo/navigation": "git+https://github.com/meavo-booths/meavo-navigation.git#v0.1.0"
```

Avoid `github:org/repo` on Vercel — npm resolves that via SSH, which fails without deploy keys.

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

Set `MEAVO_APP_KEY=gateway|hols|assembly|sales|mrp|factory|rp|clock|tasks` and `GATEWAY_URL=https://meavo.app` in each app.

## Documentation

| Doc | Purpose |
|-----|---------|
| [AGENTS.md](AGENTS.md) | Quick orientation for AI coding agents |
| [.cursor/rules/](.cursor/rules/) | Always-on Cursor rules |
| [docs/architecture.md](docs/architecture.md) | Consumers, export map, release flow |
| [docs/domain.md](docs/domain.md) | Tool visibility rules and app key registry |
| [CONTRIBUTING.md](CONTRIBUTING.md) | PR process and release checklist |
