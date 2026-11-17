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

## Notification bell

`MeavoNavBar` shows the bell when it is given `notifications`. The bell reads a fresh feed once a minute on every page, so that read must be a plain GET route in the app, not a Server Action:

```ts
// src/app/api/notifications/route.ts
import { NextResponse } from "next/server";
import { getNotifications } from "@meavo/navigation/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await signedInUserIdOrNull(); // the app's own sign-in and tool-access check
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getNotifications(prisma, { userId }), {
    headers: { "Cache-Control": "no-store" },
  });
}
```

```tsx
notifications={{
  initial: await getNotifications(prisma, { userId }),
  refreshUrl: "/api/notifications",
  markRead: markNotificationReadAction,
  markAllRead: markAllNotificationsReadAction,
}}
```

Why: on Next.js 15.5 a page change that starts while a Server Action is in flight can stay on the old page until the next router update (vercel/next.js#95391, fixed in 16.3). A poll that is a Server Action puts one in flight every minute, in every app. `refresh` (a Server Action) still works when no `refreshUrl` is given, for apps that have not switched yet. Marking items read stays a Server Action: it only runs when someone clicks.

## Documentation

Light/Dark/System integration and rollout: [Shared appearance](docs/appearance.md).

| Doc | Purpose |
|-----|---------|
| [AGENTS.md](AGENTS.md) | Quick orientation for AI coding agents |
| [.cursor/rules/](.cursor/rules/) | Always-on Cursor rules |
| [docs/architecture.md](docs/architecture.md) | Consumers, export map, release flow |
| [docs/domain.md](docs/domain.md) | Tool visibility rules and app key registry |
| [CONTRIBUTING.md](CONTRIBUTING.md) | PR process and release checklist |
