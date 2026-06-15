import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceDir = join(rootDir, "node_modules", "cesium", "Build", "Cesium");
const targetDir = join(rootDir, "public", "cesium");

if (!existsSync(sourceDir)) {
  throw new Error(`Cesium build assets not found: ${sourceDir}`);
}

mkdirSync(targetDir, { recursive: true });

for (const name of ["Assets", "ThirdParty", "Widgets", "Workers"]) {
  cpSync(join(sourceDir, name), join(targetDir, name), {
    recursive: true,
    force: true
  });
}

for (const name of ["Cesium.js", "Cesium.js.map"]) {
  const sourceFile = join(sourceDir, name);
  if (existsSync(sourceFile)) {
    cpSync(sourceFile, join(targetDir, name), { force: true });
  }
}
