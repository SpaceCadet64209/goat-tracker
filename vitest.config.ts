import { defineConfig } from "vitest/config";

const shared = {
  environment: "node" as const,
  globals: true,
  coverage: { reporter: ["text", "json", "html"] },
};

export default defineConfig({
  resolve: { alias: { "@": import.meta.dirname } },
  test: {
    projects: [
      {
        test: {
          ...shared,
          name: "unit",
          include: [
            "app/**/*.test.{ts,tsx}",
            "features/**/*.test.{ts,tsx}",
            "lib/**/*.test.{ts,tsx}",
            "tests/unit/**/*.test.{ts,tsx}",
          ],
          exclude: [
            "node_modules/**",
            ".next/**",
            "tests/integration/**",
            "e2e/**",
          ],
        },
      },
      {
        test: {
          ...shared,
          name: "integration",
          include: ["tests/integration/**/*.test.{ts,tsx}"],
          setupFiles: ["tests/helpers/integration-setup.ts"],
          fileParallelism: false,
          testTimeout: 20_000,
          hookTimeout: 20_000,
        },
      },
    ],
  },
});
