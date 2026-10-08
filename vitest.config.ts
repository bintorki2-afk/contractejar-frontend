import path from "node:path";

import { defineConfig } from "vitest/config";

// Unit tests for pure logic (no browser): `npm test`.
export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
      // `server-only` throws outside the React server build; tests import
      // server helpers directly.
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
