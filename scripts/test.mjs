import { readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function findTests(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? findTests(path)
      : /\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

// Bun module mocks are process-wide. Isolate files so route mocks cannot
// replace the real modules exercised by the integration tests.
const files = ["app", "components", "lib"].flatMap(findTests).sort();
let failed = 0;
for (const file of files) {
  const result = spawnSync("bun", ["test", file], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) failed++;
}
console.log(`Test files: ${files.length}; failed: ${failed}`);
process.exitCode = failed ? 1 : 0;
