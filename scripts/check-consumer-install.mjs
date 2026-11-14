#!/usr/bin/env node
// Consumer install check: proves that a fresh app can install this package
// and use every public entry point.
//
//   npm run test:consumer                                          pack this checkout and check it
//   node scripts/check-consumer-install.mjs --tarball <file.tgz>   check an existing tarball
//   node scripts/check-consumer-install.mjs --keep                 keep the temporary project
//
// What it does:
//   1. `npm pack` (which runs the `prepare` build, as a git-tag install does).
//   2. Installs the tarball into an empty project in the system temp folder.
//   3. For every entry point in `exports`: the declaration file exists; the
//      ESM import resolves into the installed package and loads; the CommonJS
//      require does too where `exports` offers one; and a strict TypeScript
//      consumer file compiles (a missing declaration is error TS7016).
//
// The peer dependencies (react, react-dom, next, @prisma/client) are linked
// from this checkout's node_modules, at the versions in package-lock.json, so
// the check needs no network and does not change when a peer publishes a new
// version. Run `npm ci` first. Needs Node 22.15 or newer.

import { spawnSync } from "node:child_process";
import {
  copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Update this list when a public entry point is deliberately added or removed.
const EXPECTED_ENTRY_POINTS = [".", "./server", "./tailwind", "./theme"];

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptsDir, "..");
const args = process.argv.slice(2);
const keep = args.includes("--keep");
const tarballArg = args.includes("--tarball") ? args[args.indexOf("--tarball") + 1] : null;

const failures = [];
const pass = (message) => console.log(`  ok    ${message}`);
const fail = (message) => {
  failures.push(message);
  console.log(`  FAIL  ${message}`);
};

function run(command, commandArgs, cwd) {
  const result = spawnSync(command, commandArgs, { cwd, encoding: "utf8", shell: process.platform === "win32" });
  return { ok: result.status === 0, output: `${result.stdout ?? ""}${result.stderr ?? ""}`.trim() };
}

function runOrThrow(label, command, commandArgs, cwd) {
  const result = run(command, commandArgs, cwd);
  if (!result.ok) throw new Error(`${label} failed:\n${result.output}`);
}

