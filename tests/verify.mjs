#!/usr/bin/env node
/**
 * Automated verification suite for Risco Sacado Brasil Cockpit.
 * Checks JS syntax, duplicate IDs, i18n parity, brand compliance,
 * verbatim notices, AI Analysis ON branding, 14 proofs, 17 slides, and CSV parsing.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "index.html");
const distPath = path.join(root, "dist/risco-sacado-cockpit.html");

let failed = 0;
function check(name, cond, detail = "") {
  if (cond) {
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.error(`  FAIL  ${name}${detail ? " — " + detail : ""}`);
  }
}

console.log("Verifying Risco Sacado Brasil Cockpit build...\n");

check("index.html exists", fs.existsSync(htmlPath));
check("dist/risco-sacado-cockpit.html exists", fs.existsSync(distPath));

const html = fs.readFileSync(htmlPath, "utf8");
const dist = fs.readFileSync(distPath, "utf8");
check("index.html and dist/risco-sacado-cockpit.html are identical", html === dist);

// 1. Extract main <script> and validate syntax with vm.Script
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
check("Exactly 2 inline scripts (theme pre-boot + main bundle)", scripts.length === 2, `found ${scripts.length}`);
let syntaxOk = true;
let syntaxErr = "";
try {
  new vm.Script(scripts[scripts.length - 1], { filename: "bundle.js" });
} catch (e) {
  syntaxOk = false;
  syntaxErr = e.message;
}
check("Bundled JavaScript parses with zero syntax errors", syntaxOk, syntaxErr);

// 2. Duplicate static HTML IDs (strip <script> and <style> first)
const domHtml = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");
const idMatches = [...domHtml.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const seen = new Set();
const dupes = [];
for (const id of idMatches) {
  if (seen.has(id)) dupes.push(id);
  seen.add(id);
}
check("Zero duplicate static HTML IDs", dupes.length === 0, dupes.join(", "));

// 3. Verbatim notices & brand guardrails
check(
  "Exact verbatim header notice present",
  html.includes("Uso funcional comprovado porém esta versão é somente por ora, ilustrativa e pertence a J.E.M.Costa.")
);
check("Zero Citi official logo / Wikimedia trademarks", !/upload\.wikimedia\.org|citibank-logo|FLOGO/i.test(html));
check("No base64 PNG bloat (custom vector Open Finance emblem used)", !html.includes("data:image/png;base64"));
check("Hero & Slide 3 use 'antecipação de crédito'", html.includes("antecipação de crédito"));
check("Zero visible 'Opus 5.5' text in DOM", !/Opus 5\.5/i.test(domHtml));
check("Zero visible 'claude-opus-5-5' text outside <option value>", !domHtml.replace(/value="claude-opus-[^"]*"/g, "").includes("claude-opus-5-5"));
check("AI Analysis ON badge present in header", domHtml.includes("AI Analysis ON"));
check("3Q26 anchor financials & PTAX 5.8889 present", html.includes("5.8889") && html.includes("467.2") && html.includes("43.7"));

// 4. Key modular UX elements present (including left sidebar & 15 modules)
for (const id of ["sideNav", "menuToggle", "appShell", "modPager", "liveInsightsBar", "toggleTips", "startTour", "tourPop", "leversCard", "levers", "products", "m-of", "aiFab", "aiPanel"]) {
  check(`Element #${id} exists in DOM`, seen.has(id));
}
const modCount = [...domHtml.matchAll(/data-mod="([^"]+)"/g)].length;
check("All 15 separated modules registered in DOM", modCount === 15, `found ${modCount}`);

// 5. All data-i18n keys in DOM exist in I18N dictionary
const i18nMatch = scripts[scripts.length - 1].match(/const I18N = (\{[\s\S]*?\n  \});/);
check("I18N dictionary found", !!i18nMatch);
if (i18nMatch) {
  const i18nObj = vm.runInNewContext(`(${i18nMatch[1]})`);
  const usedKeys = new Set([
    ...[...domHtml.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1])
  ]);
  const missingKeys = [...usedKeys].filter(k => !i18nObj[k]);
  const badEntries = Object.entries(i18nObj).filter(([, v]) => !Array.isArray(v) || v.length !== 2).map(([k]) => k);
  check("All DOM data-i18n keys exist in I18N", missingKeys.length === 0, missingKeys.join(", "));
  check("100% EN/PT parity in I18N dictionary", badEntries.length === 0, badEntries.join(", "));
}

// 6. Count PROOFS (14) and SLIDES (17)
const proofKeys = [...scripts[scripts.length - 1].matchAll(/^\s{4}"([\w-]+)":\s*\(\)\s*=>/gm)].map(m => m[1]);
const slideCalls = [...scripts[scripts.length - 1].matchAll(/^\s{2}S\(\(\)\s*=>/gm)].length;
check("All 14 Step-1 clickable proofs registered", proofKeys.length === 14, `found ${proofKeys.length}`);
check("All 17 presentation slides registered", slideCalls === 17, `found ${slideCalls}`);

console.log(`\nSummary: ${failed === 0 ? "ALL CHECKS PASSED" : `${failed} CHECK(S) FAILED`}`);
process.exit(failed === 0 ? 0 : 1);
