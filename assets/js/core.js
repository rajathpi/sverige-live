/* Sverige Live: shared helpers for every dashboard (plain script, no build step).
   Exposes window.SL. Pages load D3 themselves when they need charts. */
(function () {
  "use strict";
  const root = document.documentElement;
  const KEY = "sverige-live-theme";

  /* ---------- theme: light / dark / follow the OS ---------- */
  try { const t = localStorage.getItem(KEY); if (t) root.setAttribute("data-theme", t); } catch (e) { /* storage blocked */ }
  const isDark = () => root.getAttribute("data-theme") === "dark" || (!root.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
  const themeListeners = [];
  function wireTheme() {
    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    const label = () => (btn.textContent = isDark() ? "☀ Light" : "☾ Dark");
    label();
    btn.addEventListener("click", () => {
      const next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
      label();
      themeListeners.forEach((f) => f());
    });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { label(); themeListeners.forEach((f) => f()); });
  }
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
  const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Stockholm" });
  const fmtDate = (d) => dateFmt.format(d instanceof Date ? d : new Date(d));
  const fmtTime = (d) => timeFmt.format(d instanceof Date ? d : new Date(d));
  function timeAgo(d) {
    const s = (Date.now() - new Date(d).getTime()) / 1000;
    if (s < 60) return "just now";
    if (s < 3600) return Math.round(s / 60) + " min ago";
    if (s < 86400) return Math.round(s / 3600) + " h ago";
    return Math.round(s / 86400) + " days ago";
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

  window.SL = { fetchJSON, fmt, pct, signed, fmtDate, fmtTime, timeAgo, tip, hideTip, setStatus, onResize, onTheme, css, isDark, esc };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wireTheme); else wireTheme();
})();
