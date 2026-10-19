// Smoke test: loads each page in Chromium and reports anything a visitor would see broken.
// Usage: node scripts/check_site.mjs [--base URL] [--pages /economy/,loner] [--report FILE] [--shots DIR]
// Needs `playwright` resolvable (NODE_PATH or a local node_modules).
import { createRequire } from "module";
import fs from "fs";
import path from "path";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt; };
const BASE = arg("--base", "http://127.0.0.1:8765").replace(/\/+$/, "");
const REPORT = arg("--report", "check-report.md");
const SHOTS = arg("--shots", "check-shots");
const ALL = ["/", "/economy/", "/goteborg/", "/kommuner/", "/loner/", "/netto/"];
// A page listed here is skipped, not failed, when its own document answers 404.
const OPTIONAL = new Set(["/netto/"]);
const norm = (p) => { p = p.trim(); if (!p.startsWith("/")) p = "/" + p; return p.endsWith("/") || p.includes(".") ? p : p + "/"; };
const pagesArg = arg("--pages", "");
const PAGES = pagesArg ? pagesArg.split(",").filter(Boolean).map(norm) : ALL;

const LOAD_TIMEOUT_MS = 45000;
const RETRY_DELAY_MS = 20000;
const BAD_TEXT = /\b(NaN|undefined|Infinity)\b|\[object/g;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isFavicon = (u) => /favicon/i.test(u);

async function waitForLoaded(page) {
  const t0 = Date.now();
  const visibleLoading = () => page.evaluate(() => [...document.querySelectorAll(".loading")].filter((e) => e.offsetParent).length);
  while (Date.now() - t0 < LOAD_TIMEOUT_MS) {
    if (!(await visibleLoading())) break;
    await sleep(500);
  }
  // Renders that follow the last fetch land a moment after the placeholders go.
  await sleep(1000);
}

async function checkOnce(browser, route, shotName) {
  const url = BASE + route;
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  await ctx.addInitScript(() => {
    try { for (const k of ["lonTourDone", "slTour:economy", "slTour:goteborg", "slTour:kommuner", "slTour:netto", "slTour:loner"]) localStorage.setItem(k, "1"); } catch (e) { /* storage blocked */ }
  });
  const page = await ctx.newPage();
  const findings = [];
  const add = (kind, detail) => { if (!findings.some((f) => f.kind === kind && f.detail === detail)) findings.push({ kind, detail }); };

  page.on("console", (m) => { if (m.type() === "error" && !isFavicon(m.location().url || "") && !/favicon/i.test(m.text())) add("console error", m.text().slice(0, 300)); });
  page.on("pageerror", (e) => add("uncaught exception", String(e.message || e).slice(0, 300)));
  page.on("requestfailed", (r) => { if (!isFavicon(r.url())) add("request failed", `${r.url()} (${r.failure() ? r.failure().errorText : "unknown"})`); });
  page.on("response", (r) => { if (r.status() >= 400 && !isFavicon(r.url())) add("HTTP " + r.status(), r.url()); });

  let skipped = false;
  try {
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    if (resp && resp.status() === 404 && OPTIONAL.has(route)) { skipped = true; }
    else {
      await waitForLoaded(page);
      const dom = await page.evaluate(() => {
        const vis = (e) => !!e.offsetParent || getComputedStyle(e).position === "fixed";
        const txt = (e) => (e.innerText || "").replace(/\s+/g, " ").trim().slice(0, 200);
        const main = document.querySelector("main") || document.body;
        return {
          errors: [...document.querySelectorAll(".error")].filter(vis).map(txt),
          statusErr: [...document.querySelectorAll(".status.err")].filter(vis).map(txt),
          loading: [...document.querySelectorAll(".loading")].filter(vis).length,
          mainText: main.innerText || "",
        };
      });
      for (const t of dom.errors) add("visible .error", t || "(empty)");
      for (const t of dom.statusErr) add("status line in error state", t || "(empty)");
      if (dom.loading) add("still loading after " + LOAD_TIMEOUT_MS / 1000 + " s", `${dom.loading} element(s) with class loading`);
      const seen = new Set();
      for (const m of dom.mainText.matchAll(BAD_TEXT)) {
        const s = Math.max(0, m.index - 40);
        const ctxText = dom.mainText.slice(s, m.index + m[0].length + 40).replace(/\s+/g, " ").trim();
        if (!seen.has(ctxText)) { seen.add(ctxText); add(`text "${m[0]}"`, "..." + ctxText + "..."); }
      }
      if (findings.length && shotName) {
        fs.mkdirSync(SHOTS, { recursive: true });
        await page.screenshot({ path: path.join(SHOTS, shotName + ".png"), fullPage: false }).catch(() => {});
      }
    }
  } catch (e) {
    add("navigation failed", String(e.message || e).split("\n")[0]);
  }
  await ctx.close();
  return { findings: skipped ? [] : findings, skipped };
}

async function checkPage(browser, route) {
  const name = route === "/" ? "landing" : route.replace(/^\/|\/$/g, "").replace(/\//g, "-");
  let r = await checkOnce(browser, route, null);
  let retried = false;
  if (r.findings.length) {
    retried = true;
    console.log(`  ${route}: ${r.findings.length} finding(s), retrying in ${RETRY_DELAY_MS / 1000} s`);
    await sleep(RETRY_DELAY_MS);
    r = await checkOnce(browser, route, name);
  }
  return { route, name, retried, ...r };
}

const browser = await chromium.launch();
const results = [];
try {
  for (const route of PAGES) {
    console.log(`checking ${BASE}${route}`);
    results.push(await checkPage(browser, route));
  }
} finally { await browser.close(); }

const failed = results.filter((r) => r.findings.length);
const lines = [`# Site check`, "", `Base: ${BASE}`, `Time: ${new Date().toISOString()}`, `Result: ${failed.length ? `FAIL (${failed.length} of ${results.length} pages)` : "ok"}`, ""];
for (const r of results) {
  lines.push(`## ${r.route}`, "");
  if (r.skipped) lines.push("skipped: not deployed (404)");
  else if (!r.findings.length) lines.push("ok" + (r.retried ? " (passed on retry)" : ""));
  else {
    lines.push("FAIL" + (r.retried ? " (also failed on retry)" : ""), "");
    for (const f of r.findings) lines.push(`- **${f.kind}**: ${f.detail.replace(/\n/g, " ")}`);
  }
  lines.push("");
}
fs.writeFileSync(REPORT, lines.join("\n"));

console.log("\n" + lines.join("\n"));
console.log(`report: ${REPORT}`);
process.exit(failed.length ? 1 : 0);
