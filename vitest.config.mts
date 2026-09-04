import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Mirrors the "@/*" alias in tsconfig.json. Hand-written rather than pulling in
      // vite-tsconfig-paths for one line.
      "@": path.resolve(import.meta.dirname, "src"),
      /*
       * `server-only` throws on import outside a server component, which is exactly what
       * it is for — it is the guard that stops the service-role key or a Resend key being
       * pulled into a client bundle. Under vitest every module is imported into jsdom, so
       * the guard fires on modules that are legitimately server-side and legitimately
       * worth testing.
       *
       * Aliased to an empty module here rather than removed from the source: the
       * protection stays real in every build that ships, and the test run stops
       * pretending to be a browser about it.
       */
      "server-only": path.resolve(import.meta.dirname, "test/server-only-stub.ts"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: true,
  },
});
