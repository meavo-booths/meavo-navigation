#!/usr/bin/env node
// Empties dist/ once, before tsup starts. See tsup.config.ts for why the
// clean must not happen inside one of the concurrent tsup configurations.

import { rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
rmSync(join(root, "dist"), { recursive: true, force: true });
