import assert from "node:assert/strict";
import test from "node:test";
import { parseNotificationFeed } from "../dist/server.js";

const item = {
  id: "n1",
  title: "Deal won",
  body: "MQ-00001 was converted",
  url: "https://sales.meavo.app/deals/x",
  sourceApp: "SALES",
  readAt: null,
  createdAt: "2026-11-17T10:00:00.000Z",
};

test("a complete feed passes through unchanged", () => {
  const feed = { items: [item, { ...item, id: "n2", url: null, readAt: "2026-11-17T11:00:00.000Z" }], unreadCount: 1 };
  assert.deepEqual(parseNotificationFeed(feed), feed);
  assert.deepEqual(parseNotificationFeed({ items: [], unreadCount: 0 }), { items: [], unreadCount: 0 });
});

test("extra fields from the route are dropped at the top level", () => {
  assert.deepEqual(parseNotificationFeed({ items: [], unreadCount: 2, error: "x" }), { items: [], unreadCount: 2 });
});

test("anything that is not a feed is refused, so the bell keeps what it has", () => {
  for (const value of [
    null,
    undefined,
    "<!doctype html>",
    [],
    { error: "Unauthorized" },
    { items: [], unreadCount: -1 },
    { items: [], unreadCount: 1.5 },
    { items: [], unreadCount: "3" },
    { items: "none", unreadCount: 0 },
    { items: [{ ...item, id: 7 }], unreadCount: 0 },
    { items: [{ ...item, readAt: undefined }], unreadCount: 0 },
    { items: [null], unreadCount: 0 },
  ]) {
    assert.equal(parseNotificationFeed(value), null);
  }
});
