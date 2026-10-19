// Regenerates the README screenshots (and, with --gifs, the Löner GIFs) in docs/screens,
// and with --og the 1200x630 link-preview images in assets/og instead.
// Usage: node scripts/capture_screens.mjs [--base URL] [--out DIR] [--gifs] [--og]
// Needs `playwright` resolvable (NODE_PATH or a local node_modules); --gifs also needs ffmpeg on PATH.
import { createRequire } from "module";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt; };
const SITE = arg("--base", "http://127.0.0.1:8765").replace(/\/+$/, "");
const OUT = path.resolve(arg("--out", "docs/screens"));
const GIFS = process.argv.includes("--gifs"), OG = process.argv.includes("--og");
const OG_OUT = path.resolve(arg("--out", "assets/og"));
fs.mkdirSync(OG ? OG_OUT : OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DESK = { width: 1280, height: 860 };
const TOUR_KEYS = ["lonTourDone", "slTour:economy", "slTour:goteborg", "slTour:kommuner", "slTour:netto", "slTour:loner"];
// 1280 px at 1.25x is the 1600 px width the README images are laid out for.
const SHOT_SCALE = 1.25;

// Waits until no ".loading" placeholder is visible, or gives up after `ms`.
async function settle(page, ms = 25000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const n = await page.evaluate(() => [...document.querySelectorAll(".loading")].filter((e) => e.offsetParent).length);
    if (!n) break;
    await sleep(400);
  }
  await sleep(800);
}
async function open(browser, url, { vp = DESK, dark = false, tourDone = true, scale = SHOT_SCALE, video = null } = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: scale, colorScheme: dark ? "dark" : "light", recordVideo: video ? { dir: video, size: vp } : undefined });
  await ctx.addInitScript(([d, td, keys]) => {
    try {
      localStorage.setItem("hubTheme", d ? "dark" : "light");
      for (const k of keys) { if (td) localStorage.setItem(k, "1"); else localStorage.removeItem(k); }
    } catch (e) { /* storage blocked */ }
  }, [dark, tourDone, TOUR_KEYS]);
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  return { ctx, page };
}
async function shot(browser, name, url, opts = {}) {
  const { ctx, page } = await open(browser, url, opts);
  await settle(page);
  await page.screenshot({ path: path.join(opts.out || OUT, name + ".png") });
  console.log("wrote", name + ".png");
  await ctx.close();
}
// Records a short interaction and turns it into a palette-optimised GIF with ffmpeg.
async function gif(browser, name, url, steps, opts = {}) {
  const dir = fs.mkdtempSync(path.join(OUT, ".vid-"));
  try {
    const { ctx, page } = await open(browser, url, { ...opts, scale: 1, video: dir });
    const t0 = Date.now();
    await settle(page);
    const start = (Date.now() - t0) / 1000;
    await steps(page);
    await ctx.close();
    const webm = fs.readdirSync(dir).find((f) => f.endsWith(".webm"));
    const w = opts.gifWidth || 760;
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(Math.max(0, start - 0.3)), "-i", path.join(dir, webm), "-vf", `fps=8,scale=${w}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`, path.join(OUT, name + ".gif")]);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  console.log("wrote", name + ".gif", Math.round(fs.statSync(path.join(OUT, name + ".gif")).size / 1024) + " KB");
}
const scrollTo = (page, s, off = 70) => page.evaluate(([s, off]) => { const el = document.querySelector(s); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - off, behavior: "smooth" }); }, [s, off]);
const typeSlow = async (page, sel, text) => { await page.click(sel); for (const ch of text) { await page.keyboard.type(ch); await sleep(110); } };

const browser = await chromium.launch();
const O = "?o=2512,2221,2341";
const PAGES = [["landing", "/"], ["economy", "/economy/"], ["goteborg", "/goteborg/"], ["kommuner", "/kommuner/"], ["loner", `/loner/${O}`], ["netto", "/netto/?sal=42000&k=1480"]];
try {
  if (OG) {
    // Link previews show the top of each page at the size Slack, LinkedIn and iMessage crop to.
    for (const [n, u] of PAGES) await shot(browser, n, SITE + u, { vp: { width: 1200, height: 630 }, scale: 1, out: OG_OUT });
    process.exit(0);
  }
  for (const [n, u] of PAGES) await shot(browser, n, SITE + u);
  await shot(browser, "loner-dark", `${SITE}/loner/${O}`, { dark: true });
  if (GIFS) {
    await gif(browser, "loner-tour", `${SITE}/loner/${O}`, async (p) => {
      for (let i = 0; i < 12; i++) {
        await sleep(i === 0 ? 2600 : 2300);
        const next = p.locator("[data-a=next]").first();
        if (!(await next.count())) break;
        const label = (await next.textContent()) || "";
        await next.click().catch(() => {});
        if (/done/i.test(label)) break;
      }
      await sleep(1000);
    }, { tourDone: false });
    await gif(browser, "loner-compare", `${SITE}/loner/${O}`, async (p) => {
      await sleep(800);
      await typeSlow(p, "#q", "electric");
      await sleep(900); await p.keyboard.press("Enter"); await sleep(2500);
      await scrollTo(p, "#mySal", 300); await sleep(1200);
      await typeSlow(p, "#mySal", "45000"); await sleep(2200);
      await scrollTo(p, "#trend", 120); await sleep(2600);
    });
    await gif(browser, "loner-guide", `${SITE}/loner/${O}`, async (p) => {
      await sleep(800);
      const g = p.locator("button:has-text('Guide')").first();
      if (await g.count()) { await g.click(); await sleep(2200); await p.mouse.wheel(0, 900); await sleep(1800); await p.mouse.wheel(0, 1400); await sleep(2200); }
    });
  }
} finally { await browser.close(); }
