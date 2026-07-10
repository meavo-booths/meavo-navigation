# Architecture — meavo-navigation (`@meavo/navigation`)

Shared npm package providing the Meavo top-navigation header and tool switcher used by every Meavo app. No deployment of its own — it ships as a versioned dependency of the apps.

**Further reading:**
- [domain.md](domain.md) — tool visibility rules, app key registry, navigation behaviour
- [AGENTS.md](../AGENTS.md) — quick orientation for AI agents

## Sibling repos (meavo-booths)

| Repo | Relationship |
|------|--------------|
| [meavo-gateway](https://github.com/meavo-booths/meavo-gateway) | Owns `ToolCard` / `ToolCardAccess` data this package reads; reference implementation of the nav shell |
| [meavo-db](https://github.com/meavo-booths/meavo-db) | Canonical Prisma schema for `ToolCard` / `ToolCardAccess` — consumers pass their Prisma client in |
| `hols`, `assembly`, `sales`, `meavo-mrp`, `Meavo-Factory`, `meavo-tasks`, `meavo-rp`, `meavo-clock` | Consumers — render `MeavoNavBar` and bump this package's git ref on each release |

## Stack decisions

- **Library, not app:** React 19 components + pure server helpers; Next.js (`next/image`, `next/link`, `next/navigation`) and `@prisma/client` are peer dependencies so each app brings its own versions.
- **No direct `@meavo/db` import:** `getAccessibleTools` accepts a structural `NavigationPrisma` type, keeping this package free of schema/version coupling.
- **Tailwind by proxy:** components emit Tailwind class names; each consumer's Tailwind config compiles them (consumer `content` must include `node_modules/@meavo/navigation/dist/**/*.js`, and `transpilePackages: ["@meavo/navigation"]` in `next.config.ts`).
- **tsup dual entry:** client entry gets a `"use client"` banner so consumers can import components straight into Server Component layouts; server entry stays directive-free.

## Repository layout

```
src/
  index.ts               # client entry — components + client-safe helpers
  server.ts              # server entry — data helpers, constants
  types.ts               # MeavoAppKey, NavLink, ToolSwitcherOption/State
  constants.ts           # app labels, meavo.app host allowlist, key guard
  gateway-url.ts         # resolveGatewayUrl, isExternalHref
  client/
    meavo-nav-bar.tsx    # header: logo, links, user menu, mobile drawer
    tool-switcher.tsx    # dropdown listing accessible tools
    tool-navigation.ts   # same-tab (meavo hosts) vs new-tab navigation
    user-avatar.tsx      # image or initials avatar
  server/
    get-accessible-tools.ts   # ToolCard query filtered by ToolCardAccess
    resolve-current-tool.ts   # map MEAVO_APP_KEY → current switcher option
dist/                    # tsup output (gitignored; built by `prepare`)
```

## Data flow

```
Consumer server layout
  ├─ getAccessibleTools(prisma, { userId, isAdmin, gatewayUrl })
  │     admins → all active ToolCards; others → access.some({ userId })
  │     prepends the Gateway entry
  ├─ resolveCurrentToolId(options, MEAVO_APP_KEY)
  └─ <MeavoNavBar links logoHref toolSwitcher user* signOutAction />
        └─ ToolSwitcher click → navigateToTool(url)
              *.meavo.app / localhost → same tab; other hosts → new tab (noopener)
```

## API surface

N/A — library only. Public API is the export map: `.` → `src/index.ts` (components) and `./server` → `src/server.ts` (helpers). Keep `package.json` `exports` and `tsup.config.ts` entries in sync.

## Scheduled jobs

N/A.

## Environment variables

None read by this package. Consumers set `MEAVO_APP_KEY` (their key) and `GATEWAY_URL` (usually `https://meavo.app`) and pass derived values in as props/arguments.

## Release & distribution

1. Bump `version` in `package.json`; commit to `main`.
2. Tag `vX.Y.Z` and push with tags.
3. Consumers pin `"@meavo/navigation": "git+https://github.com/meavo-booths/meavo-navigation.git#vX.Y.Z"` (HTTPS URL — `github:` shorthand breaks on Vercel) and run `npm install`; `prepare` builds `dist/` on install.
4. Also publishable to GitHub Packages (`npm.pkg.github.com`) via `publishConfig`.
