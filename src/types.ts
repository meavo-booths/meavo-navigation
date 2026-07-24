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
  | "requests";

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
 * Wiring for the notification bell. The consumer app passes its initial feed
 * plus server actions the bell calls to refresh and mark items read.
 */
export type NotificationsState = {
  initial: NotificationFeed;
  refresh: () => Promise<NotificationFeed>;
  markRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};
