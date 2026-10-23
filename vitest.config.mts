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
    environment: "node",
    include: [
      "tests/unit/**/*.test.ts",
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
      // Quality Gates de la CI
      thresholds: {
        lines: 75,
        functions: 70,
        branches: 60,
        statements: 75,
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