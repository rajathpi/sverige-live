/* Sverige Live: shared helpers for every dashboard (plain script, no build step).
   Exposes window.SL. Pages load D3 themselves when they need charts. */
(function () {
  "use strict";
  const root = document.documentElement;

  /* ---------- theme: the studio-hub slider (assets/js/theme.js) owns it ---------- */
  const isDark = () => root.dataset.theme === "dark";
  const themeListeners = [];
  const fire = () => themeListeners.forEach((f) => f());
  addEventListener("hubthemechange", fire);
  addEventListener("storage", (e) => { if (e.key === "hubTheme") setTimeout(fire, 0); });
  const onTheme = (f) => themeListeners.push(f);
  const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();

  /* ---------- fetching: timeout, retry once, short session cache ---------- */
  async function fetchJSON(url, { timeout = 15000, cacheMinutes = 0, init } = {}) {
    const ck = "sl-cache:" + url;
    if (cacheMinutes) {
      try {
        const hit = JSON.parse(sessionStorage.getItem(ck) || "null");
        if (hit && Date.now() - hit.t < cacheMinutes * 60000) return hit.v;
      } catch (e) { /* ignore */ }
    }
    let lastErr;
    for (let attempt = 0; attempt < 2; attempt++) {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), timeout);
      try {
        const r = await fetch(url, { ...(init || {}), signal: ctl.signal });
        if (!r.ok) throw new Error(`HTTP ${r.status} for ${new URL(url, location.href).host}`);
        const v = await r.json();
        if (cacheMinutes) { try { sessionStorage.setItem(ck, JSON.stringify({ t: Date.now(), v })); } catch (e) { /* quota */ } }
        return v;
      } catch (e) {
        lastErr = e.name === "AbortError" ? new Error("timed out") : e;
      } finally { clearTimeout(timer); }
    }
    throw lastErr;
  }

  /* ---------- formatting (Swedish locale for numbers, English UI text) ---------- */
  const nf = (d = 0) => new Intl.NumberFormat("sv-SE", { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmt = (v, d = 0) => (v == null || !isFinite(v) ? "–" : nf(d).format(v));
  const pct = (v, d = 1) => (v == null || !isFinite(v) ? "–" : nf(d).format(v) + " %");
  const signed = (v, d = 1, unit = "") => (v == null || !isFinite(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "±") + nf(d).format(Math.abs(v)) + unit);
  const sv = () => document.documentElement.lang === "sv";
  const dateFmt = { en: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }), sv: new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short", year: "numeric" }) };
  const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Stockholm" });
  const fmtDate = (d) => dateFmt[sv() ? "sv" : "en"].format(d instanceof Date ? d : new Date(d));
  const fmtTime = (d) => timeFmt.format(d instanceof Date ? d : new Date(d));
  function timeAgo(d) {
    const s = (Date.now() - new Date(d).getTime()) / 1000, n = (v) => Math.round(v);
    if (sv()) return s < 60 ? "nyss" : s < 3600 ? n(s / 60) + " min sedan" : s < 86400 ? n(s / 3600) + " h sedan" : n(s / 86400) === 1 ? "1 dag sedan" : n(s / 86400) + " dagar sedan";
    return s < 60 ? "just now" : s < 3600 ? n(s / 60) + " min ago" : s < 86400 ? n(s / 3600) + " h ago" : n(s / 86400) === 1 ? "1 day ago" : n(s / 86400) + " days ago";
  }

  /* ---------- tooltip shared by all charts ---------- */
  let tipEl;
  function tip(e, html) {
    if (!tipEl) { tipEl = document.createElement("div"); tipEl.className = "tooltip"; document.body.appendChild(tipEl); }
    tipEl.innerHTML = html;
    tipEl.style.opacity = 1;
    const w = tipEl.offsetWidth;
    tipEl.style.left = Math.min(innerWidth - w - 8, e.clientX + 14) + "px";
    tipEl.style.top = Math.min(innerHeight - tipEl.offsetHeight - 8, e.clientY + 14) + "px";
  }
  const hideTip = () => tipEl && (tipEl.style.opacity = 0);

  /* ---------- status line ("Live · updated 2 min ago") ---------- */
  function setStatus(el, state, text) {
    if (!el) return;
    el.className = "status" + (state === "ok" ? "" : " " + state);
    el.innerHTML = `<span class="dot" aria-hidden="true"></span><span>${text}</span>`;
  }

  /* ---------- redraw on resize, debounced ---------- */
  function onResize(f, ms = 150) { let t; addEventListener("resize", () => { clearTimeout(t); t = setTimeout(f, ms); }); }

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- language: one choice for every page, ?lang= wins, then the stored choice ---------- */
  const lang = () => (root.lang === "sv" ? "sv" : "en");
  function initLang() {
    let l = new URLSearchParams(location.search).get("lang");
    try { l = l || localStorage.getItem("slLang") || localStorage.getItem("lonLang"); } catch (e) { /* storage blocked */ }
    root.lang = l === "sv" ? "sv" : "en";
    syncLangSeg();
    return lang();
  }
  function syncLangSeg() { document.querySelectorAll("[data-lang-seg] [data-l]").forEach((b) => b.classList.toggle("on", b.dataset.l === lang())); }
  function setLang(l) {
    l = l === "sv" ? "sv" : "en";
    try { localStorage.setItem("slLang", l); localStorage.setItem("lonLang", l); } catch (e) { /* storage blocked */ }
    if (l === lang()) { syncLangSeg(); return; }
    root.lang = l;
    const p = new URLSearchParams(location.search);
    if (l === "en") p.delete("lang"); else p.set("lang", l);
    const qs = p.toString().replace(/%2C/g, ",");
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
    syncLangSeg();
    dispatchEvent(new CustomEvent("sl:lang", { detail: { lang: l } }));
  }
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-lang-seg] [data-l]"); if (b) setLang(b.dataset.l); });
  // Fills every [data-t] element from TEXT[lang][key]; values may hold inline HTML.
  function applyText(TEXT, scope = document) {
    const d = TEXT[lang()] || TEXT.en;
    scope.querySelectorAll("[data-t]").forEach((el) => { const v = d[el.dataset.t] ?? TEXT.en[el.dataset.t]; if (v != null) el.innerHTML = v; });
  }
  const translator = (TEXT) => (k, vars) => {
    let s = (TEXT[lang()] && TEXT[lang()][k]) ?? TEXT.en[k] ?? k;
    if (vars && typeof s === "string") for (const [a, b] of Object.entries(vars)) s = s.split("{" + a + "}").join(b);
    return s;
  };

  /* ---------- "Show as table" under a chart: build() returns {caption, cols, rows}; it reruns whenever the chart redraws ---------- */
  const TBL = { en: ["Show as table", "Hide table"], sv: ["Visa som tabell", "Dölj tabell"] };
  function tableToggle(chartEl, build) {
    if (!chartEl || chartEl.dataset.tbl) return;
    chartEl.dataset.tbl = "1";
    const btn = document.createElement("button"), box = document.createElement("div");
    btn.type = "button"; btn.className = "lnk tbl-tog"; btn.setAttribute("aria-expanded", "false");
    box.className = "dtable"; box.hidden = true;
    chartEl.after(btn, box);
    const label = () => (btn.textContent = TBL[lang()][box.hidden ? 0 : 1]);
    const render = () => {
      if (box.hidden) return;
      let d; try { d = build(); } catch (e) { d = null; }
      if (!d || !d.rows || !d.rows.length) { box.innerHTML = `<p class="empty">–</p>`; return; }
      const cell = (v) => (typeof v === "number" ? fmt(v, Number.isInteger(v) ? 0 : 1) : esc(v ?? "–"));
      box.innerHTML = `<table>${d.caption ? `<caption>${esc(d.caption)}</caption>` : ""}<thead><tr>${d.cols.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>` +
        `<tbody>${d.rows.map((r) => `<tr>${r.map((v, i) => (i === 0 ? `<th scope="row">${cell(v)}</th>` : `<td>${cell(v)}</td>`)).join("")}</tr>`).join("")}</tbody></table>`;
    };
    btn.addEventListener("click", () => { box.hidden = !box.hidden; btn.setAttribute("aria-expanded", String(!box.hidden)); label(); render(); });
    let t; new MutationObserver(() => { clearTimeout(t); t = setTimeout(render, 60); }).observe(chartEl, { childList: true });
    addEventListener("sl:lang", () => { label(); render(); });
    addEventListener("lon:lang", () => { label(); render(); });
    label();
  }

  /* ---------- the shared top nav follows <html lang>, whichever script set it ---------- */
  const NAV = { economy: ["Economy", "Ekonomi"], goteborg: ["Göteborg", "Göteborg"], kommuner: ["Kommuner", "Kommuner"], loner: ["Löner", "Löner"], netto: ["Netto", "Netto"] };
  function navText() {
    document.querySelectorAll(".nav a").forEach((a) => { const k = (a.getAttribute("href") || "").replace(/\.\.\/|\//g, ""); if (NAV[k]) a.textContent = NAV[k][lang() === "sv" ? 1 : 0]; });
  }
  new MutationObserver(navText).observe(root, { attributes: true, attributeFilter: ["lang"] });
  addEventListener("DOMContentLoaded", navText);

  window.SL = { fetchJSON, fmt, pct, signed, fmtDate, fmtTime, timeAgo, tip, hideTip, setStatus, onResize, onTheme, css, isDark, esc, lang, initLang, setLang, applyText, translator, tableToggle };
})();
