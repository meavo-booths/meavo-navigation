import assert from "node:assert/strict";
import test from "node:test";
import { parseThemePreference, readThemeCookie, serializeThemeCookie } from "../dist/theme.js";
import { createMeavoThemePreset } from "../dist/tailwind.js";

test("preferences are allowlisted, with System as the default", () => {
  for (const value of [undefined, null, "", "DARK", "auto", "dark; Domain=evil.com", {}]) assert.equal(parseThemePreference(value), "system");
  for (const value of ["light", "dark", "system"]) assert.equal(parseThemePreference(value), value);
});

test("cookie parsing matches the whole name, not substrings or other cookies", () => {
  assert.equal(readThemeCookie("other-meavo-appearance=dark; session=x"), "system");
  assert.equal(readThemeCookie("a=b; meavo-appearance=dark; c=d"), "dark");
  assert.equal(readThemeCookie("meavo-appearance=invalid"), "system");
  assert.equal(readThemeCookie(""), "system");
});

test("production siblings share a secure one-year preference cookie", () => {
  for (const hostname of ["meavo.app", "sales.meavo.app", "assembly.meavo.app"]) {
    const cookie = serializeThemeCookie("dark", { hostname, protocol: "https:" });
    assert.equal(cookie, "meavo-appearance=dark; Path=/; Max-Age=31536000; SameSite=Lax; Domain=meavo.app; Secure");
  }
});

test("previews, localhost and lookalike domains never set the production domain", () => {
  for (const hostname of ["localhost", "127.0.0.1", "sales-git-staging-meavo-gateway.vercel.app", "evilmeavo.app", "meavo.app.evil.example"]) {
    assert.doesNotMatch(serializeThemeCookie("light", { hostname, protocol: "http:" }), /Domain=|Secure/);
  }
});

test("preset generates complete light/dark/print palettes without runtime code", () => {
  const preset = createMeavoThemePreset({ canvas: "#f4f6f9" });
  let rules;
  preset.plugins[0]({ addBase: (value) => { rules = value; }, theme: (key) => key === "colors.brand.600" ? "#2b9662" : undefined });
  assert.equal(rules[":root"]["--meavo-canvas"], "244 246 249");
  assert.equal(rules[":root"]["--meavo-surface-brand-600"], "43 150 98");
  assert.equal(rules[':root[data-meavo-theme="dark"]']["--meavo-surface"], "15 23 42");
  assert.equal(rules[':root[data-meavo-theme="dark"]'].colorScheme, "dark");
  assert.ok(rules["@media screen and (prefers-color-scheme: dark)"]);
  assert.ok(rules["@media print"]);
  assert.equal(rules[".meavo-document"].colorScheme, "light");
  assert.doesNotMatch(JSON.stringify(rules), /undefined|NaN/);
  for (const value of Object.values(preset.theme.extend.colors)) assert.match(value, /^rgb\(var\(--meavo-/);
});

test("interface logos use the white asset only on dark surfaces, including System", () => {
  let rules;
  createMeavoThemePreset().plugins[0]({ addBase: (value) => { rules = value; }, theme: () => undefined });
  const dark = ':root[data-meavo-theme="dark"]';
  const system = ':root:not([data-meavo-theme="light"]):not([data-meavo-theme="dark"])';
  assert.equal(rules["img.meavo-logo"].content, "var(--meavo-logo-image, normal)");
  assert.equal(rules[":root"]["--meavo-logo-image"], "normal");
  assert.equal(rules[dark]["--meavo-logo-image"], 'url("/meavo-logo-white.png")');
  assert.equal(rules["@media screen and (prefers-color-scheme: dark)"][system]["--meavo-logo-image"], rules[dark]["--meavo-logo-image"]);
  assert.equal(rules[".meavo-document"]["--meavo-logo-image"], "normal");
  for (const value of Object.values(rules["@media print"])) assert.equal(value["--meavo-logo-image"], "normal");
  assert.doesNotMatch(JSON.stringify(rules), /boxShadow/);
});
