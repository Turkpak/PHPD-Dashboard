import fs from "node:fs";
import path from "node:path";
import process from "node:process";

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

function hasReactImport(code) {
  // Matches:
  // - import React from "react";
  // - import * as React from "react";
  // - import React, { useEffect } from "react";
  return /\bimport\s+(?:\*\s+as\s+React|React(?:\s*,\s*\{[^}]*\})?)\s+from\s+["']react["']\s*;?/m.test(code);
}

function normalizeSucraseHeader(code) {
  // Sucrase sometimes emits: const _jsxFileName = "";import ...
  // Make it two lines for valid ESM parsing.
  if (code.startsWith('const _jsxFileName = "";import ')) {
    return code.replace('const _jsxFileName = "";import ', 'const _jsxFileName = "";\nimport ');
  }
  // More general: only fix the first `;import ` when it's on the first line
  const firstNewline = code.indexOf("\n");
  const head = firstNewline === -1 ? code : code.slice(0, firstNewline);
  if (head.includes(";import ")) {
    return code.replace(";import ", ";\nimport ");
  }
  return code;
}

function insertReactImport(code) {
  const importLine = 'import React from "react";\n';

  if (hasReactImport(code)) return code;

  if (code.startsWith('const _jsxFileName = "";\n')) {
    const idx = code.indexOf("\n"); // end of first line
    return code.slice(0, idx + 1) + importLine + code.slice(idx + 1);
  }

  return importLine + code;
}

function shouldFix(filePath, code) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== ".js" && ext !== ".jsx") return false;
  return code.includes("React.createElement(");
}

function fixFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  if (!shouldFix(filePath, original)) return { changed: false };

  let next = original;
  next = normalizeSucraseHeader(next);
  next = insertReactImport(next);

  if (next !== original) {
    fs.writeFileSync(filePath, next, "utf8");
    return { changed: true };
  }
  return { changed: false };
}

function main() {
  if (!fs.existsSync(srcRoot)) {
    console.error(`src folder not found at ${srcRoot}`);
    process.exit(1);
  }

  const files = walk(srcRoot);
  let touched = 0;
  let scanned = 0;

  for (const f of files) {
    scanned++;
    const res = fixFile(f);
    if (res.changed) touched++;
  }

  console.log(`Scanned ${scanned} files. Updated ${touched} files.`);
}

main();

