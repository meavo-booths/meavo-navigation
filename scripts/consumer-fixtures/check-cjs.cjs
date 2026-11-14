// Copied into the temporary consumer project by check-consumer-install.mjs and
// run there, so module resolution starts from the consumer, not this checkout.
// Requires each entry point that offers CommonJS and prints one JSON line.

const { realpathSync } = require("node:fs");
const { join } = require("node:path");

const { installedDir, entries } = JSON.parse(process.argv[2]);

const results = [];
for (const entry of entries) {
  try {
    const resolved = realpathSync(require.resolve(entry.specifier));
    const expected = realpathSync(join(installedDir, entry.require));
    if (resolved !== expected) {
      results.push({ ok: false, message: `${entry.specifier} resolved to ${resolved}, expected ${expected}` });
      continue;
    }
    const names = Object.keys(require(entry.specifier));
    if (names.length === 0) results.push({ ok: false, message: `${entry.specifier} loaded but exports nothing` });
    else results.push({ ok: true, message: `${entry.specifier} -> ${entry.require} (${names.length} exports)` });
  } catch (error) {
    results.push({ ok: false, message: `${entry.specifier} failed to require: ${error && error.message ? error.message : error}` });
  }
}
console.log(JSON.stringify({ results }));
