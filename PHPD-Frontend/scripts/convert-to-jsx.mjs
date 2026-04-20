import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { transform } from "sucrase";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(projectRoot, "src");

/**
 * Convert TS/TSX -> JS/JSX using sucrase.
 * - TS types are stripped
 * - TSX JSX is preserved
 * - Output goes next to source files, with extension changed:
 *   - .ts  -> .js
 *   - .tsx -> .jsx
 *
 * After successful conversion, we delete the original .ts/.tsx files.
 */

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      // skip common junk
      if (ent.name === "node_modules" || ent.name === "dist" || ent.name.startsWith(".")) continue;
      out.push(...walk(p));
    } else {
      out.push(p);
    }
  }
  return out;
}

function convertFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const isTs = ext === ".ts";
  const isTsx = ext === ".tsx";
  if (!isTs && !isTsx) return null;

  // Don't convert declaration files
  if (filePath.toLowerCase().endsWith(".d.ts")) return null;

  const code = fs.readFileSync(filePath, "utf8");

  const sucraseTransforms = ["typescript"];
  if (isTsx) sucraseTransforms.push("jsx");

  const res = transform(code, { transforms: sucraseTransforms });

  const outPath = filePath.slice(0, -ext.length) + (isTsx ? ".jsx" : ".js");
  fs.writeFileSync(outPath, res.code, "utf8");
  return { inPath: filePath, outPath };
}

function main() {
  if (!fs.existsSync(srcRoot)) {
    console.error(`src folder not found at ${srcRoot}`);
    process.exit(1);
  }

  const allFiles = walk(srcRoot);
  const converted = [];

  for (const f of allFiles) {
    const r = convertFile(f);
    if (r) converted.push(r);
  }

  if (converted.length === 0) {
    console.log("No .ts/.tsx files found under src/. Nothing to convert.");
    return;
  }

  // Delete originals AFTER we wrote outputs successfully.
  for (const { inPath } of converted) {
    fs.unlinkSync(inPath);
  }

  console.log(`Converted ${converted.length} files.`);
}

main();

