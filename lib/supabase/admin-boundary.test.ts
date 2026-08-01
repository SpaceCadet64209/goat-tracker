import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const scannedRoots = ["app", "components", "features", "lib"];

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(target);
      return /\.(?:ts|tsx)$/.test(entry.name) &&
        !entry.name.endsWith(".test.ts") &&
        !entry.name.endsWith(".test.tsx")
        ? [target]
        : [];
    }),
  );
  return files.flat();
}

describe("Supabase admin client boundary", () => {
  it("keeps the service-role client out of browser-reachable modules", async () => {
    const files = (
      await Promise.all(
        scannedRoots.map((directory) =>
          sourceFiles(path.join(root, directory)),
        ),
      )
    ).flat();
    const offendingFiles: string[] = [];

    for (const file of files) {
      if (file.endsWith(path.join("lib", "supabase", "admin.ts"))) continue;
      const source = await readFile(file, "utf8");
      if (
        /from\s+["'][^"']*supabase\/admin["']|require\(["'][^"']*supabase\/admin["']\)/.test(
          source,
        )
      )
        offendingFiles.push(path.relative(root, file));
    }

    expect(offendingFiles).toEqual([]);
  });
});
