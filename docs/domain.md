# Domain reference — meavo-navigation

Business rules and **where to change what**. For stack and release flow see [architecture.md](architecture.md).

## Glossary

| Term | Meaning |
|------|---------|
| Tool card | A `ToolCard` row in the shared DB (owned by gateway) — one launchable app/tool with `id`, `name`, `url`, `linkedAppKey` |
| Tool switcher | Dropdown in the nav bar listing the tools the signed-in user may open |
| App key | Stable identifier of a Meavo app (`MeavoAppKey`), set by each consumer via `MEAVO_APP_KEY` |
| Gateway | `meavo.app` — identity owner; always the first tool switcher entry and the fallback "current" tool |

## App key registry

Adding a Meavo app requires updating **all four** together (plus consumer seeds in meavo-db):

| What | Where |
|------|-------|
| `MeavoAppKey` union | `src/types.ts` |
| `isMeavoAppKey` guard | `src/constants.ts` |
| Fallback display label | `APP_FALLBACK_LABELS` in `src/constants.ts` |
| Same-tab host allowlist | `MEAVO_APP_HOSTS` in `src/constants.ts` |

## Tool visibility rules

Resolved in `src/server/get-accessible-tools.ts`:

- Admins (`isAdmin: true`) see **all active** tool cards.
- Everyone else sees only active cards with a `ToolCardAccess` row for their `userId` — so revoking access in gateway Admin hides the tool on next render.
- The Gateway entry (`id: "gateway"`) is always prepended and never gated.
- `linkedAppKey` is **never** used for access — only for current-tool resolution.

## Current-tool resolution

Resolved in `src/server/resolve-current-tool.ts`, in priority order:

1. `currentAppKey === "gateway"` → `"gateway"`.
2. Option whose `linkedAppKey` matches the consumer's app key.
3. Option whose `name` equals the app's fallback label (legacy cards without `linkedAppKey`).
4. Fallback → `"gateway"`.

## Navigation behaviour

`src/client/tool-navigation.ts`: URLs whose host is in `MEAVO_APP_HOSTS` (all `*.meavo.app` + `localhost`) open in the **same tab**; anything else opens in a **new tab** with `noopener,noreferrer`. External tool cards (third-party links) must keep this behaviour.

`src/gateway-url.ts` — `resolveGatewayUrl` normalises consumer-provided gateway URLs: strips paths to the origin, maps the retired `gateway.meavo.app` host and any unparsable value to `https://meavo.app`.

## Mutation map

This package performs **no writes** — it is read-only over `ToolCard` / `ToolCardAccess`. Granting/revoking access, creating tool cards, and seeds all happen in gateway (UI) and meavo-db (schema/seeds).
