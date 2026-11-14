// Copied into the temporary consumer project by check-consumer-install.mjs and
// run there, so module resolution starts from the consumer, not this checkout.
// Imports each entry point as ESM and prints one JSON line with the results.

import { realpathSync } from "node:fs";
import * as nodeModule from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const { installedDir, entries } = JSON.parse(process.argv[2]);

if (typeof nodeModule.registerHooks !== "function") {
  throw new Error("The consumer install check needs Node 22.15 or newer (module.registerHooks).");
}

// The client entry imports next/image, next/link and next/navigation. Next
// ships those as image.js, link.js and navigation.js without an `exports` map.
// Bundlers resolve that; plain Node ESM does not. Add the ".js" for exactly
// those specifiers, the way the apps' bundler does.
nodeModule.registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (error?.code === "ERR_MODULE_NOT_FOUND" && /^next\/[\w-]+$/.test(specifier)) {
        return nextResolve(`${specifier}.js`, context);
      }
      throw error;
    }
  },
});

const results = [];
for (const entry of entries) {
  try {
    const resolved = realpathSync(fileURLToPath(import.meta.resolve(entry.specifier)));
    const expected = realpathSync(join(installedDir, entry.import));
    if (resolved !== expected) {
      results.push({ ok: false, message: `${entry.specifier} resolved to ${resolved}, expected ${expected}` });
      continue;
    }
    const names = Object.keys(await import(entry.specifier));
    if (names.length === 0) results.push({ ok: false, message: `${entry.specifier} loaded but exports nothing` });
    else results.push({ ok: true, message: `${entry.specifier} -> ${entry.import} (${names.length} exports)` });
  } catch (error) {
    results.push({ ok: false, message: `${entry.specifier} failed to import: ${error?.message ?? error}` });
  }
}
console.log(JSON.stringify({ results }));
