import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, "src");

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === "dist" || ent.name.startsWith(".")) continue;
      out.push(...walk(p));
    } else {
      out.push(p);
    }
  }
  return out;
}

function shouldProcess(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext === ".js" || ext === ".jsx";
}

function fixBoundaries(code) {
  // Ensure static imports are separated from preceding tokens.
  // Examples seen after TS→JSX conversion:
  //   const _jsxFileName = "";import ...
  //   ... }import ...
  //   ... )import ...
  // Insert a newline before `import` in these cases.
  return code
    .replace(/;import\s+/g, ";\nimport ")
    .replace(/}\s*import\s+/g, "}\nimport ")
    .replace(/\)\s*import\s+/g, ")\nimport ");
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  const next = fixBoundaries(original);
  if (next !== original) {
    fs.writeFileSync(filePath, next, "utf8");
    return true;
  }
  return false;
}

function main() {
  if (!fs.existsSync(srcRoot)) {
    console.error(`src folder not found at ${srcRoot}`);
    process.exitCode = 1;
    return;
  }
  const files = walk(srcRoot).filter(shouldProcess);
  let updated = 0;
  for (const f of files) {
    if (processFile(f)) updated++;
  }
  console.log(`Processed ${files.length} files. Updated ${updated} files.`);
}

main();

