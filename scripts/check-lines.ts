import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT_DIR = process.cwd();
const MAX_LINES = 170;
const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".css",
  ".sh",
  ".yml",
  ".yaml",
  ".mjs",
]);
const IGNORED_DIRS = new Set([".git", "node_modules", ".next", "dist", "build"]);

type OversizedFile = {
  path: string;
  lineCount: number;
};

function walk(currentPath: string, oversized: OversizedFile[]) {
  const entries = readdirSync(currentPath);
  for (const entry of entries) {
    const fullPath = join(currentPath, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      if (IGNORED_DIRS.has(entry)) {
        continue;
      }
      walk(fullPath, oversized);
      continue;
    }

    const extension = fullPath.slice(fullPath.lastIndexOf("."));
    if (!SOURCE_EXTENSIONS.has(extension)) {
      continue;
    }

    const content = readFileSync(fullPath, "utf8");
    const lineCount = content.split(/\r?\n/).length;
    if (lineCount > MAX_LINES) {
      oversized.push({
        path: relative(ROOT_DIR, fullPath),
        lineCount,
      });
    }
  }
}

const oversizedFiles: OversizedFile[] = [];
walk(ROOT_DIR, oversizedFiles);

if (oversizedFiles.length === 0) {
  console.log(`All files are within ${MAX_LINES} lines.`);
  process.exit(0);
}

oversizedFiles.sort((a, b) => b.lineCount - a.lineCount);
console.error(`Found ${oversizedFiles.length} files above ${MAX_LINES} lines:`);
for (const file of oversizedFiles) {
  console.error(`- ${file.path}: ${file.lineCount}`);
}
process.exit(1);
