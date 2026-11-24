export type MeavoAppKey =
  | "gateway"
  | "hols"
  | "assembly"
  | "sales"
  | "mrp"
  | "factory"
  | "rp"
  | "clock"
  | "tasks"
  | "requests"
  | "stock"
  | "inventory"
  | "showroom";

export type NavLink = {
  href: string;
  label: string;
};

export type ToolSwitcherOption = {
  id: string;
  name: string;
  url: string;
  linkedAppKey?: string | null;
};

export type ToolSwitcherState = {
  currentId: string;
  options: ToolSwitcherOption[];
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  sourceApp: string;
  /** ISO timestamp, null while unread. */
  readAt: string | null;
  /** ISO timestamp. */
  createdAt: string;
};

export type NotificationFeed = {
  items: NotificationItem[];
  unreadCount: number;
};

/**
 * Wiring for the notification bell. The consumer app passes its initial feed,
 * where the bell reads a fresh feed from, and server actions that mark items
 * read.
 *
 * Give `refreshUrl`: a same-origin GET route in the consumer app that answers
 * with a `NotificationFeed` as JSON (use `getNotifications` from
 * `@meavo/navigation/server` behind the app's own sign-in check). The bell
 * polls it once a minute on every page. That poll must not be a Server Action:
 * on Next.js 15.5 a page change that starts while a Server Action is in flight
 * can stay on the old page (vercel/next.js#95391).
 *
 * `refresh` is the older wiring, a Server Action, and is used only when no
 * `refreshUrl` is given.
 */
export type NotificationsState = {
  initial: NotificationFeed;
  refreshUrl?: string;
  refresh?: () => Promise<NotificationFeed>;
  markRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};
