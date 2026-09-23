<!-- BEGIN MEAVO RELEASE POLICY -->
## Branches and production permission

Create `feat/`, `fix/`, or `chore/` branches from `staging` and open PRs explicitly into `staging`; squash after required checks pass. Never push directly to `main` or `staging`. After staging integration and verification, present the release PR, current head SHA, scope and checks, then stop and ask for one human approval. The PR author may approve in the conversation or a human-authored PR comment; a clear “yes” to the specific request is enough. No second account or formal approving review is required. Changed head/scope requires new approval; retrying the unchanged approved release does not. Production releases use a `staging` → `main` PR and a merge commit. AI agents require explicit human authorization for the repository, production action, and current reviewed PR/head SHA or artifact/configuration scope before merging, enabling auto-merge, queueing, or making any production change. See [RELEASE_POLICY.md](RELEASE_POLICY.md) for the mandatory approval and environment checks; missing staging does not authorize a main release.
<!-- END MEAVO RELEASE POLICY -->

# Contributing — meavo-navigation

## Before you open a PR

- [ ] Changes are scoped to the request — no drive-by refactors
- [ ] `npx tsc --noEmit` passes (no lint config in this repo)
- [ ] `npm run build` succeeds (tsup, both entries)
- [ ] No test suite — describe the manual check (which consumer app you rendered it in, at 375px and 1280px)
- [ ] Agent docs updated if you added exports, app keys, or changed tool-visibility behaviour
- [ ] New/changed public API keeps `package.json` `exports` and `tsup.config.ts` in sync

## Branch naming and release path

Use `feat/short-description` for agent work and open PRs with an explicit `staging` base. Validate the feature preview and staging before preparing a release. Follow [RELEASE_POLICY.md](RELEASE_POLICY.md): changes to `main`, production deployments/migrations, and release tags require specific human approval for the action and revision.

If `staging` or its safe preview environment is missing, prepare feature-only changes and report the setup gap; do not substitute `main`.

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

1. Prepare the version bump on a `feat/*` branch and open a PR against `staging`.
2. Validate the package and affected consumer previews; record the exact release revision. Obtain specific human approval under [RELEASE_POLICY.md](RELEASE_POLICY.md) before promoting to `main` or publishing a version tag/package. Never combine branch pushes with `--tags`.
3. After the approved package release, in each affected consumer open a feature PR against `staging` and bump the ref: `"@meavo/navigation": "git+https://github.com/meavo-booths/meavo-navigation.git#vX.Y.Z"`, then `npm install` and redeploy.
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
