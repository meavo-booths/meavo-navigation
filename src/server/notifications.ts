import type { NotificationFeed, NotificationItem } from "../types";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  sourceApp: string;
  readAt: Date | null;
  createdAt: Date;
};

/**
 * Structural subset of the shared @meavo/db Prisma client, so this package
 * does not depend on the generated client types.
 */
export type NotificationsPrisma = {
  notification: {
    findMany: (args: {
      where: Record<string, unknown>;
      orderBy: Array<Record<string, "asc" | "desc">>;
      take: number;
      select: {
        id: true;
        title: true;
        body: true;
        url: true;
        sourceApp: true;
        readAt: true;
        createdAt: true;
      };
    }) => Promise<NotificationRow[]>;
    count: (args: { where: Record<string, unknown> }) => Promise<number>;
    updateMany: (args: {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    }) => Promise<unknown>;
  };
};

function toItem(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    url: row.url,
    sourceApp: row.sourceApp,
    readAt: row.readAt ? row.readAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getNotifications(
  prisma: NotificationsPrisma,
  options: { userId: string; limit?: number },
): Promise<NotificationFeed> {
  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: options.userId },
      orderBy: [{ createdAt: "desc" }],
      take: options.limit ?? 15,
      select: {
        id: true,
        title: true,
        body: true,
        url: true,
        sourceApp: true,
        readAt: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({
      where: { userId: options.userId, readAt: null },
    }),
  ]);

  return { items: rows.map(toItem), unreadCount };
}

export async function markNotificationRead(
  prisma: NotificationsPrisma,
  options: { userId: string; notificationId: string },
): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: options.notificationId, userId: options.userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(
  prisma: NotificationsPrisma,
  options: { userId: string },
): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId: options.userId, readAt: null },
    data: { readAt: new Date() },
  });
}
