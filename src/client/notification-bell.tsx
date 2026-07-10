import { useCallback, useEffect, useRef, useState } from "react";
import type { NotificationFeed, NotificationItem, NotificationsState } from "../types";

const POLL_INTERVAL_MS = 60_000;

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.86 17.08a24 24 0 003.72-.55.75.75 0 00.42-1.2 8.97 8.97 0 01-2.25-5.96V9a5.25 5.25 0 10-10.5 0v.37c0 2.22-.82 4.36-2.25 5.96a.75.75 0 00.42 1.2c1.22.27 2.46.45 3.72.55m6.72 0a24.3 24.3 0 01-6.72 0m6.72 0a3 3 0 11-6.72 0"
      />
    </svg>
  );
}

export function NotificationBell({ notifications }: { notifications: NotificationsState }) {
  const [feed, setFeed] = useState<NotificationFeed>(notifications.initial);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const refreshRef = useRef(notifications.refresh);
  refreshRef.current = notifications.refresh;

  const refresh = useCallback(async () => {
    try {
      setFeed(await refreshRef.current());
    } catch {
      // Keep the last known feed on transient errors.
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function markReadLocally(id: string) {
    setFeed((current) => ({
      unreadCount: Math.max(
        0,
        current.unreadCount -
          (current.items.some((item) => item.id === id && !item.readAt) ? 1 : 0),
      ),
      items: current.items.map((item) =>
        item.id === id && !item.readAt ? { ...item, readAt: new Date().toISOString() } : item,
      ),
    }));
  }

  function handleItemClick(item: NotificationItem) {
    if (!item.readAt) {
      markReadLocally(item.id);
      void notifications.markRead(item.id).catch(() => undefined);
    }
    if (item.url) {
      setOpen(false);
      window.location.href = item.url;
    }
  }

  function handleMarkAllRead() {
    setFeed((current) => ({
      unreadCount: 0,
      items: current.items.map((item) =>
        item.readAt ? item : { ...item, readAt: new Date().toISOString() },
      ),
    }));
    void notifications.markAllRead().catch(() => undefined);
  }

  const badge = feed.unreadCount > 9 ? "9+" : String(feed.unreadCount);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="relative inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 touch-manipulation"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={
          feed.unreadCount > 0
            ? `Notifications (${feed.unreadCount} unread)`
            : "Notifications"
        }
        onClick={() => setOpen((value) => !value)}
      >
        <BellIcon className="h-6 w-6" />
        {feed.unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-red-500 px-1 py-0.5 text-[10px] font-semibold leading-none text-white">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[100] mt-1 w-[20rem] max-w-[calc(100vw-1.5rem)] rounded-lg border border-slate-200 bg-white shadow-lg sm:w-[22rem]">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            {feed.unreadCount > 0 && (
              <button
                type="button"
                className="text-xs font-medium text-brand-700 hover:underline"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>
          {feed.items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-500">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul className="max-h-[24rem] overflow-y-auto py-1">
              {feed.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`flex w-full items-start gap-2 px-3 py-2.5 text-left transition hover:bg-slate-50 touch-manipulation ${
                      item.readAt ? "opacity-70" : ""
                    }`}
                    onClick={() => handleItemClick(item)}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        item.readAt ? "bg-transparent" : "bg-brand-500"
                      }`}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {item.title}
                      </span>
                      <span className="block text-xs text-slate-600">{item.body}</span>
                      <span className="mt-0.5 block text-[11px] text-slate-400">
                        {relativeTime(item.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
