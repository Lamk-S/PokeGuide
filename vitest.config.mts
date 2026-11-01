import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [fileURLToPath(new URL("./tests/setup.ts", import.meta.url))],
    include: [
      "tests/unit/**/*.test.ts",
      "tests/integration/**/*.test.tsx",
      "tests/integration/**/*.test.ts",
      "tests/regression/**/*.test.ts",
    ],
    exclude: [
      "node_modules/**",
      "dist/**",
      ".next/**",
      "e2e/**",
      "playwright.config.ts",
      "**/*.d.ts",
      "**/*.spec.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      thresholds: {
        lines: 70,
        functions: 60,
        branches: 55,
        statements: 70,
      },
      exclude: [
        "node_modules/**",
        "dist/**",
        ".next/**",
        "e2e/**",
        "**/*.d.ts",
        "data/**",
        "**/*.json",
        "src/app/**",
        "src/app/layout.tsx",
        "src/domain/battle/value-objects/**",
        "src/domain/breeding/rules/**",
        "src/domain/pokemon/constants/**",
        "src/domain/pokemon/services/PokemonFormResolver.ts",
        "src/features/team/constants/**",
        "src/domain/team/config/**",
        "src/components/ui/**",
      ],
    },
  },
});
