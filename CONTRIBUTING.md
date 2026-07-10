# Contributing — meavo-navigation

## Before you open a PR

- [ ] Changes are scoped to the request — no drive-by refactors
- [ ] `npx tsc --noEmit` passes (no lint config in this repo)
- [ ] `npm run build` succeeds (tsup, both entries)
- [ ] No test suite — describe the manual check (which consumer app you rendered it in, at 375px and 1280px)
- [ ] Agent docs updated if you added exports, app keys, or changed tool-visibility behaviour
- [ ] New/changed public API keeps `package.json` `exports` and `tsup.config.ts` in sync

## Branch naming

`feature/short-description`, `fix/short-description`, `docs/short-description`

## Commit messages

Imperative mood, complete sentences — e.g. "Add tasks app key to navigation package."

## Code placement

| Layer | Location |
|-------|----------|
| Client components | `src/client/` |
| Server helpers | `src/server/` |
| Shared types | `src/types.ts` |
| App registry (labels, hosts) | `src/constants.ts` |

## Releasing & cross-repo bumps

This package is consumed by every Meavo app via git tag refs:

1. Bump `version` in `package.json`, commit to `main`.
2. `git tag vX.Y.Z && git push origin main --tags`.
3. In each affected consumer, bump the ref: `"@meavo/navigation": "git+https://github.com/meavo-booths/meavo-navigation.git#vX.Y.Z"`, then `npm install` and redeploy.
4. Behavioural changes to the nav shell should be verified in gateway first, then rolled out to satellites.

## Schema changes

N/A — no schema here. `ToolCard` / `ToolCardAccess` live in [meavo-db](https://github.com/meavo-booths/meavo-db); this package only adapts to them through the structural `NavigationPrisma` type.

## PR description

Include:

1. **What** changed (component/helper behaviour or public API)
2. **Why** (link issue if any)
3. **How to verify** (consumer app + viewport widths checked)
4. **Consumers affected** (which apps need a version bump)

## Agent-assisted PRs

If an AI agent wrote the code:

- Verify behaviour rules against `docs/domain.md`
- Reject leftover template placeholder comments in merged files
- Ensure no secrets in diff and no new runtime dependencies
