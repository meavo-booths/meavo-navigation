import { defineConfig } from "tsup";

// tsup builds these configurations at the same time, into the same dist/.
// Never set `clean` on any of them: a configuration's clean runs while the
// others are writing and deletes their finished files (its declaration worker
// removes every dist/*.d.ts, which is how dist/server.d.ts went missing from
// some installs). dist/ is emptied once, before tsup starts, by
// scripts/clean-dist.mjs; scripts/check-dist.mjs then confirms the output.
export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    external: ["react", "react-dom", "next", "next/image", "next/link", "next/navigation"],
    banner: {
      js: '"use client";',
    },
  },
  {
    entry: ["src/server.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    external: ["@prisma/client"],
  },
  {
    entry: ["src/theme.ts", "src/tailwind.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
  },
]);
