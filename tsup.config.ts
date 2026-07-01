import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
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
]);
