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

const replacements = [
  // Hex palette replacements (remove blue/azure)
  { from: /#4DA9E0\b/g, to: "#2F8F6C" }, // light green accent
  { from: /#00629B\b/g, to: "#0F4B3A" }, // dark logo green
  { from: /#2563eb\b/g, to: "#0F4B3A" }, // tailwind blue-600 hex

  // Tailwind class replacements
  { from: /\bbg-blue-950\b/g, to: "bg-emerald-950" },
  { from: /\bbg-blue-900\b/g, to: "bg-emerald-900" },
  { from: /\bbg-blue-700\b/g, to: "bg-emerald-700" },
  { from: /\bbg-blue-600\b/g, to: "bg-emerald-700" },
  { from: /\bbg-blue-500\b/g, to: "bg-emerald-600" },
  { from: /\bbg-blue-400\b/g, to: "bg-emerald-500" },
  { from: /\bbg-blue-100\b/g, to: "bg-emerald-100" },
  { from: /\bbg-blue-50\b/g, to: "bg-emerald-50" },

  { from: /\btext-blue-300\b/g, to: "text-emerald-300" },
  { from: /\btext-blue-400\b/g, to: "text-emerald-300" },
  { from: /\btext-blue-500\b/g, to: "text-emerald-600" },
  { from: /\btext-blue-600\b/g, to: "text-emerald-700" },
  { from: /\btext-blue-700\b/g, to: "text-emerald-800" },
  { from: /\btext-blue-900\b/g, to: "text-emerald-900" },

  { from: /\bborder-blue-800\b/g, to: "border-emerald-800" },
  { from: /\bborder-blue-200\b/g, to: "border-emerald-200" },

  // sky -> emerald (common for accents)
  { from: /\bbg-sky-950\b/g, to: "bg-emerald-950" },
  { from: /\bbg-sky-500\b/g, to: "bg-emerald-600" },
  { from: /\bbg-sky-50\b/g, to: "bg-emerald-50" },
  { from: /\btext-sky-300\b/g, to: "text-emerald-300" },
  { from: /\btext-sky-700\b/g, to: "text-emerald-800" },
  { from: /\btext-sky-900\b/g, to: "text-emerald-900" },
  { from: /\bborder-l-sky-600\b/g, to: "border-l-emerald-700" },
  { from: /\bborder-l-sky-500\b/g, to: "border-l-emerald-700" },

  // inline HSL teal -> green (AuthPage)
  { from: /hsl\(202 100% 22%\)/g, to: "hsl(163 66% 16%)" },
  { from: /hsl\(202 100% 30%\)/g, to: "hsl(163 66% 19%)" },
  { from: /hsl\(202 100% 36%\)/g, to: "hsl(162 55% 26%)" },
  { from: /hsl\(202 100% 45%\)/g, to: "hsl(160 38% 36%)" },
  { from: /hsl\(202 100% 50%\)/g, to: "hsl(160 38% 40%)" },
  { from: /hsl\(202 100% 55%\)/g, to: "hsl(160 38% 55%)" },
  { from: /hsl\(202 100% 25%\)/g, to: "hsl(163 66% 18%)" },
  { from: /hsl\(202 100% 24%\)/g, to: "hsl(163 66% 17%)" },
  { from: /hsl\(202 100% 18%\)/g, to: "hsl(163 66% 12%)" },
];

function shouldProcess(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext === ".js" || ext === ".jsx" || ext === ".css";
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  let next = original;
  for (const r of replacements) {
    next = next.replace(r.from, r.to);
  }
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

