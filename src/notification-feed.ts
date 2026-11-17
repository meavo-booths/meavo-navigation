import type { NotificationFeed, NotificationItem } from "./types";

function isItem(value: unknown): value is NotificationItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.body === "string" &&
    (item.url === null || typeof item.url === "string") &&
    typeof item.sourceApp === "string" &&
    (item.readAt === null || typeof item.readAt === "string") &&
    typeof item.createdAt === "string"
  );
}

/**
 * Checks what a consumer's notifications route returned before the bell shows
 * it. Anything that is not a complete feed (an error body, a sign-in page, a
 * half-written response) gives `null`, and the bell keeps its last feed.
 */
export function parseNotificationFeed(value: unknown): NotificationFeed | null {
  if (!value || typeof value !== "object") return null;
  const feed = value as Record<string, unknown>;
  if (!Array.isArray(feed.items) || !feed.items.every(isItem)) return null;
  if (typeof feed.unreadCount !== "number" || !Number.isInteger(feed.unreadCount) || feed.unreadCount < 0) return null;
  return { items: feed.items, unreadCount: feed.unreadCount };
}
