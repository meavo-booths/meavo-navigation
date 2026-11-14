#!/usr/bin/env node
// Runs at the end of every build (including the `prepare` build that npm runs
// when an app installs this package from a git tag). Fails the build when a
// file that package.json points to is missing or empty, so an incomplete
// dist/ stops the install with a clear message instead of reaching the app
// and failing later as "Could not find a declaration file".

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

const targets = new Set();
const collect = (value) => {
  if (typeof value === "string") targets.add(value);
  else if (value && typeof value === "object") Object.values(value).forEach(collect);
};
collect([pkg.main, pkg.types, pkg.exports]);

const problems = [];
for (const target of [...targets].sort()) {
  const file = join(root, target);
  if (!existsSync(file)) problems.push(`${target} is missing`);
  else if (statSync(file).size === 0) problems.push(`${target} is empty`);
}

if (problems.length > 0) {
  console.error(`Build output is incomplete (${pkg.name}@${pkg.version}):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`Build output complete: ${targets.size} files referenced by package.json exist.`);
