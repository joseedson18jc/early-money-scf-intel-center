#!/usr/bin/env node
/**
 * Zero-dependency bundler for Risco Sacado Brasil Cockpit.
 * Concatenates src/styles/*.css, src/data/*.js, and src/modules/*.js into src/template.html
 * and outputs both ./index.html (GitHub Pages / local double-click) and ./dist/risco-sacado-cockpit.html.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function readOrdered(dir, ext) {
  const full = path.join(root, dir);
  const files = fs.readdirSync(full).filter(f => f.endsWith(ext)).sort();
  return files.map(f => {
    const content = fs.readFileSync(path.join(full, f), "utf8").trimEnd();
    return ext === ".css"
      ? `  /* ===== ${dir}/${f} ===== */\n${content}`
      : `  // ===== ${dir}/${f} =====\n${content}`;
  }).join("\n\n");
}

const template = fs.readFileSync(path.join(root, "src/template.html"), "utf8");
const styles = readOrdered("src/styles", ".css");
const data = readOrdered("src/data", ".js");
const modules = readOrdered("src/modules", ".js");

const scriptBody = `(() => {\n${data}\n\n${modules}\n})();`;

const output = template
  .replace("/* {{STYLES}} */", () => styles)
  .replace("/* {{SCRIPT}} */", () => scriptBody);

const indexPath = path.join(root, "index.html");
const distPath = path.join(root, "dist/risco-sacado-cockpit.html");
fs.mkdirSync(path.dirname(distPath), { recursive: true });
fs.writeFileSync(indexPath, output, "utf8");
fs.writeFileSync(distPath, output, "utf8");

console.log(`Built ${path.relative(root, indexPath)} & ${path.relative(root, distPath)} (${output.length.toLocaleString()} bytes)`);
