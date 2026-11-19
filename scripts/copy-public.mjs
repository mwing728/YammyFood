import { copyFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";

const publicDir = "public";
const distDir = "dist";

if (!existsSync(distDir)) {
  console.error("dist/ missing — run expo export first");
  process.exit(1);
}

if (!existsSync(publicDir)) process.exit(0);

for (const file of readdirSync(publicDir)) {
  copyFileSync(join(publicDir, file), join(distDir, file));
  console.log(`Copied public/${file} → dist/${file}`);
}