const work = mkdtempSync(join(realpathSync(tmpdir()), "meavo-navigation-consumer-"));
try {
  // 1. Pack.
  let tarball;
  if (tarballArg) {
    tarball = resolve(tarballArg);
    if (!existsSync(tarball)) throw new Error(`Tarball not found: ${tarball}`);
  } else {
    const packDir = join(work, "pack");
    mkdirSync(packDir);
    runOrThrow("npm pack", "npm", ["pack", "--pack-destination", packDir], root);
    const packed = readdirSync(packDir).filter((name) => name.endsWith(".tgz"));
    if (packed.length !== 1) throw new Error(`Expected one tarball from npm pack, found ${packed.length}.`);
    tarball = join(packDir, packed[0]);
  }
  console.log(`Tarball: ${tarball}`);

  // 2. Install into an empty project. The peers are linked in afterwards, so
  //    npm is told not to fetch them.
  const consumer = join(work, "consumer");
  mkdirSync(consumer);
  writeFileSync(
    join(consumer, "package.json"),
    `${JSON.stringify({ name: "navigation-consumer-check", version: "0.0.0", private: true, type: "module" }, null, 2)}\n`,
  );
  runOrThrow("npm install", "npm", ["install", tarball, "--legacy-peer-deps", "--no-audit", "--no-fund"], consumer);

  const packageName = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).name;
  const installedDir = join(consumer, "node_modules", ...packageName.split("/"));
  const pkg = JSON.parse(readFileSync(join(installedDir, "package.json"), "utf8"));
  console.log(`Installed ${pkg.name}@${pkg.version} into ${consumer}`);

  for (const peer of Object.keys(pkg.peerDependencies ?? {})) {
    const source = join(root, "node_modules", ...peer.split("/"));
    if (!existsSync(source)) throw new Error(`Peer dependency ${peer} is not installed in this checkout. Run \`npm ci\` first.`);
    const target = join(consumer, "node_modules", ...peer.split("/"));
    mkdirSync(dirname(target), { recursive: true });
    symlinkSync(source, target, "junction");
  }

  // 3. Entry points.
  console.log("\nEntry points in exports:");
  const entryPoints = Object.keys(pkg.exports ?? {}).sort();
  if (JSON.stringify(entryPoints) === JSON.stringify(EXPECTED_ENTRY_POINTS)) {
    pass(`exports lists exactly ${EXPECTED_ENTRY_POINTS.join(", ")}`);
  } else {
    fail(`exports lists ${entryPoints.join(", ") || "nothing"}; expected ${EXPECTED_ENTRY_POINTS.join(", ")}`);
  }

  const entries = entryPoints.map((key) => ({
    specifier: key === "." ? pkg.name : `${pkg.name}/${key.slice(2)}`,
    types: pkg.exports[key].types ?? null,
    import: pkg.exports[key].import ?? null,
    require: pkg.exports[key].require ?? null,
  }));

  console.log("\nDeclaration files:");
  for (const entry of entries) {
    const file = entry.types ? join(installedDir, entry.types) : null;
    if (file && existsSync(file) && statSync(file).size > 0) pass(`${entry.specifier} has ${entry.types}`);
    else fail(`${entry.specifier} has no declaration file (${entry.types ?? "no types condition in exports"})`);
  }

  // Each loader check runs in its own Node process inside the consumer
  // project, so resolution starts from there and not from this checkout.
  const loaderCheck = (label, fixture, wanted) => {
    console.log(`\n${label}:`);
    if (wanted.length === 0) {
      fail(`no entry point offers ${label}`);
      return;
    }
    copyFileSync(join(scriptsDir, "consumer-fixtures", fixture), join(consumer, fixture));
    const result = run(process.execPath, [fixture, JSON.stringify({ installedDir, entries: wanted })], consumer);
    let report = null;
    try {
      report = JSON.parse(result.output.split("\n").filter((line) => line.startsWith('{"results"')).pop() ?? "null");
    } catch {
      report = null;
    }
    if (!report) {
      fail(`${label} check could not run:\n${result.output}`);
      return;
    }
    for (const item of report.results) (item.ok ? pass : fail)(item.message);
  };

  loaderCheck("ESM import", "check-esm.mjs", entries.filter((entry) => entry.import));
  loaderCheck("CommonJS require", "check-cjs.cjs", entries.filter((entry) => entry.require));

  // A strict TypeScript app importing every entry point. A missing
  // declaration file fails here with TS7016, as it did in the apps' CI.
  console.log("\nTypeScript consumer (strict, moduleResolution bundler):");
  const imports = entries.map((entry, index) => `import * as entry${index} from ${JSON.stringify(entry.specifier)};`);
  writeFileSync(
    join(consumer, "consumer-types.ts"),
    `${imports.join("\n")}\n\nexport const entryPoints = [${entries.map((_, index) => `entry${index}`).join(", ")}];\n`,
  );
  writeFileSync(
    join(consumer, "tsconfig.json"),
    `${JSON.stringify({
      compilerOptions: {
        target: "ES2022", module: "ESNext", moduleResolution: "bundler", strict: true, noEmit: true, skipLibCheck: true, types: [],
      },
      files: ["consumer-types.ts"],
    }, null, 2)}\n`,
  );
  const tsc = join(root, "node_modules", "typescript", "bin", "tsc");
  if (!existsSync(tsc)) throw new Error("TypeScript is not installed in this checkout. Run `npm ci` first.");
  const typecheck = run(process.execPath, [tsc, "-p", join(consumer, "tsconfig.json")], consumer);
  if (typecheck.ok) pass(`tsc accepts imports of ${entries.map((entry) => entry.specifier).join(", ")}`);
  else fail(`tsc rejected the consumer file:\n${typecheck.output}`);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
} finally {
  if (keep) console.log(`\nKept temporary project: ${work}`);
  else rmSync(work, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(`\nConsumer install check failed (${failures.length} problem${failures.length === 1 ? "" : "s"}).`);
  process.exit(1);
}
console.log("\nConsumer install check passed.");
